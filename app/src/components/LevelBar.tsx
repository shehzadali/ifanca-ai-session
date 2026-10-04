import { LEVELS, levelsToGo, progress, type QuizProgress } from '../lib/level'

// Four steps: Not started, then the three quiz levels. The fill shows how far the player is toward the top level.
export default function LevelBar({ quiz, light = false }: { quiz: QuizProgress; light?: boolean }) {
  const pct = Math.round((progress(quiz) / LEVELS.length) * 100)
  const togo = levelsToGo(quiz)
  const steps = ['Not started', ...LEVELS]
  return (
    <div data-testid="level-bar">
      <div className="flex items-baseline justify-between gap-2">
        <p className={`text-[15px] font-semibold ${light ? 'text-white' : 'text-ink'}`} data-testid="home-level">
          {quiz.level ?? 'Not started'}
        </p>
        <p className={`text-[13px] ${light ? 'text-white/85' : 'text-muted'}`}>
          {togo === 0 ? 'Top level reached' : `${togo} ${togo === 1 ? 'level' : 'levels'} to Advocate`}
        </p>
      </div>
      <div
        className={`relative mt-2 h-2.5 overflow-hidden rounded-full ${light ? 'bg-white/25' : 'bg-line'}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Progress toward the Advocate level"
      >
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} data-testid="level-fill" />
      </div>
      <div className={`mt-1.5 grid grid-cols-4 text-[11px] font-medium ${light ? 'text-white/85' : 'text-muted'}`}>
        {steps.map((s, i) => (
          <span key={s} className={i === 0 ? 'text-left' : i === steps.length - 1 ? 'text-right' : 'text-center'}>
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}
