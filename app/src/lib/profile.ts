// The player profile on this device: a name and a preset avatar. No password and no server account.
import { useEffect, useState } from 'react'
import { readStored, writeStored } from './storage'

export type Profile = { name: string; avatar: string }
const KEY = 'thw.profile'
const EVENT = 'thw-profile'

export function cleanProfileName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim()
}

// 2 to 20 characters: letters, numbers, spaces, hyphens, apostrophes, periods, or underscores.
// Starts with a letter or number. The database checks the same rule.
export function validProfileName(raw: string): boolean {
  const n = cleanProfileName(raw)
  return n.length >= 2 && n.length <= 20 && /^[\p{L}\p{N}][\p{L}\p{N} .'_-]*$/u.test(n)
}

export function readProfile(): Profile | null {
  const p = readStored<Profile | null>(KEY, null)
  return p && p.name && p.avatar ? p : null
}

export function saveProfile(p: Profile) {
  writeStored(KEY, { name: cleanProfileName(p.name), avatar: p.avatar })
  window.dispatchEvent(new Event(EVENT))
}

// Sign out: the next player on this phone starts fresh, with a new leaderboard entry.
export function signOut() {
  for (const k of [KEY, 'thw.quiz', 'thw.board']) {
    try {
      localStorage.removeItem(k)
    } catch {
      // Storage blocked. Nothing to clear.
    }
  }
  window.dispatchEvent(new Event(EVENT))
  window.dispatchEvent(new Event('thw-quiz'))
}

export function useProfile(): Profile | null {
  const [p, setP] = useState(readProfile)
  useEffect(() => {
    const on = () => setP(readProfile())
    window.addEventListener(EVENT, on)
    window.addEventListener('storage', on)
    return () => {
      window.removeEventListener(EVENT, on)
      window.removeEventListener('storage', on)
    }
  }, [])
  return p
}
