import type { ReactNode } from 'react'
import Screen, { type Tone } from './Screen'

export type SectionTab = { id: string; label: string; href: string }

// A section header with tabs under it, for sections that hold more than one tool.
export default function SectionShell({
  title,
  tone,
  tabs,
  current,
  children,
}: {
  title: string
  tone: Tone
  tabs: SectionTab[]
  current: string
  children: ReactNode
}) {
  return (
    <Screen title={title} tone={tone}>
      <nav
        className="-mt-1 mb-4 grid gap-1 rounded-2xl bg-line/60 p-1"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
        aria-label={`${title} tabs`}
        data-testid="section-tabs"
      >
        {tabs.map((t) => (
          <a
            key={t.id}
            href={t.href}
            aria-current={t.id === current ? 'page' : undefined}
            className={`flex min-h-11 items-center justify-center rounded-xl px-1 text-center text-[15px] font-bold ${
              t.id === current ? 'bg-card text-ink shadow-sm' : 'text-muted'
            }`}
          >
            {t.label}
          </a>
        ))}
      </nav>
      {children}
    </Screen>
  )
}

export const CHECK_TABS: SectionTab[] = [
  { id: 'products', label: 'Products', href: '#/check/products' },
  { id: 'ingredients', label: 'Ingredients', href: '#/check/ingredients' },
]

export const RECIPE_TABS: SectionTab[] = [
  { id: 'recipes', label: 'Recipes', href: '#/recipes' },
  { id: 'plan', label: 'Meal Plan', href: '#/recipes/plan' },
]
