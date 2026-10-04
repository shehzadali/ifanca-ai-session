import { lazy, Suspense, useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { loadData } from './lib/data'

const ProductCheck = lazy(() => import('./features/ProductCheck'))
const IngredientCheck = lazy(() => import('./features/IngredientCheck'))

// Screens that are built. Each gets the route segments after its id.
const SCREENS: Record<string, ComponentType<{ params: string[] }>> = {
  product: ProductCheck,
  ingredients: IngredientCheck,
}

type Tile = {
  id: string
  label: string
  blurb: string
  icon: ReactNode
}

const iconProps = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const TILES: Tile[] = [
  {
    id: 'product',
    label: 'Check a product',
    blurb: "Search IFANCA's certified product list",
    icon: (
      <svg {...iconProps}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-4.2-4.2" />
      </svg>
    ),
  },
  {
    id: 'ingredients',
    label: 'Check ingredients',
    blurb: 'See what IFANCA says about an ingredient',
    icon: (
      <svg {...iconProps}>
        <path d="M9 3h6M10 3v5L5 18a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-10V3" />
        <path d="M7.5 14h9" />
      </svg>
    ),
  },
  {
    id: 'learn',
    label: 'Learn halal',
    blurb: "IFANCA's answers to common questions",
    icon: (
      <svg {...iconProps}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
        <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
      </svg>
    ),
  },
  {
    id: 'cook',
    label: 'Cook',
    blurb: "Recipes from IFANCA's resource library",
    icon: (
      <svg {...iconProps}>
        <path d="M4 11h16a8 8 0 0 1-16 0z" />
        <path d="M9 7c0-1.5 1-2 1-3.5M14 7c0-1.5 1-2 1-3.5" />
      </svg>
    ),
  },
  {
    id: 'read',
    label: 'Read',
    blurb: "Articles from IFANCA's resource library",
    icon: (
      <svg {...iconProps}>
        <path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z" />
        <path d="M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" />
      </svg>
    ),
  },
]

function useRoute(): string {
  const read = () => window.location.hash.replace(/^#\/?/, '')
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const onChange = () => {
      setRoute(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

function useCrawlDate(): string | null {
  const [date, setDate] = useState<string | null>(null)
  useEffect(() => {
    loadData<{ crawl_date: string }>('faqs.json')
      .then((d) => setDate(d.crawl_date))
      .catch(() => setDate(null))
  }, [])
  return date
}

function Home() {
  return (
    <ul className="grid grid-cols-2 gap-3">
      {TILES.map((t, i) => (
        <li key={t.id} className={i === 0 ? 'col-span-2' : ''}>
          <a
            href={`#/${t.id}`}
            className="flex h-full min-h-[132px] flex-col gap-3 rounded-2xl border border-line bg-card p-4 shadow-sm transition active:scale-[0.98] active:bg-brand-soft"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
              {t.icon}
            </span>
            <span>
              <span className="block text-[17px] font-semibold leading-tight">{t.label}</span>
              <span className="mt-1 block text-[13px] leading-snug text-muted">{t.blurb}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

function Placeholder({ tile }: { tile: Tile }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <a href="#/" className="inline-flex min-h-11 items-center text-sm font-medium text-brand">
        Back to home
      </a>
      <h2 className="mt-2 text-xl font-semibold">{tile.label}</h2>
      <p className="mt-2 text-muted">This screen is not built yet.</p>
    </div>
  )
}

export default function App() {
  const route = useRoute()
  const crawlDate = useCrawlDate()
  const [id, ...params] = route.split('?')[0].split('/').filter(Boolean)
  const tile = TILES.find((t) => t.id === id)
  const Feature = id ? SCREENS[id] : undefined

  let body: ReactNode = <Home />
  if (Feature) {
    body = (
      <Suspense fallback={<p className="text-muted">Loading...</p>}>
        <Feature params={params} />
      </Suspense>
    )
  } else if (tile) {
    body = <Placeholder tile={tile} />
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      {id ? (
        <header className="mb-2">
          <a href="#/" className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-ink">
            <img src="/icon.svg" alt="" width="24" height="24" className="rounded-md" />
            The Halal Way
          </a>
        </header>
      ) : (
        <header className="mb-6">
          <p className="text-sm font-medium tracking-wide text-brand uppercase">Demo</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">The Halal Way</h1>
          <p className="mt-2 text-[15px] text-muted">
            Find what IFANCA has published about products, ingredients, and halal food.
          </p>
        </header>
      )}

      <main className="flex-1">{body}</main>

      <footer className="mt-8 border-t border-line pt-4 text-center text-[13px] leading-relaxed text-muted">
        <p>Demo built from IFANCA's public content. Not an official IFANCA app.</p>
        {crawlDate && <p className="mt-1">Content snapshot from ifanca.org, {crawlDate}.</p>}
      </footer>
    </div>
  )
}
