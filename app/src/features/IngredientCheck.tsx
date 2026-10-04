import { useMemo, useState } from 'react'
import NotInList from '../components/NotInList'
import Screen from '../components/Screen'
import { useData } from '../lib/data'
import { buildMatchers, checkText, suggest, type Ingredient, type IngredientData, type Matcher } from '../lib/ingredients'
import IngredientCard from './IngredientCard'

const SOURCE = 'https://ifanca.org/faqs/'

const TABS = [
  { id: '', label: 'One ingredient' },
  { id: 'paste', label: 'Paste a list' },
  { id: 'photo', label: 'Photo' },
]

export default function IngredientCheck({ params }: { params: string[] }) {
  const { data, error } = useData<IngredientData>('ingredients.json')
  const matchers = useMemo(() => (data ? buildMatchers(data.items) : null), [data])
  const tab = TABS.some((t) => t.id === params[0]) ? params[0] : ''

  return (
    <Screen title="Check ingredients" snapshot={data?.crawl_date ?? '2026-10-03'} sourceUrl={SOURCE}>
      <p className="text-[15px] text-muted" data-testid="no-verdict">
        This shows what IFANCA has published about each ingredient. It is not a verdict on the product.
      </p>

      <nav className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-line/60 p-1" aria-label="Ways to check">
        {TABS.map((t) => (
          <a
            key={t.id}
            href={`#/ingredients${t.id ? `/${t.id}` : ''}`}
            aria-current={tab === t.id ? 'page' : undefined}
            className={`flex min-h-11 items-center justify-center rounded-lg text-center text-[14px] font-medium ${
              tab === t.id ? 'bg-card text-ink shadow-sm' : 'text-muted'
            }`}
          >
            {t.label}
          </a>
        ))}
      </nav>

      {error && <p className="mt-4">The ingredient list could not load. Check your connection and try again.</p>}
      {!matchers && !error && <p className="mt-4 text-muted">Loading...</p>}

      {matchers && data && (
        <div className="mt-4">
          {tab === '' && <OneIngredient matchers={matchers} items={data.items} />}
          {tab === 'paste' && <PasteList matchers={matchers} />}
        </div>
      )}
    </Screen>
  )
}

function OneIngredient({ matchers, items }: { matchers: Matcher[]; items: Ingredient[] }) {
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<Ingredient | null>(null)
  const options = useMemo(() => suggest(query, matchers), [query, matchers])
  const sorted = useMemo(() => [...items].sort((a, b) => a.name.localeCompare(b.name)), [items])

  const pick = (item: Ingredient) => {
    setPicked(item)
    setQuery(item.name)
  }

  return (
    <div>
      <label className="block">
        <span className="mb-1 block text-[13px] font-medium text-muted">Ingredient name</span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPicked(null)
          }}
          placeholder="For example gelatin or E471"
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-line bg-card px-4 text-[17px] outline-none focus:border-brand"
        />
      </label>

      {!picked && query.trim() && options.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-xl border border-line bg-card" data-testid="suggestions">
          {options.slice(0, 10).map((o) => (
            <li key={o.name} className="border-b border-line last:border-0">
              <button type="button" onClick={() => pick(o)} className="flex min-h-12 w-full items-center px-4 text-left text-[16px]">
                {o.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!picked && query.trim().length > 1 && options.length === 0 && (
        <div className="mt-3 rounded-xl border border-line bg-card p-4">
          <NotInList />
          <p className="mt-2 text-[14px] text-muted">
            The app only knows the ingredients IFANCA names in its FAQs and its two shopper guides.
          </p>
        </div>
      )}

      {picked && (
        <div className="mt-3">
          <IngredientCard item={picked} />
        </div>
      )}

      {!query.trim() && (
        <details className="mt-4 rounded-xl border border-line bg-card">
          <summary className="flex min-h-12 cursor-pointer items-center px-4 font-medium">
            Browse all {items.length} ingredients
          </summary>
          <ul className="border-t border-line">
            {sorted.map((o) => (
              <li key={o.name} className="border-b border-line last:border-0">
                <button type="button" onClick={() => pick(o)} className="flex min-h-11 w-full items-center px-4 text-left">
                  {o.name}
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}

function PasteList({ matchers }: { matchers: Matcher[] }) {
  const [text, setText] = useState('')
  const [checked, setChecked] = useState<string | null>(null)
  return (
    <div>
      <TextCheck
        text={text}
        onChange={setText}
        onCheck={() => setChecked(text)}
        label="Ingredient list"
        placeholder="Paste the ingredient list from the label"
      />
      {checked !== null && <Results text={checked} matchers={matchers} />}
    </div>
  )
}

export function TextCheck(props: {
  text: string
  onChange: (t: string) => void
  onCheck: () => void
  label: string
  placeholder?: string
  note?: string
}) {
  return (
    <div>
      <label className="block">
        <span className="mb-1 block text-[13px] font-medium text-muted">{props.label}</span>
        {props.note && <span className="mb-2 block text-[14px] text-ink">{props.note}</span>}
        <textarea
          value={props.text}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          rows={6}
          className="w-full rounded-xl border border-line bg-card p-3 text-[16px] leading-relaxed outline-none focus:border-brand"
        />
      </label>
      <button
        type="button"
        onClick={props.onCheck}
        disabled={!props.text.trim()}
        className="mt-2 h-12 w-full rounded-xl bg-brand font-semibold text-white disabled:opacity-40"
      >
        Check ingredients
      </button>
    </div>
  )
}

export function Results({ text, matchers }: { text: string; matchers: Matcher[] }) {
  const { items, notFound } = useMemo(() => checkText(text, matchers), [text, matchers])
  return (
    <section className="mt-6" data-testid="results" aria-live="polite">
      <h3 className="text-lg font-semibold">
        IFANCA mentions {items.length} {items.length === 1 ? 'ingredient' : 'ingredients'} from this list
      </h3>
      <p className="mt-1 text-[14px] text-muted">
        Each card quotes what IFANCA published. It is not a verdict on the product.
      </p>
      {notFound.length > 0 && (
        <div className="mt-4 rounded-xl border border-line bg-card p-4" data-testid="not-found">
          <h4 className="font-semibold">Not found ({notFound.length})</h4>
          <NotInList className="mt-1 text-[14px]" />
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {notFound.map((n) => (
              <li key={n} className="rounded-full bg-paper px-3 py-1 text-[14px]" data-testid="not-found-item">
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <IngredientCard key={item.name} item={item} />
        ))}
      </div>
    </section>
  )
}
