// Matching label text against the ingredient names IFANCA published.
// No status logic lives here. Status comes only from ingredients.json.

export type Statement = {
  status: string
  ifanca_label: string
  source_text: string
  context: string
  url: string
  source_title: string
  source_date: string
}

export type Ingredient = {
  name: string
  status: string | null
  sources_disagree: boolean
  statuses: string[]
  statements: Statement[]
}

export type IngredientData = {
  crawl_date: string
  source: string
  scope_note: string
  count: number
  statement_count: number
  items: Ingredient[]
}

// Shown next to each statement. The words are IFANCA's status terms.
export const STATUS_LABEL: Record<string, string> = {
  halal: 'halal',
  haram: 'haram',
  mashbooh: 'mashbooh (doubtful)',
  'depends on source': 'depends on the source',
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Spelling variants only. These names were merged from several printed spellings in the sources.
const VARIANTS: Record<string, string> = {
  'Artificial and natural flavors':
    '(?:artificial|natural)(?:\\s*(?:and|&|/|or)\\s*(?:artificial|natural))?\\s+flavou?r(?:ing)?s?',
  'Artificial and natural colorings':
    '(?:artificial|natural)(?:\\s*(?:and|&|/|or)\\s*(?:artificial|natural))?\\s+colou?r(?:ing)?s?',
  'Yellow No. 5': 'yellow\\s*(?:no\\.?\\s*|#\\s*)?5',
}

function pattern(name: string): string {
  if (VARIANTS[name]) return VARIANTS[name]
  const e = /^E-(\d+[a-z]?)$/i.exec(name)
  if (e) return `e\\s?-?\\s?${esc(e[1].toLowerCase())}`
  // Drop notes in parentheses, for example "Chymosin (produced using biotechnology)".
  const words = name.replace(/\([^)]*\)/g, '').trim().toLowerCase().split(/[\s-]+/)
  const parts = words.map((w, i) => {
    if (w === 'and' || w === '&') return '(?:and|&|/)'
    const last = i === words.length - 1
    if (last && /[a-z]s$/.test(w) && w.length > 4) return `${esc(w.slice(0, -1))}s?`
    if (last && /[a-z]$/.test(w)) return `${esc(w)}s?`
    return esc(w)
  })
  return parts.join('[\\s/-]*')
}

export type Matcher = { item: Ingredient; re: RegExp }

// Longest names first, so a longer name claims its text before a shorter name inside it.
export function buildMatchers(items: Ingredient[]): Matcher[] {
  return [...items]
    .sort((a, b) => b.name.length - a.name.length)
    .map((item) => ({ item, re: new RegExp(`(?<![a-z0-9])(?:${pattern(item.name)})(?![a-z0-9])`, 'gi') }))
}

export type Match = { item: Ingredient; start: number; end: number; text: string }

export function findMatches(text: string, matchers: Matcher[]): Match[] {
  const taken: [number, number][] = []
  const found: Match[] = []
  for (const { item, re } of matchers) {
    re.lastIndex = 0
    for (const m of text.matchAll(re)) {
      const start = m.index ?? 0
      const end = start + m[0].length
      if (taken.some(([a, b]) => start < b && end > a)) continue
      taken.push([start, end])
      found.push({ item, start, end, text: m[0] })
    }
  }
  return found.sort((a, b) => a.start - b.start)
}

export type CheckResult = { items: Ingredient[]; notFound: string[] }

// Split label text into parts. A part that touches no match goes to the Not found list.
export function checkText(text: string, matchers: Matcher[]): CheckResult {
  const matches = findMatches(text, matchers)
  const items: Ingredient[] = []
  for (const m of matches) if (!items.includes(m.item)) items.push(m.item)

  const notFound: string[] = []
  const splitter = /[,;:()[\]{}\n]+|\.(?=\s|$)/g
  let pos = 0
  const parts: [number, number][] = []
  for (const m of text.matchAll(splitter)) {
    parts.push([pos, m.index ?? 0])
    pos = (m.index ?? 0) + m[0].length
  }
  parts.push([pos, text.length])
  for (const [a, b] of parts) {
    if (matches.some((m) => m.start < b && m.end > a)) continue
    const part = clean(text.slice(a, b))
    if (part && !notFound.some((n) => n.toLowerCase() === part.toLowerCase())) notFound.push(part)
  }
  return { items, notFound }
}

function clean(s: string): string {
  const t = s
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(and|or)\s+/i, '')
    .replace(/^(ingredients?|contains( less than)?( \d+%? or less of)?|less than \d+% of)\s*/i, '')
    .trim()
  if (!/[a-z]/i.test(t) || /^(ingredients?|contains|and|or)$/i.test(t)) return ''
  return t.length > 60 ? `${t.slice(0, 57)}...` : t
}

// Names that contain the typed text, or whose pattern matches it (for example "E471").
export function suggest(query: string, matchers: Matcher[]): Ingredient[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const out = new Set<Ingredient>()
  for (const { item } of matchers) if (item.name.toLowerCase().includes(q)) out.add(item)
  for (const m of findMatches(query, matchers)) out.add(m.item)
  return [...out].sort((a, b) => a.name.localeCompare(b.name))
}

export function groupByStatus(statements: Statement[]): [string, Statement[]][] {
  const groups = new Map<string, Statement[]>()
  for (const s of statements) groups.set(s.status, [...(groups.get(s.status) ?? []), s])
  return [...groups.entries()]
}
