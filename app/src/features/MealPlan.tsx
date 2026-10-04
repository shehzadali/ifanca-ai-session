import { useState } from 'react'
import { useStored } from '../lib/storage'
import type { Recipe } from './Cook'

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
type Plan = Record<string, string[]>

// Recipes are stored by URL so the plan survives data updates.
export function useMealPlan() {
  const [plan, setPlan] = useStored<Plan>('thw.mealplan', {})
  const add = (day: string, url: string) =>
    setPlan((p) => ({ ...p, [day]: (p[day] ?? []).includes(url) ? p[day] : [...(p[day] ?? []), url] }))
  const remove = (day: string, url: string) => setPlan((p) => ({ ...p, [day]: (p[day] ?? []).filter((u) => u !== url) }))
  const clear = () => setPlan({})
  const count = DAYS.reduce((n, d) => n + (plan[d]?.length ?? 0), 0)
  return { plan, add, remove, clear, count }
}

export function AddToPlan({ url }: { url: string }) {
  const { plan, add } = useMealPlan()
  const [open, setOpen] = useState(false)
  const [added, setAdded] = useState<string | null>(null)
  const days = DAYS.filter((d) => plan[d]?.includes(url))

  return (
    <div className="mt-4 rounded-xl border border-line bg-card p-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="h-12 w-full rounded-xl bg-brand font-semibold text-on-brand"
      >
        Add to meal plan
      </button>
      {open && (
        <div className="mt-3 grid grid-cols-2 gap-2" data-testid="day-picker">
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                add(d, url)
                setAdded(d)
                setOpen(false)
              }}
              className="min-h-11 rounded-xl border border-line bg-paper text-[15px] font-medium"
            >
              {d}
            </button>
          ))}
        </div>
      )}
      {added && (
        <p className="mt-2 text-[14px]" role="status">
          Added to {added}.{' '}
          <a href="#/cook/plan" className="inline-flex min-h-11 items-center font-medium text-brand underline">
            See the meal plan
          </a>
        </p>
      )}
      {!added && days.length > 0 && <p className="mt-2 text-[13px] text-muted">In your meal plan on {days.join(', ')}.</p>}
    </div>
  )
}

export default function MealPlan({ recipes }: { recipes: Recipe[] }) {
  const { plan, remove, clear, count } = useMealPlan()
  const [confirm, setConfirm] = useState(false)
  const byUrl = new Map(recipes.map((r) => [r.url, r]))

  return (
    <div>
      <p className="text-[15px] text-muted">Assign recipes to days from any recipe page. Saved on this device only.</p>
      <ul className="mt-4 space-y-3">
        {DAYS.map((d) => {
          const items = (plan[d] ?? []).map((u) => byUrl.get(u)).filter((r): r is Recipe => !!r)
          return (
            <li key={d} className="rounded-xl border border-line bg-card p-3" data-testid={`day-${d}`}>
              <h3 className="font-semibold">{d}</h3>
              {items.length === 0 ? (
                <p className="mt-1 text-[14px] text-muted">Nothing planned.</p>
              ) : (
                <ul className="mt-1">
                  {items.map((r) => (
                    <li key={r.url} className="flex items-center gap-2 border-t border-line first:border-0">
                      <a href={`#/cook/${r.slug}`} className="flex min-h-11 flex-1 items-center py-1 text-[15px] font-medium text-brand">
                        {r.title}
                      </a>
                      <button
                        type="button"
                        onClick={() => remove(d, r.url)}
                        className="min-h-11 shrink-0 px-2 text-[14px] text-muted underline"
                        aria-label={`Remove ${r.title} from ${d}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
      {count > 0 &&
        (confirm ? (
          <div className="mt-4 rounded-xl border border-line bg-card p-3">
            <p>Remove all {count} planned meals?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setConfirm(false)} className="h-12 rounded-xl border border-line font-medium">
                Keep them
              </button>
              <button
                type="button"
                onClick={() => {
                  clear()
                  setConfirm(false)
                }}
                className="h-12 rounded-xl bg-ink font-medium text-paper"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} className="mt-4 h-12 w-full rounded-xl border border-line bg-card font-medium">
            Clear the meal plan
          </button>
        ))}
    </div>
  )
}
