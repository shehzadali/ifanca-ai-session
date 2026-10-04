import type { ReactNode } from 'react'
import Logo from './Logo'
import { PersonIcon } from './Icons'

export default function TopBar({ onSettings, avatar }: { onSettings: () => void; avatar?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-2 py-1">
      <a href="#/" className="flex min-h-11 items-center gap-2.5 text-[16px] font-bold tracking-tight text-ink">
        <Logo size={30} />
        The Halal Way
      </a>
      <button
        type="button"
        onClick={onSettings}
        aria-label="Profile and settings"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card text-muted shadow-sm"
        data-testid="avatar-button"
      >
        {avatar ?? <PersonIcon size={22} />}
      </button>
    </header>
  )
}
