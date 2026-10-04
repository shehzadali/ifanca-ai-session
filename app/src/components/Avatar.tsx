// Twelve original avatars: a simple motif on a color. Ids are "<motif>-<color>" and are what the leaderboard stores.
import type { ReactNode } from 'react'

const COLORS: Record<string, string> = {
  emerald: '#0f6b55',
  teal: '#0e6a73',
  amber: '#8f5f0d',
  clay: '#ad4428',
  indigo: '#3b4a8f',
  plum: '#7a3e6e',
}

const MOTIFS: Record<string, ReactNode> = {
  star: (
    <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M8 8h8v8H8z" />
      <path d="m12 6.3 5.7 5.7-5.7 5.7L6.3 12z" />
    </g>
  ),
  leaf: (
    <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 18c0-7 4.5-11 12-12 0 8-4 12-12 12z" />
      <path d="M6 18 13 11" />
    </g>
  ),
  lantern: (
    <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M12 4v2M9.5 6h5l1.5 3v6l-1.5 3h-5L8 15V9z" />
      <path d="M8 9h8M8 15h8" />
    </g>
  ),
  palm: (
    <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 19V10" />
      <path d="M12 10c-1.5-2.5-4-3-6-2M12 10c1.5-2.5 4-3 6-2M12 10c-2.5-.5-4.5 1-5 3.5M12 10c2.5-.5 4.5 1 5 3.5" />
    </g>
  ),
  rosette: (
    <g fill="none" stroke="#fff" strokeWidth="1.7">
      <circle cx="12" cy="12" r="2" />
      <path d="M12 6.5a2.6 2.6 0 0 1 0 5.2 2.6 2.6 0 0 1 0-5.2zM12 12.3a2.6 2.6 0 0 1 0 5.2 2.6 2.6 0 0 1 0-5.2zM6.5 12a2.6 2.6 0 0 1 5.2 0 2.6 2.6 0 0 1-5.2 0zM12.3 12a2.6 2.6 0 0 1 5.2 0 2.6 2.6 0 0 1-5.2 0z" />
    </g>
  ),
  hexagon: (
    <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round">
      <path d="m12 5 6 3.5v7L12 19l-6-3.5v-7z" />
      <path d="m12 9 2.6 1.5v3L12 15l-2.6-1.5v-3z" />
    </g>
  ),
  sun: (
    <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 5v1.5M12 17.5V19M5 12h1.5M17.5 12H19M7 7l1 1M16 16l1 1M17 7l-1 1M8 16l-1 1" />
    </g>
  ),
  wave: (
    <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
      <path d="M5 10c1.2-1.2 2.3-1.2 3.5 0s2.3 1.2 3.5 0 2.3-1.2 3.5 0 2.3 1.2 3.5 0" />
      <path d="M5 14.5c1.2-1.2 2.3-1.2 3.5 0s2.3 1.2 3.5 0 2.3-1.2 3.5 0 2.3 1.2 3.5 0" />
    </g>
  ),
  mountain: (
    <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round">
      <path d="m4.5 18 5.5-9 3 5 2-3 4.5 7z" />
    </g>
  ),
  book: (
    <g fill="none" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round">
      <path d="M5 7h5a2 2 0 0 1 2 2v9a1.6 1.6 0 0 0-1.6-1.6H5zM19 7h-5a2 2 0 0 0-2 2v9a1.6 1.6 0 0 1 1.6-1.6H19z" />
    </g>
  ),
  cup: (
    <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10h10v4a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4z" />
      <path d="M16 11h1.5a2 2 0 0 1 0 4H16M9 5.5c0 1-1 1.5-1 2.5M12.5 5.5c0 1-1 1.5-1 2.5" />
    </g>
  ),
  olive: (
    <g fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round">
      <path d="M6 18 17 7" />
      <path d="M9.5 14.5c-2 0-3-1-3-2.5 1.5 0 3 .8 3 2.5zM12.5 11.5c0-2 1-3 2.5-3 0 1.5-.8 3-2.5 3zM12 12c-2 0-3-1-3-2.5 1.5 0 3 .8 3 2.5z" />
      <circle cx="16" cy="12" r="1.4" />
    </g>
  ),
}

export const AVATARS: { id: string; motif: string; color: string; label: string }[] = [
  ['star', 'emerald'],
  ['leaf', 'teal'],
  ['lantern', 'amber'],
  ['palm', 'clay'],
  ['rosette', 'indigo'],
  ['hexagon', 'plum'],
  ['sun', 'amber'],
  ['wave', 'teal'],
  ['mountain', 'indigo'],
  ['book', 'emerald'],
  ['cup', 'clay'],
  ['olive', 'plum'],
].map(([motif, color]) => ({ id: `${motif}-${color}`, motif, color, label: `${motif} on ${color}` }))

export const isAvatar = (id: string | null | undefined) => !!id && AVATARS.some((a) => a.id === id)

// A known avatar, or initials on a neutral color for players without one.
export default function Avatar({ id, name = '', size = 40 }: { id?: string | null; name?: string; size?: number }) {
  const a = AVATARS.find((x) => x.id === id)
  if (!a) {
    const initials = name.trim().split(/\s+/).map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?'
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-line font-bold text-ink"
        style={{ width: size, height: size, fontSize: size * 0.38 }}
        aria-hidden="true"
        data-avatar="initials"
      >
        {initials}
      </span>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0" aria-hidden="true" data-avatar={a.id}>
      <circle cx="12" cy="12" r="12" fill={COLORS[a.color]} />
      {MOTIFS[a.motif]}
    </svg>
  )
}

export function AvatarPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-3" role="radiogroup" aria-label="Avatar">
      {AVATARS.map((a) => {
        const on = a.id === value
        return (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={a.label}
            onClick={() => onChange(a.id)}
            className={`flex aspect-square items-center justify-center rounded-2xl border-2 bg-card transition ${
              on ? 'border-gold ring-2 ring-gold/40' : 'border-line'
            }`}
            data-testid="avatar-option"
          >
            <Avatar id={a.id} size={52} />
          </button>
        )
      })}
    </div>
  )
}
