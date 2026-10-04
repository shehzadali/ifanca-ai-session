import { SECTIONS } from './Icons'

// Section navigation inside the app. Hidden on home, where the tiles do the same job.
export default function BottomNav({ current }: { current: string }) {
  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-md grid-cols-6">
        {SECTIONS.map(({ id, short, Icon }) => {
          const on = id === current
          return (
            <li key={id}>
              <a
                href={`#/${id}`}
                aria-current={on ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-0.5 text-[10.5px] font-semibold ${
                  on ? 'text-brand' : 'text-muted'
                }`}
              >
                <span className={`flex h-7 w-11 items-center justify-center rounded-full ${on ? 'bg-brand-soft' : ''}`}>
                  <Icon size={21} />
                </span>
                <span className="truncate">{short}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
