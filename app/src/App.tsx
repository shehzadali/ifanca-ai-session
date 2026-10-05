import { lazy, Suspense, useCallback, useEffect, useState, type ComponentType, type ReactNode } from 'react'
import Avatar from './components/Avatar'
import BottomNav from './components/BottomNav'
import DailyFact from './components/DailyFact'
import { SECTIONS } from './components/Icons'
import LevelBar from './components/LevelBar'
import ProfileBlock from './components/ProfileBlock'
import Settings from './components/Settings'
import TopBar from './components/TopBar'
import { useProfile } from './lib/profile'
import { useStored } from './lib/storage'
import { useTheme } from './lib/theme'
import type { QuizProgress } from './lib/level'

const CheckScreen = lazy(() => import('./features/CheckScreen'))
const Learn = lazy(() => import('./features/Learn'))
const Cook = lazy(() => import('./features/Cook'))
const Read = lazy(() => import('./features/Read'))
const Leaderboard = lazy(() => import('./features/Leaderboard'))
const ProfileScreen = lazy(() => import('./features/ProfileScreen'))

// Screens by route id. Each gets the route segments after its id.
const SCREENS: Record<string, ComponentType<{ params: string[] }>> = {
  check: CheckScreen,
  learn: Learn,
  recipes: Cook,
  read: Read,
  leaderboard: Leaderboard,
  profile: ProfileScreen,
}

// Old links from earlier versions still work.
export function normalize(route: string): string {
  if (route === 'cook/plan') return 'recipes/plan'
  if (route === 'cook' || route.startsWith('cook/')) return route.replace(/^cook/, 'recipes')
  if (route === 'plan' || route.startsWith('plan/')) return `recipes/${route}`
  if (route === 'product' || route.startsWith('product/')) return 'check/products'
  if (route === 'ingredients' || route.startsWith('ingredients/')) return `check/${route}`
  return route
}

function useRoute(): string {
  // The projector link is a plain path, /leaderboard. Everything else uses hash routes.
  const read = () => {
    const hash = window.location.hash.replace(/^#\/?/, '')
    if (!hash && window.location.pathname.replace(/\/$/, '') === '/leaderboard') return 'leaderboard'
    return normalize(hash)
  }
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

function Home() {
  const [quiz] = useStored<QuizProgress>('thw.quiz', { best: {}, level: null })
  const [learn, ...rest] = SECTIONS
  return (
    <div>
      <p className="mb-4 text-[15px] leading-snug text-muted" data-testid="home-intro">
        Check products and ingredients, learn the basics of halal, and plan meals, all from IFANCA's public content.
      </p>
      <a
        href="#/learn"
        className="relative block overflow-hidden rounded-3xl bg-learn p-5 text-white shadow-sm transition active:scale-[0.99]"
        data-testid="tile"
      >
        <div className="geo absolute inset-0 opacity-[0.14]" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <learn.Icon size={28} />
          </span>
          <span>
            <span className="block text-[20px] leading-tight font-bold" data-testid="tile-label">
              {learn.label}
            </span>
            <span className="block text-[13px] text-white/85" data-testid="tile-subtitle">
              {learn.subtitle}
            </span>
          </span>
        </div>
        <div className="relative mt-4">
          <LevelBar quiz={quiz} light />
        </div>
      </a>

      <DailyFact />

      <ul className="mt-3 grid grid-cols-2 gap-3">
        {rest.map(({ id, label, subtitle, Icon, color }, i) => (
          <li key={id} className={i === rest.length - 1 ? 'col-span-2' : ''}>
            <a
              href={`#/${id}`}
              className={`relative flex h-full min-h-[132px] flex-col justify-between gap-3 overflow-hidden rounded-3xl ${color} p-4 text-white shadow-sm transition active:scale-[0.98]`}
              data-testid="tile"
            >
              <div className="geo absolute inset-0 opacity-[0.14]" aria-hidden="true" />
              <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <Icon size={26} />
              </span>
              <span className="relative">
                <span className="block text-[18px] leading-tight font-bold" data-testid="tile-label">
                  {label}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-white/85" data-testid="tile-subtitle">
                  {subtitle}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function App() {
  const route = useRoute()
  const [theme, setTheme] = useTheme()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const profile = useProfile()
  const closeSettings = useCallback(() => setSettingsOpen(false), [])
  const [id, ...params] = route.split('?')[0].split('/').filter(Boolean)
  const Feature = id ? SCREENS[id] : undefined
  const projector = id === 'leaderboard'
  // A recipe opened from a meal plan day belongs to Meal Plan.
  const section = !id ? 'home' : SECTIONS.some((s) => s.id === id) ? id : null

  let body: ReactNode = <Home />
  if (Feature) {
    body = (
      <Suspense fallback={<p className="text-muted">Loading...</p>}>
        <Feature params={params} />
      </Suspense>
    )
  }

  return (
    <div
      className={`mx-auto flex min-h-dvh flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] ${
        projector ? 'max-w-[1800px] pb-6 lg:px-[3vw]' : 'max-w-md'
      } ${section ? 'pb-24' : 'pb-[max(1rem,env(safe-area-inset-bottom))]'}`}
    >
      {!projector && (
        <TopBar
          onSettings={() => setSettingsOpen(true)}
          avatar={profile ? <Avatar id={profile.avatar} name={profile.name} size={42} /> : undefined}
        />
      )}

      <main className={`flex-1 ${projector ? '' : 'mt-3'}`}>{body}</main>

      <footer className="mt-8 border-t border-line pt-4 pb-2 text-center text-[13px] leading-relaxed text-muted">
        <p>Demo built from IFANCA's public content.</p>
        <p>Not an official IFANCA app.</p>
      </footer>

      {section && <BottomNav current={section} />}
      <Settings
        open={settingsOpen}
        onClose={closeSettings}
        theme={theme}
        setTheme={setTheme}
        profile={<ProfileBlock onNavigate={closeSettings} />}
      />
    </div>
  )
}
