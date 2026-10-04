import { useEffect, useState } from 'react'

export type Dataset<T> = {
  crawl_date: string
  note: string
  source: string
  count: number
  items: T[]
}

// One fetch per file per session. Screens that share a file share the promise.
const cache = new Map<string, Promise<unknown>>()

export function loadData<T>(file: string): Promise<T> {
  let p = cache.get(file)
  if (!p) {
    p = fetch(`/data/${file}`).then((r) => {
      if (!r.ok) throw new Error(`Could not load ${file}`)
      return r.json()
    })
    p.catch(() => cache.delete(file))
    cache.set(file, p)
  }
  return p as Promise<T>
}

export type Loaded<T> = { data: T | null; error: string | null }

export function useData<T>(file: string): Loaded<T> {
  const [state, setState] = useState<Loaded<T>>({ data: null, error: null })
  useEffect(() => {
    let live = true
    loadData<T>(file)
      .then((data) => live && setState({ data, error: null }))
      .catch((e: Error) => live && setState({ data: null, error: e.message }))
    return () => {
      live = false
    }
  }, [file])
  return state
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&#39;': "'",
  '&nbsp;': ' ',
}

export function decodeEntities(s: string): string {
  if (!s.includes('&')) return s
  return s
    .replace(/&(amp|lt|gt|quot|nbsp|#0?39);/g, (m) => ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// "2026-10-03" to "October 3, 2026". Parsed by hand so the time zone cannot shift the day.
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return iso
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`
}

// Lowercase, strip accents, and collapse spaces, for search matching.
export function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
}

export function terms(query: string): string[] {
  return fold(query).trim().split(' ').filter(Boolean)
}
