import { useMemo, useState } from 'react'
import Chip from '../components/Chip'
import RecipePhoto from '../components/RecipePhoto'
import ShareButton from '../components/ShareButton'
import Screen from '../components/Screen'
import { AddToPlan, DAYS, useMealPlan } from './MealPlan'
import { isVegetarian } from '../lib/vegetarian'
import { decodeEntities, fold, formatDate, terms, useData, type Dataset } from '../lib/data'

type RawRecipe = {
  title: string
  url: string
  date: string
  ingredients: string[]
  steps: string[]
  image_url: string
  parsed_from: string
}

export type Recipe = RawRecipe & {
  slug: string
  haystack: string
  ingredientCount: number
  mains: string[]
  vegetarian: boolean
}

const PAGE = 30
const MAX_FEW = 8

// A recipe matches a main ingredient when its ingredient lines name it.
const MAINS: [string, RegExp][] = [
  ['Chicken', /\bchicken\b/i],
  ['Beef', /\bbeef\b/i],
  ['Lamb or goat', /\b(lamb|mutton|goat)\b/i],
  ['Fish and seafood', /\b(fish|salmon|tuna|shrimp|prawns?|cod|tilapia|mackerel|sardines?|seafood|halibut|trout)\b/i],
]

export const isHeading = (line: string) => line.trim().endsWith(':')

function prepare(items: RawRecipe[]): Recipe[] {
  return items
    .map((r) => {
      const title = decodeEntities(r.title)
      const lines = r.ingredients.join('\n')
      return {
        ...r,
        title,
        slug: r.url.replace(/\/$/, '').split('/').pop() ?? '',
        haystack: fold(`${title} ${r.ingredients.join(' ')}`),
        ingredientCount: r.ingredients.filter((l) => !isHeading(l)).length,
        mains: MAINS.filter(([, re]) => re.test(lines)).map(([m]) => m),
        vegetarian: isVegetarian(r.ingredients),
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function useRecipes() {
  const { data, error } = useData<Dataset<RawRecipe>>('recipes.json')
  const recipes = useMemo(() => (data ? prepare(data.items) : null), [data])
  return { recipes, error }
}

export default function Cook({ params }: { params: string[] }) {
  const { recipes, error } = useRecipes()
  if (error) return <Screen tone="recipes" title="Recipes">The recipes could not load. Check your connection and try again.</Screen>
  if (!recipes) return <Screen tone="recipes" title="Recipes">Loading...</Screen>
  const recipe = params[0] ? recipes.find((r) => r.slug === params[0]) : undefined
  // Opened from a meal plan day: #/recipes/<slug>/for/<Day>
  const day = params[1] === 'for' && DAYS.includes(params[2]) ? params[2] : undefined
  if (recipe) return <RecipeView recipe={recipe} day={day} />
  return (
    <Screen tone="recipes" title="Recipes">
      <RecipeList recipes={recipes} />
    </Screen>
  )
}

// The recipe list. Also used in a meal plan day, where rows open the recipe for that day.
export function RecipeList({ recipes, linkSuffix = '', intro = true }: { recipes: Recipe[]; linkSuffix?: string; intro?: boolean }) {
  const [query, setQuery] = useState('')
  const [main, setMain] = useState<string | null>(null)
  const [few, setFew] = useState(false)
  const [veg, setVeg] = useState(false)
  const [limit, setLimit] = useState(PAGE)

  const results = useMemo(() => {
    const words = terms(query)
    return recipes.filter(
      (r) =>
        (!main || r.mains.includes(main)) &&
        (!few || r.ingredientCount <= MAX_FEW) &&
        (!veg || r.vegetarian) &&
        words.every((w) => r.haystack.includes(w)),
    )
  }, [recipes, query, main, few, veg])

  const reset = () => setLimit(PAGE)
  const { count } = useMealPlan()

  return (
    <div>
      {intro && <p className="text-[15px] text-muted">Recipes from IFANCA's resource library, newest first.</p>}
      {intro && <a
        href="#/plan"
        className="mt-3 flex h-12 items-center justify-between rounded-2xl border border-line bg-card shadow-sm px-4 font-medium text-brand"
        data-testid="plan-link"
      >
        <span>My meal plan</span>
        <span className="text-[14px] text-muted">{count} planned</span>
      </a>}

      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          reset()
        }}
        placeholder="Search recipes or ingredients"
        aria-label="Search recipes or ingredients"
        autoComplete="off"
        className="mt-3 h-12 w-full rounded-2xl border border-line bg-card shadow-sm px-4 text-[17px] outline-none focus:border-brand"
      />

      <p className="mt-3 text-[13px] font-medium text-muted">Main Ingredient</p>
      <div className="mt-1 flex flex-wrap gap-2" data-testid="main-chips">
        {MAINS.map(([m]) => (
          <Chip
            key={m}
            on={main === m}
            onClick={() => {
              setMain(main === m ? null : m)
              reset()
            }}
          >
            {m}
          </Chip>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Chip
          on={veg}
          onClick={() => {
            setVeg(!veg)
            reset()
          }}
        >
          Vegetarian
        </Chip>
        <Chip
          on={few}
          onClick={() => {
            setFew(!few)
            reset()
          }}
        >
          {`${MAX_FEW} or fewer ingredients`}
        </Chip>
      </div>
      <p className="mt-1 text-[12px] text-muted" data-testid="veg-note">
        Vegetarian: based on the ingredient list. Eggs and dairy are included.
      </p>

      <p className="mt-4 text-[14px] font-medium text-muted" data-testid="result-count">
        {results.length} {results.length === 1 ? 'recipe' : 'recipes'}
      </p>
      {results.length === 0 && <p className="mt-2">No recipes match. Try fewer filters.</p>}
      <ul className="mt-2 overflow-hidden rounded-xl border border-line bg-card empty:hidden">
        {results.slice(0, limit).map((r) => (
          <li key={r.url} className="border-b border-line last:border-0">
            <a href={`#/recipes/${r.slug}${linkSuffix}`} className="block min-h-14 px-4 py-2.5" data-testid="recipe-row" data-url={r.url}>
              <span className="block text-[16px] leading-snug font-medium">{r.title}</span>
              <span className="mt-0.5 block text-[13px] text-muted">
                {formatDate(r.date)}. {r.ingredientCount} ingredients.
              </span>
            </a>
          </li>
        ))}
      </ul>
      {results.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((n) => n + PAGE)}
          className="mt-3 h-12 w-full rounded-xl border border-line bg-card font-medium text-brand"
        >
          Show more
        </button>
      )}
    </div>
  )
}

function RecipeView({ recipe, day }: { recipe: Recipe; day?: string }) {
  const source = (
    <p className="text-[14px] text-muted" data-testid="recipe-source">
      Published {formatDate(recipe.date)} on ifanca.org.{' '}
      <a href={recipe.url} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center font-medium text-brand underline">
        View the original recipe
      </a>
    </p>
  )
  let n = 0
  return (
    <Screen tone="recipes" title={recipe.title} back={day ? { href: `#/plan/${day}`, label: `Back to ${day}` } : { href: '#/recipes', label: 'All recipes' }}>
      {source}
      <ShareButton title={recipe.title} sourceUrl={recipe.url} path={`/#/recipes/${recipe.slug}`} />
      <RecipePhoto src={recipe.image_url} alt={`Photo of ${recipe.title} from ifanca.org`} />
      <AddToPlan url={recipe.url} day={day} />

      <h3 className="mt-5 text-lg font-semibold">Ingredients</h3>
      <ul className="mt-2 space-y-1.5 text-[16px] leading-snug" data-testid="ingredients">
        {recipe.ingredients.map((line, i) =>
          isHeading(line) ? (
            <li key={i} className="pt-2 text-[14px] font-semibold text-muted" data-line>
              {line}
            </li>
          ) : (
            <li key={i} className="flex gap-2" data-line>
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>{line}</span>
            </li>
          ),
        )}
      </ul>

      <h3 className="mt-6 text-lg font-semibold">Steps</h3>
      <ol className="mt-2 space-y-3 text-[16px] leading-relaxed" data-testid="steps">
        {recipe.steps.map((line, i) =>
          isHeading(line) ? (
            <li key={i} className="pt-2 text-[14px] font-semibold text-muted" data-line>
              {line}
            </li>
          ) : (
            <li key={i} className="flex gap-3">
              <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[13px] font-semibold text-brand">
                {++n}
              </span>
              <span data-line>{line}</span>
            </li>
          ),
        )}
      </ol>

      <div className="mt-6 rounded-xl bg-brand-soft p-3">
        <p className="text-[14px]">Recipe text as published by IFANCA.</p>
        {source}
      </div>
    </Screen>
  )
}
