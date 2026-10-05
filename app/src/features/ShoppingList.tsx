import { useMemo } from 'react'
import SectionShell, { RECIPE_TABS } from '../components/SectionShell'
import { buildList, type ShopItem } from '../lib/shopping'
import { useStored } from '../lib/storage'
import { useRecipes } from './Cook'
import { DAYS, useMealPlan } from './MealPlan'

export default function ShoppingList() {
  const { recipes, error } = useRecipes()
  const { plan } = useMealPlan()
  const [ticked, setTicked] = useStored<string[]>('thw.shopping.ticked', [])

  const planned = useMemo(() => {
    if (!recipes) return []
    const byUrl = new Map(recipes.map((r) => [r.url, r]))
    return DAYS.flatMap((d) => plan[d] ?? [])
      .map((u) => byUrl.get(u))
      .filter((r): r is NonNullable<typeof r> => !!r)
  }, [recipes, plan])
  const items = useMemo(() => buildList(planned), [planned])
  const recipeCount = new Set(planned.map((r) => r.slug)).size
  const sorted = [...items.filter((i) => !ticked.includes(i.key)), ...items.filter((i) => ticked.includes(i.key))]
  const toggle = (key: string) => setTicked((t) => (t.includes(key) ? t.filter((k) => k !== key) : [...t, key]))

  return (
    <SectionShell title="Recipes" tone="recipes" tabs={RECIPE_TABS} current="shopping">
      {error && <p>The recipes could not load. Check your connection and try again.</p>}
      {!recipes && !error && <p className="text-muted">Loading...</p>}
      {recipes && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line p-4" data-testid="shopping-empty">
          <p className="text-[15px]">Your meal plan is empty. Add recipes to days first.</p>
          <a href="#/recipes/plan" className="mt-1 inline-flex min-h-11 items-center font-semibold text-brand underline">
            Go to Meal Plan
          </a>
        </div>
      )}
      {recipes && items.length > 0 && (
        <>
          <p className="text-[15px] text-muted">Everything in your meal plan, combined. Saved on this device.</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-[14px] font-semibold text-muted" data-testid="shopping-count">
              {items.length} {items.length === 1 ? 'item' : 'items'} from {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
            </p>
            {ticked.length > 0 && (
              <button type="button" onClick={() => setTicked([])} className="min-h-11 px-2 text-[14px] font-semibold text-brand underline">
                Clear ticks
              </button>
            )}
          </div>
          <ul className="mt-2 overflow-hidden rounded-2xl border border-line bg-card shadow-sm" data-testid="shopping-list">
            {sorted.map((item) => (
              <Item key={item.key} item={item} done={ticked.includes(item.key)} onToggle={() => toggle(item.key)} />
            ))}
          </ul>
        </>
      )}
    </SectionShell>
  )
}

function Item({ item, done, onToggle }: { item: ShopItem; done: boolean; onToggle: () => void }) {
  return (
    <li className="flex gap-2 border-b border-line px-2 py-1.5 last:border-0" data-testid="shop-item" data-key={item.key} data-done={done}>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`Tick ${item.name}`}
        onClick={onToggle}
        className="flex h-11 w-11 shrink-0 items-center justify-center"
      >
        <span className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${done ? 'border-brand bg-brand text-on-brand' : 'border-line bg-card'}`}>
          {done && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
              <path d="m5 12 5 5 9-10" />
            </svg>
          )}
        </span>
      </button>
      <button type="button" onClick={onToggle} className="min-h-11 flex-1 py-1.5 text-left" data-testid="shop-name">
        <span className={`block text-[16px] font-semibold first-letter:uppercase ${done ? 'text-muted line-through' : ''}`}>{item.name}</span>
        <ul className="mt-0.5 space-y-0.5">
          {item.lines.map((l, i) => (
            <li key={i} className="text-[13px] text-muted" data-testid="shop-line">
              <span className="text-ink">{l.text}</span> <span>({l.recipe})</span>
            </li>
          ))}
        </ul>
      </button>
    </li>
  )
}
