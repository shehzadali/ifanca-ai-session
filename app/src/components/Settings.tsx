import { useEffect, useRef, useState, type ReactNode } from 'react'
import { formatDate, loadData } from '../lib/data'
import type { ThemeChoice } from '../lib/theme'
import { CloseIcon } from './Icons'

type Meta = { files: Record<string, { crawl_date: string; count: number }> }

const DATASETS: [string, string][] = [
  ['products.json', 'Certified products'],
  ['ingredients.json', 'Ingredient statements'],
  ['faqs.json', 'FAQ lessons'],
  ['recipes.json', 'Recipes'],
  ['articles.json', 'Articles'],
]

type Props = {
  open: boolean
  onClose: () => void
  theme: ThemeChoice
  setTheme: (t: ThemeChoice) => void
  profile: ReactNode
}

export default function Settings({ open, onClose, theme, setTheme, profile }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const [meta, setMeta] = useState<Meta | null>(null)

  useEffect(() => {
    if (!open) return
    loadData<Meta>('meta.json').then(setMeta).catch(() => setMeta(null))
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45" onClick={onClose}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Profile and settings"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-paper px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl outline-none"
        data-testid="settings"
      >
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-line" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted"
          >
            <CloseIcon />
          </button>
        </div>

        <Group title="Profile">{profile}</Group>

        <Group title="Appearance">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-line/60 p-1" role="radiogroup" aria-label="Appearance">
            {(['system', 'light', 'dark'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={theme === t}
                onClick={() => setTheme(t)}
                className={`min-h-11 rounded-lg text-[14px] font-semibold capitalize ${
                  theme === t ? 'bg-card text-ink shadow-sm' : 'text-muted'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Group>

        <Group title="About">
          <div className="space-y-2 text-[14px]" data-testid="about">
            <p className="font-semibold">Demo built from IFANCA's public content. Not an official IFANCA app.</p>
            <p className="text-muted">Content was copied from ifanca.org on the dates below. It may be out of date.</p>
            {meta && (
              <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                {DATASETS.filter(([f]) => meta.files[f]).map(([f, label]) => (
                  <div key={f} className="contents">
                    <dt className="text-muted">
                      {label} ({meta.files[f].count.toLocaleString('en-US')})
                    </dt>
                    <dd className="text-right">Snapshot {formatDate(meta.files[f].crawl_date)}</dd>
                  </div>
                ))}
              </dl>
            )}
            <a href="https://ifanca.org/" target="_blank" rel="noopener" className="inline-flex min-h-11 items-center font-semibold text-brand underline">
              Visit ifanca.org
            </a>
          </div>
        </Group>
      </div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="mb-2 text-[12px] font-bold tracking-wider text-muted uppercase">{title}</h3>
      <div className="rounded-2xl border border-line bg-card p-3">{children}</div>
    </section>
  )
}
