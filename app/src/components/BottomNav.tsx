import { HomeIcon, SECTIONS } from './Icons'

// App navigation: Home and the five sections. Home goes home without the splash.
export default function BottomNav({ current }: { current: string }) {
  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-md grid-cols-6">
        {[{ id: 'home', short: 'Home', Icon: HomeIcon }, ...SECTIONS].map(({ id, short, Icon }) => {
          const on = id === current
          return (
            <li key={id}>
              <a
                href={id === 'home' ? '#/' : `#/${id}`}
                aria-current={on ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-0 text-[10px] font-semibold tracking-[-0.02em] ${
                  on ? 'text-brand' : 'text-muted'
                }`}
              >
                <span className={`flex h-7 w-10 items-center justify-center rounded-full ${on ? 'bg-brand-soft' : ''}`}>
                  <Icon size={21} />
                </span>
                <span className="max-w-full truncate" data-testid="nav-label">{short}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
