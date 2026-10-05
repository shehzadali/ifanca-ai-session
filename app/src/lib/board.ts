// Room leaderboard on Supabase. The client library loads only when the leaderboard is used.
// Scores always stay on the device first. Posting is a copy for the room screen.
import type { SupabaseClient } from '@supabase/supabase-js'
import { readProfile } from './profile'
import { readStored, writeStored } from './storage'

const URL = import.meta.env.VITE_SUPABASE_URL ?? ''
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
export const boardConfigured = Boolean(URL && KEY)

export type Entry = { id: string; name: string; score: number; level: string | null; updated_at: string; avatar?: string | null }

export type BoardState = {
  deviceId: string
  name: string
  postedTotal: number | null
  pending: { name: string; total: number; level: string | null; avatar?: string | null } | null
}

const KEY_BOARD = 'thw.board'

export function readBoard(): BoardState {
  const s = readStored<Partial<BoardState>>(KEY_BOARD, {})
  const state: BoardState = {
    deviceId: s.deviceId || crypto.randomUUID(),
    name: s.name ?? '',
    postedTotal: s.postedTotal ?? null,
    pending: s.pending ?? null,
  }
  if (!s.deviceId) writeStored(KEY_BOARD, state)
  return state
}

export function writeBoard(state: BoardState) {
  writeStored(KEY_BOARD, state)
  window.dispatchEvent(new Event('thw-board'))
}

// Same rule as the database: 1 to 20 letters, spaces, hyphens, apostrophes, or periods.
export function cleanName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim()
}
export function validName(raw: string): boolean {
  const n = cleanName(raw)
  return n.length >= 1 && n.length <= 20 && /^\p{L}[\p{L} .'-]*$/u.test(n)
}

let client: Promise<SupabaseClient> | null = null
function getClient(): Promise<SupabaseClient> {
  if (!client) {
    client = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } }),
    )
    client.catch(() => (client = null))
  }
  return client
}

export class Refused extends Error {}

// The avatar column comes from supabase/002_profiles.sql. Until the owner runs it, the app falls back to the
// first version of post_score and to a select without the avatar. Set once the fallback is seen.
let legacy = false

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const c = await getClient()
  let { data, error } = await c.rpc(fn, args)
  // PGRST202: no function with these arguments, so the database does not have 002 yet.
  if (error?.code === 'PGRST202' && 'p_avatar' in args) {
    legacy = true
    const { p_avatar: _drop, ...rest } = args
    ;({ data, error } = await c.rpc(fn, rest))
  }
  if (error) {
    // P0001 is an error raised on purpose by the database functions. Anything else is treated as a network problem.
    if (error.code === 'P0001') throw new Refused(error.message)
    // 23505: another player already has this name (supabase/003_unique_names.sql).
    if (error.code === '23505') throw new Refused('name is taken')
    throw new Error(error.message)
  }
  return data as T
}

// Saves the post as pending first, so a failed post can be tried again later.
export async function postScore(name: string, total: number, level: string | null, avatar: string | null = null): Promise<void> {
  const state = readBoard()
  const pending = { name: cleanName(name), total, level, avatar }
  writeBoard({ ...state, name: pending.name, pending })
  await sendPending()
}

let sending: Promise<void> | null = null
export function sendPending(): Promise<void> {
  if (!sending) {
    sending = (async () => {
      const state = readBoard()
      if (!state.pending || !boardConfigured) return
      const p = state.pending
      try {
        const args: Record<string, unknown> = { p_device: state.deviceId, p_name: p.name, p_score: p.total, p_level: p.level }
        if (!legacy) args.p_avatar = p.avatar ?? null
        await rpc('post_score', args)
      } catch (e) {
        // A refused post will not succeed later, so it is not kept as pending.
        if (e instanceof Refused) writeBoard({ ...readBoard(), pending: null })
        throw e
      }
      writeBoard({ ...readBoard(), pending: null, postedTotal: p.total })
    })().finally(() => (sending = null))
  }
  return sending
}

// Try a pending post again on start and whenever the device comes back online.
export function startPendingRetry() {
  if (!boardConfigured) return
  const retry = () => {
    if (readBoard().pending) sendPending().catch(() => {})
  }
  window.addEventListener('online', retry)
  retry()
}

export async function topTen(): Promise<{ entries: Entry[]; total: number }> {
  const c = await getClient()
  const query = (cols: string) =>
    c.from('leaderboard').select(cols, { count: 'exact' }).order('score', { ascending: false }).order('updated_at', { ascending: true }).limit(10)
  let { data, error, count } = await query(legacy ? 'id,name,score,level,updated_at' : 'id,name,score,level,updated_at,avatar')
  // 42703: the avatar column does not exist yet.
  if (error?.code === '42703') {
    legacy = true
    ;({ data, error, count } = await query('id,name,score,level,updated_at'))
  }
  if (error) throw new Error(error.message)
  const entries = data as unknown as Entry[]
  return { entries, total: count ?? entries.length }
}

// True when another player already uses this name on the board. Case is ignored.
// This device's own entry does not count. Offline or on error, returns false and the database decides.
export async function nameTaken(name: string): Promise<boolean> {
  if (!boardConfigured) return false
  try {
    const c = await getClient()
    const clean = cleanName(name).replace(/[\\%_]/g, (ch) => `\\${ch}`)
    const { data, error } = await c.from('leaderboard').select('id,name').ilike('name', clean).limit(1)
    if (error || !data?.length) return false
    const mine = readBoard()
    const myName = readProfile()?.name ?? ''
    return !(mine.postedTotal !== null && myName.toLowerCase() === cleanName(name).toLowerCase())
  } catch {
    return false
  }
}

export async function resetBoard(code: string): Promise<number> {
  return rpc<number>('reset_leaderboard', { p_code: code })
}

// Live changes through Supabase Realtime. Returns a function that stops listening.
export function watchBoard(onChange: () => void, onStatus: (live: boolean) => void): () => void {
  let stop = () => {}
  let stopped = false
  getClient()
    .then((c) => {
      if (stopped) return
      const channel = c
        .channel('leaderboard')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, () => onChange())
        .subscribe((status) => onStatus(status === 'SUBSCRIBED'))
      stop = () => {
        c.removeChannel(channel)
      }
    })
    .catch(() => onStatus(false))
  return () => {
    stopped = true
    stop()
  }
}
