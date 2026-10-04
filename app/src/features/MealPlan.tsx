import { useMemo, useState } from 'react'
import { formatDate, terms } from '../lib/data'
import { ChevronIcon, SearchIcon } from '../components/Icons'
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
          <a href="#/plan" className="inline-flex min-h-11 items-center font-medium text-brand underline">
            See the meal plan
          </a>
        </p>
      )}
      {!added && days.length > 0 && <p className="mt-2 text-[13px] text-muted">In your meal plan on {days.join(', ')}.</p>}
    </div>
  )
}

const SHORT: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
}

// Week view, or one day when a day is given.
export default function MealPlan({ recipes, day }: { recipes: Recipe[]; day?: string }) {
  if (day && DAYS.includes(day)) return <DayView recipes={recipes} day={day} />
  return <WeekView recipes={recipes} />
}

function WeekView({ recipes }: { recipes: Recipe[] }) {
  const { plan, clear, count } = useMealPlan()
  const [confirm, setConfirm] = useState(false)
  const byUrl = new Map(recipes.map((r) => [r.url, r]))

  return (
    <div>
      <p className="text-[15px] text-muted">Tap a day to add recipes. Saved on this device.</p>
      <ul className="mt-4 space-y-2.5">
        {DAYS.map((d) => {
          const items = (plan[d] ?? []).map((u) => byUrl.get(u)).filter((r): r is Recipe => !!r)
          return (
            <li key={d}>
              <a
                href={`#/plan/${d}`}
                className="flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-card p-3 shadow-sm"
                data-testid={`day-${d}`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-[13px] font-bold ${
                    items.length ? 'bg-plan text-white' : 'bg-plan/10 text-plan dark:bg-plan/30 dark:text-ink'
                  }`}
                >
                  {SHORT[d]}
                  <span className="text-[11px] font-semibold opacity-90">{items.length}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{d}</span>
                  <span className="block truncate text-[14px] text-muted">
                    {items.length ? items.map((r) => r.title).join(', ') : 'Nothing planned'}
                  </span>
                </span>
                <span className="text-muted">
                  <ChevronIcon size={20} />
                </span>
              </a>
            </li>
          )
        })}
      </ul>
      {count > 0 &&
        (confirm ? (
          <div className="mt-4 rounded-2xl border border-line bg-card p-3">
            <p>Remove all {count} planned meals?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setConfirm(false)} className="h-12 rounded-xl border border-line font-semibold">
                Keep them
              </button>
              <button
                type="button"
                onClick={() => {
                  clear()
                  setConfirm(false)
                }}
                className="h-12 rounded-xl bg-ink font-semibold text-paper"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} className="mt-4 h-12 w-full rounded-xl border border-line bg-card font-semibold">
            Clear the meal plan
          </button>
        ))}
    </div>
  )
}

function DayView({ recipes, day }: { recipes: Recipe[]; day: string }) {
  const { plan, add, remove } = useMealPlan()
  const [query, setQuery] = useState('')
  const byUrl = useMemo(() => new Map(recipes.map((r) => [r.url, r])), [recipes])
  const planned = (plan[day] ?? []).map((u) => byUrl.get(u)).filter((r): r is Recipe => !!r)
  const results = useMemo(() => {
    const words = terms(query)
    return recipes.filter((r) => words.every((w) => r.haystack.includes(w))).slice(0, 20)
  }, [recipes, query])

  return (
    <div data-testid="day-view">
      <section className="rounded-2xl border border-line bg-card p-3">
        <h3 className="font-bold">Planned for {day}</h3>
        {planned.length === 0 ? (
          <p className="mt-1 text-[14px] text-muted">Nothing planned yet. Search below and tap Add.</p>
        ) : (
          <ul className="mt-1" data-testid="planned">
            {planned.map((r) => (
              <li key={r.url} className="flex items-center gap-2 border-t border-line first:border-0">
                <a href={`#/recipes/${r.slug}`} className="flex min-h-11 flex-1 items-center py-1 text-[15px] font-semibold text-brand">
                  {r.title}
                </a>
                <button
                  type="button"
                  onClick={() => remove(day, r.url)}
                  className="min-h-11 shrink-0 px-2 text-[14px] text-muted underline"
                  aria-label={`Remove ${r.title} from ${day}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <label className="relative mt-4 block">
        <span className="sr-only">Search recipes to add</span>
        <span className="pointer-events-none absolute top-0 left-0 flex h-12 w-11 items-center justify-center text-muted">
          <SearchIcon size={20} />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes to add"
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-line bg-card pr-4 pl-11 text-[17px] outline-none focus:border-brand"
        />
      </label>
      <p className="mt-3 text-[13px] font-semibold text-muted">{query.trim() ? 'Matching recipes' : 'Newest recipes'}</p>
      {results.length === 0 && <p className="mt-2">No recipes match. Try another word.</p>}
      <ul className="mt-2 overflow-hidden rounded-2xl border border-line bg-card" data-testid="add-results">
        {results.map((r) => {
          const added = (plan[day] ?? []).includes(r.url)
          return (
            <li key={r.url} className="flex items-center gap-3 border-b border-line px-3 py-2 last:border-0">
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] leading-snug font-semibold">{r.title}</span>
                <span className="block text-[12px] text-muted">{formatDate(r.date)}</span>
              </span>
              <button
                type="button"
                disabled={added}
                onClick={() => add(day, r.url)}
                className="h-11 min-w-[72px] shrink-0 rounded-xl bg-plan px-3 text-[14px] font-bold text-white disabled:bg-line disabled:text-muted"
                aria-label={added ? `${r.title} added` : `Add ${r.title} to ${day}`}
              >
                {added ? 'Added' : 'Add'}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
