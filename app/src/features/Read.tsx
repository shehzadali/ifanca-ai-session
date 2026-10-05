import { useMemo, useState } from 'react'
import Chip from '../components/Chip'
import Screen from '../components/Screen'
import ArticleView, { articleSlug } from './ArticleView'
import { decodeEntities, fold, formatDate, terms, useData, type Dataset } from '../lib/data'

type RawArticle = {
  title: string
  url: string
  type: string
  theme: string
  date: string
  first_40_words: string
}
type Article = RawArticle & { haystack: string }

const PAGE = 20

// Display labels for the stored theme values. Order is the chip order.
const THEMES: [string, string][] = [
  ['halal basics', 'Halal basics'],
  ['ingredients', 'Ingredients'],
  ['health and nutrition', 'Health and nutrition'],
  ['industry and certification', 'Industry and certification'],
  ['community and events', 'Community and events'],
  ['other', 'Other'],
]
const themeLabel = (t: string) => THEMES.find(([k]) => k === t)?.[1] ?? t

function prepare(items: RawArticle[]): Article[] {
  return items
    .map((a) => {
      const title = decodeEntities(a.title)
      const preview = decodeEntities(a.first_40_words)
      return { ...a, title, first_40_words: preview, haystack: fold(`${title} ${preview}`) }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export default function Read({ params }: { params: string[] }) {
  const { data, error } = useData<Dataset<RawArticle>>('articles.json')
  const articles = useMemo(() => (data ? prepare(data.items) : null), [data])
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState<string | null>(null)
  const [limit, setLimit] = useState(PAGE)

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const a of articles ?? []) m.set(a.theme, (m.get(a.theme) ?? 0) + 1)
    return m
  }, [articles])

  const results = useMemo(() => {
    if (!articles) return []
    const words = terms(query)
    return articles.filter((a) => (!theme || a.theme === theme) && words.every((w) => a.haystack.includes(w)))
  }, [articles, query, theme])

  // #/read/<slug> opens the article in the app.
  if (params[0] && articles) {
    const article = articles.find((a) => articleSlug(a.url) === params[0])
    if (article) return <ArticleView key={params[0]} article={article} themeLabel={themeLabel(article.theme)} />
  }

  return (
    <Screen tone="read" title="Read">

      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setLimit(PAGE)
        }}
        placeholder="Search articles"
        aria-label="Search articles"
        autoComplete="off"
        className="mt-3 h-12 w-full rounded-2xl border border-line bg-card shadow-sm px-4 text-[17px] outline-none focus:border-brand"
      />

      <div className="mt-3 flex flex-wrap gap-2" data-testid="themes">
        <Chip
          on={theme === null}
          onClick={() => {
            setTheme(null)
            setLimit(PAGE)
          }}
        >
          {`All (${articles?.length ?? 0})`}
        </Chip>
        {THEMES.filter(([k]) => counts.has(k)).map(([k, label]) => (
          <Chip
            key={k}
            on={theme === k}
            onClick={() => {
              setTheme(theme === k ? null : k)
              setLimit(PAGE)
            }}
          >
            {`${label} (${counts.get(k)})`}
          </Chip>
        ))}
      </div>

      {error && <p className="mt-4">The articles could not load. Check your connection and try again.</p>}
      {!articles && !error && <p className="mt-4 text-muted">Loading...</p>}

      {articles && (
        <>
          <p className="mt-4 text-[14px] font-medium text-muted" data-testid="result-count">
            {results.length} {results.length === 1 ? 'article' : 'articles'}
          </p>
          {results.length === 0 && <p className="mt-2">No articles match. Try another word or theme.</p>}
          <ul className="mt-2 space-y-2">
            {results.slice(0, limit).map((a) => (
              <ArticleCard key={a.url} a={a} />
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

function ArticleCard({ a }: { a: Article }) {
  return (
    <li className="rounded-2xl border border-line bg-card shadow-sm p-4" data-testid="article-card" data-url={a.url} data-date={a.date}>
      <p className="text-[14px] font-semibold text-ink" data-testid="article-date">
        Published {formatDate(a.date)}
      </p>
      <h3 className="mt-1 text-[17px] leading-snug font-semibold">
        <a href={`#/read/${articleSlug(a.url)}`} className="-my-[11px] block py-[11px] text-ink hover:underline" data-testid="article-link">
          {a.title}
        </a>
      </h3>
      <p className="mt-1 text-[13px] text-muted">
        <span data-testid="article-type">{a.type}</span>. Theme: <span data-testid="article-theme">{themeLabel(a.theme)}</span>.
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-ink" data-testid="article-preview">{a.first_40_words}</p>
      <div className="mt-1 flex flex-wrap gap-x-4">
        <a href={`#/read/${articleSlug(a.url)}`} className="inline-flex min-h-11 items-center text-[14px] font-bold text-brand underline">
          Read the article
        </a>
        <a href={a.url} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center text-[14px] font-medium text-muted underline">
          Read on ifanca.org
        </a>
      </div>
    </li>
  )
}
