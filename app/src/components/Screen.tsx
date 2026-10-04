import type { ReactNode } from 'react'
import Snapshot from './Snapshot'

type Props = {
  title: string
  back?: { href: string; label: string }
  snapshot?: string
  sourceUrl?: string
  children: ReactNode
}

export default function Screen({ title, back, snapshot, sourceUrl, children }: Props) {
  const to = back ?? { href: '#/', label: 'Back to home' }
  return (
    <section>
      <a href={to.href} className="-ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-sm font-medium text-brand">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
        {to.label}
      </a>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
      {snapshot && (
        <div className="mt-1">
          <Snapshot date={snapshot} sourceUrl={sourceUrl} />
        </div>
      )}
      <div className="mt-4">{children}</div>
    </section>
  )
}
