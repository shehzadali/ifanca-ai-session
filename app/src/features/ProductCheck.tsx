import { useDeferredValue, useMemo, useState } from 'react'
import NotInList from '../components/NotInList'
import SectionShell, { CHECK_TABS } from '../components/SectionShell'
import Chip from '../components/Chip'
import { BASE_GROUP, CONSUMER_GROUPS, groupOf, groupRank, type Group } from '../lib/productGroups'
import { decodeEntities, fold, terms, useData, type Dataset } from '../lib/data'

type RawProduct = {
  name: string
  company: string
  category: string
  sold_in: string
  marketplace: string
  url: string
}

type Product = RawProduct & { haystack: string; group: Group; rank: number }

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
      group: groupOf(category, name),
      rank: 0,
    }
  })
  for (const p of products) p.rank = groupRank(p.group)
  // Consumer products first, then ingredients and base materials. Stable, so the list order stays within each.
  products.sort((a, b) => a.rank - b.rank)
  const groupCounts = new Map<Group, number>()
  for (const p of products) groupCounts.set(p.group, (groupCounts.get(p.group) ?? 0) + 1)
  const groupCats = new Map<Group, Set<string>>()
  for (const p of products) groupCats.set(p.group, (groupCats.get(p.group) ?? new Set()).add(p.category))
  const counts = new Map<string, number>()
  for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
  const categories = [...counts.entries()]
    .filter(([c]) => c)
    .sort((a, b) => a[0].localeCompare(b[0]))
  return { products, categories, groupCounts, groupCats }
}

export default function ProductCheck(_: { params: string[] }) {
  const { data, error } = useData<Dataset<RawProduct>>('products.json')
  const prepared = useMemo(() => (data ? prepare(data.items) : null), [data])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [group, setGroup] = useState<Group | ''>('')
  const [limit, setLimit] = useState(PAGE)
  const deferredQuery = useDeferredValue(query)

  const results = useMemo(() => {
    if (!prepared) return []
    const words = terms(deferredQuery)
    return prepared.products.filter(
      (p) =>
        (!group || p.group === group) &&
        (!category || p.category === category) &&
        words.every((w) => p.haystack.includes(w)),
    )
  }, [prepared, deferredQuery, category, group])
  // Before anything is typed or picked, show the category chips instead of 11,642 products.
  const browsing = !query.trim() && !group && !category
  const pickGroup = (g: Group | '') => {
    setGroup(g)
    setCategory('')
    setLimit(PAGE)
  }

  return (
    <SectionShell title="Check" tone="product" tabs={CHECK_TABS} current="products">
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
              className="h-12 w-full rounded-2xl border border-line bg-card shadow-sm px-4 pr-12 text-[17px] outline-none focus:border-brand"
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

        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-muted">Browse by category</p>
          <div className="flex flex-wrap gap-2" data-testid="group-chips">
            {CONSUMER_GROUPS.map((g) => (
              <Chip key={g} on={group === g} onClick={() => pickGroup(group === g ? '' : g)}>
                {`${g} (${(prepared?.groupCounts.get(g) ?? 0).toLocaleString('en-US')})`}
              </Chip>
            ))}
          </div>
          <button
            type="button"
            onClick={() => pickGroup(group === BASE_GROUP ? '' : BASE_GROUP)}
            aria-pressed={group === BASE_GROUP}
            className={`mt-1 min-h-11 text-[14px] underline ${group === BASE_GROUP ? 'font-bold text-brand' : 'text-muted'}`}
            data-testid="base-group"
          >
            {`Also listed: ${BASE_GROUP} (${(prepared?.groupCounts.get(BASE_GROUP) ?? 0).toLocaleString('en-US')})`}
          </button>
        </div>

        <label className="block">
          <span className="mb-1 block text-[13px] font-medium text-muted">Category</span>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setLimit(PAGE)
            }}
            className="h-12 w-full rounded-2xl border border-line bg-card shadow-sm px-3 text-[16px] outline-none focus:border-brand"
          >
            <option value="">{group ? `All of ${group}` : 'All categories'}</option>
            {prepared?.categories.filter(([c]) => !group || prepared.groupCats.get(group)?.has(c)).map(([c, n]) => (
              <option key={c} value={c}>
                {c} ({n.toLocaleString('en-US')})
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="mt-4 text-ink">The product list could not load. Check your connection and try again.</p>}
      {!data && !error && <p className="mt-4 text-muted">Loading the product list...</p>}

      {prepared && browsing && (
        <p className="mt-4 rounded-2xl border border-dashed border-line p-4 text-[15px] text-muted" data-testid="browse-hint">
          Pick a category above, or type a product or company name to search {prepared.products.length.toLocaleString('en-US')} products.
        </p>
      )}

      {prepared && !browsing && (
        <>
          <p className="mt-4 text-[14px] font-medium text-muted" data-testid="result-count" aria-live="polite">
            {results.length.toLocaleString('en-US')} {results.length === 1 ? 'product' : 'products'}
          </p>
          <ul className="mt-2 space-y-2" data-testid="results">
            {results.slice(0, limit).map((p) => (
              <ProductCard key={p.url} p={p} />
            ))}
          </ul>
          {results.length === 0 && (
            <div className="mt-2 rounded-2xl border border-line bg-card shadow-sm p-4" data-testid="empty">
              <NotInList />
              <p className="mt-2 text-[14px] text-muted">
                This list is a copy of IFANCA's website from a past date. Products can be added or removed since then.
              </p>
              <a
                href={SOURCE}
                target="_blank"
                rel="noopener"
                className="mt-1 flex min-h-11 items-center text-[14px] font-medium text-brand underline"
              >
                Search the current list on ifanca.org
              </a>
              <a href="#/check/ingredients" className="flex min-h-11 items-center text-[14px] font-medium text-brand underline">
                Check the ingredients on the label instead
              </a>
            </div>
          )}
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
    </SectionShell>
  )
}

function ProductCard({ p }: { p: Product }) {
  return (
    <li className="rounded-2xl border border-line bg-card shadow-sm p-3" data-testid="product-card">
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
