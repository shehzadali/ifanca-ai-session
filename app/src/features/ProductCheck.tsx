import { useDeferredValue, useMemo, useState } from 'react'
import Screen from '../components/Screen'
import { decodeEntities, fold, terms, useData, type Dataset } from '../lib/data'

type RawProduct = {
  name: string
  company: string
  category: string
  sold_in: string
  marketplace: string
  url: string
}

type Product = RawProduct & { haystack: string }

const PAGE = 50
const SOURCE = 'https://ifanca.org/halal-certified-products/'

function prepare(items: RawProduct[]) {
  const products: Product[] = items.map((p) => {
    const name = decodeEntities(p.name)
    const company = decodeEntities(p.company)
    const category = decodeEntities(p.category)
    return {
      ...p,
      name,
      company,
      category,
      sold_in: decodeEntities(p.sold_in),
      marketplace: decodeEntities(p.marketplace),
      haystack: fold(`${name} ${company} ${category}`),
    }
  })
  const counts = new Map<string, number>()
  for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
  const categories = [...counts.entries()]
    .filter(([c]) => c)
    .sort((a, b) => a[0].localeCompare(b[0]))
  return { products, categories }
}

export default function ProductCheck(_: { params: string[] }) {
  const { data, error } = useData<Dataset<RawProduct>>('products.json')
  const prepared = useMemo(() => (data ? prepare(data.items) : null), [data])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState(PAGE)
  const deferredQuery = useDeferredValue(query)

  const results = useMemo(() => {
    if (!prepared) return []
    const words = terms(deferredQuery)
    return prepared.products.filter(
      (p) => (!category || p.category === category) && words.every((w) => p.haystack.includes(w)),
    )
  }, [prepared, deferredQuery, category])

  return (
    <Screen title="Check a product" snapshot={data?.crawl_date ?? '2026-10-03'} sourceUrl={SOURCE}>
      <p className="mb-3 text-[15px] text-muted">
        Search IFANCA's published list of certified products.
      </p>

      <div className="space-y-3">
        <label className="block">
          <span className="sr-only">Search products</span>
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setLimit(PAGE)
              }}
              placeholder="Product name, company, or category"
              autoComplete="off"
              enterKeyHint="search"
              className="h-12 w-full rounded-xl border border-line bg-card px-4 pr-12 text-[17px] outline-none focus:border-brand"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setLimit(PAGE)
                }}
                aria-label="Clear search"
                className="absolute top-0 right-0 flex h-12 w-12 items-center justify-center text-muted"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            )}
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-[13px] font-medium text-muted">Category</span>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setLimit(PAGE)
            }}
            className="h-12 w-full rounded-xl border border-line bg-card px-3 text-[16px] outline-none focus:border-brand"
          >
            <option value="">All categories</option>
            {prepared?.categories.map(([c, n]) => (
              <option key={c} value={c}>
                {c} ({n.toLocaleString('en-US')})
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="mt-4 text-ink">The product list could not load. Check your connection and try again.</p>}
      {!data && !error && <p className="mt-4 text-muted">Loading the product list...</p>}

      {prepared && (
        <>
          <p className="mt-4 text-[14px] font-medium text-muted" data-testid="result-count" aria-live="polite">
            {results.length.toLocaleString('en-US')} {results.length === 1 ? 'product' : 'products'}
          </p>
          <ul className="mt-2 space-y-2" data-testid="results">
            {results.slice(0, limit).map((p) => (
              <ProductCard key={p.url} p={p} />
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
        </>
      )}
    </Screen>
  )
}

function ProductCard({ p }: { p: Product }) {
  return (
    <li className="rounded-xl border border-line bg-card p-3" data-testid="product-card">
      <p className="text-[16px] leading-snug font-semibold">{p.name}</p>
      <p className="mt-0.5 text-[14px] text-ink">{p.company}</p>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[13px] text-muted">
        <dt>Category</dt>
        <dd className="text-ink" data-testid="card-category">{p.category || 'Not listed'}</dd>
        <dt>Sold in</dt>
        <dd className="text-ink">{p.sold_in || 'Not listed'}</dd>
        {p.marketplace && (
          <>
            <dt>Marketplace</dt>
            <dd className="text-ink">{p.marketplace}</dd>
          </>
        )}
      </dl>
      <a
        href={p.url}
        target="_blank"
        rel="noopener"
        className="mt-1 inline-flex min-h-11 items-center text-[14px] font-medium text-brand underline"
      >
        View on ifanca.org
      </a>
    </li>
  )
}
