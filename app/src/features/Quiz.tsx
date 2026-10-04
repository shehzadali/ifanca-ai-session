import { useState } from 'react'
import { useData } from '../lib/data'
import { slugOf } from '../lib/lessons'
import { useStored } from '../lib/storage'
import { EMPTY_QUIZ, QUIZ_KEY, type QuizState } from './Learn'
import PostScore from './PostScore'

type Question = {
  id: string
  level: string
  question: string
  options: string[]
  answer: number
  faq_question: string
  faq_url: string
  source_quote: string
}
type QuizData = { levels: string[]; items: Question[] }

export const PASS = 4

// The level is the name of the highest round passed, in order.
function levelFrom(best: Record<string, number>, levels: string[], sizes: Record<string, number>): string | null {
  let level: string | null = null
  for (const l of levels) {
    if ((best[l] ?? 0) >= Math.min(PASS, sizes[l])) level = l
    else break
  }
  return level
}

export default function Quiz({ round }: { round?: string }) {
  const { data, error } = useData<QuizData>('quiz.json')
  const [state, setState] = useStored<QuizState>(QUIZ_KEY, EMPTY_QUIZ)

  if (error) return <p>The quiz could not load. Check your connection and try again.</p>
  if (!data) return <p className="text-muted">Loading...</p>

  const sizes = Object.fromEntries(data.levels.map((l) => [l, data.items.filter((q) => q.level === l).length]))
  const isOpen = (l: string) => {
    const i = data.levels.indexOf(l)
    return i === 0 || (state.best[data.levels[i - 1]] ?? 0) >= Math.min(PASS, sizes[data.levels[i - 1]])
  }

  if (round && data.levels.includes(round) && isOpen(round)) {
    return (
      <Round
        key={round}
        name={round}
        questions={data.items.filter((q) => q.level === round)}
        next={data.levels[data.levels.indexOf(round) + 1]}
        total={data.levels.reduce((n, l) => n + (state.best[l] ?? 0), 0)}
        max={data.items.length}
        level={state.level}
        onDone={(score) =>
          setState((s) => {
            const best = { ...s.best, [round]: Math.max(score, s.best[round] ?? 0) }
            return { best, level: levelFrom(best, data.levels, sizes) }
          })
        }
      />
    )
  }

  return (
    <div>
      <p className="text-[15px] text-muted">
        Three rounds of {sizes[data.levels[0]]} questions. Every question comes from one of IFANCA's FAQ answers. Get {PASS} or
        more right to pass a round and open the next one.
      </p>
      <div className="mt-4 rounded-2xl border border-line bg-card p-4">
        <p className="text-[13px] font-medium text-muted">Your level</p>
        <p className="text-xl font-semibold" data-testid="level">{state.level ?? 'Not started'}</p>
        <p className="mt-1 text-[13px] text-muted">Saved on this device only.</p>
      </div>
      <ul className="mt-4 space-y-2">
        {data.levels.map((l, i) => {
          const open = isOpen(l)
          const best = state.best[l]
          return (
            <li key={l}>
              {open ? (
                <a
                  href={`#/learn/quiz/${l}`}
                  className="flex min-h-16 items-center justify-between rounded-xl border border-line bg-card px-4 py-2"
                  data-testid={`round-${l}`}
                >
                  <span>
                    <span className="block text-[17px] font-semibold">{l}</span>
                    <span className="block text-[13px] text-muted">
                      {best !== undefined ? `Best score ${best} of ${sizes[l]}` : `${sizes[l]} questions`}
                    </span>
                  </span>
                  <span className="font-medium text-brand">{best !== undefined ? 'Try again' : 'Start'}</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex min-h-16 w-full items-center justify-between rounded-xl border border-dashed border-line px-4 py-2 text-left"
                  data-testid={`round-${l}`}
                >
                  <span>
                    <span className="block text-[17px] font-semibold text-muted">{l}</span>
                    <span className="block text-[13px] text-muted">
                      Pass the {data.levels[i - 1]} round to open this one.
                    </span>
                  </span>
                  <span className="text-[13px] text-muted">Locked</span>
                </button>
              )}
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-[13px] text-muted">
        Questions were written for this demo from IFANCA's FAQ answers. They are not published by IFANCA.
      </p>
    </div>
  )
}

function Round({
  name,
  questions,
  next,
  total,
  max,
  level,
  onDone,
}: {
  name: string
  questions: Question[]
  next?: string
  total: number
  max: number
  level: string | null
  onDone: (score: number) => void
}) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const q = questions[index]

  if (done) {
    const passed = score >= Math.min(PASS, questions.length)
    return (
      <div className="rounded-2xl border border-line bg-card p-5 text-center" data-testid="round-result">
        <p className="text-[13px] font-medium text-muted">{name} round</p>
        <p className="mt-1 text-3xl font-semibold" data-testid="score">
          {score} of {questions.length}
        </p>
        <p className="mt-2 text-[15px]">
          {passed ? `Round passed. Your level is now ${name} or higher.` : `Get ${PASS} or more right to pass. Read the lessons and try again.`}
        </p>
        <PostScore total={total} max={max} level={level} />
        <div className="mt-4 grid gap-2">
          {passed && next && (
            <a href={`#/learn/quiz/${next}`} className="flex h-12 items-center justify-center rounded-xl bg-brand font-semibold text-white">
              Start the {next} round
            </a>
          )}
          <a href="#/learn/quiz" className="flex h-12 items-center justify-center rounded-xl border border-line font-medium text-brand">
            All rounds
          </a>
          <a href="#/learn" className="flex h-12 items-center justify-center rounded-xl border border-line font-medium text-brand">
            Back to lessons
          </a>
        </div>
      </div>
    )
  }

  const answered = picked !== null
  const right = picked === q.answer

  return (
    <div data-testid="question">
      <p className="text-[13px] font-medium text-muted">
        {name} round. Question {index + 1} of {questions.length}.
      </p>
      <h3 className="mt-2 text-xl leading-snug font-semibold">{q.question}</h3>
      <ul className="mt-4 space-y-2">
        {q.options.map((o, i) => {
          let style = 'border-line bg-card'
          if (answered && i === q.answer) style = 'border-brand bg-brand-soft'
          else if (answered && i === picked) style = 'border-[#b4553c] bg-[#f8e9e4]'
          return (
            <li key={i}>
              <button
                type="button"
                disabled={answered}
                onClick={() => {
                  setPicked(i)
                  if (i === q.answer) setScore((s) => s + 1)
                }}
                className={`flex min-h-12 w-full items-center rounded-xl border-2 px-4 py-2 text-left text-[16px] ${style}`}
                data-testid="option"
              >
                {o}
              </button>
            </li>
          )
        })}
      </ul>

      {answered && (
        <div className="mt-4 rounded-xl border border-line bg-card p-4" data-testid="feedback" aria-live="polite">
          <p className="font-semibold">{right ? 'Correct.' : `Not quite. The answer is: ${q.options[q.answer]}.`}</p>
          <p className="mt-3 text-[13px] text-muted">From IFANCA's answer to "{q.faq_question}"</p>
          <blockquote className="mt-1 border-l-4 border-brand pl-3 text-[15px] leading-relaxed" data-testid="quote">
            &ldquo;{q.source_quote}&rdquo;
          </blockquote>
          <div className="mt-2 flex flex-col">
            <a href={`#/learn/${slugOf(q.faq_url)}`} className="inline-flex min-h-11 items-center font-medium text-brand underline" data-testid="lesson-link">
              Read the lesson
            </a>
            <a href={q.faq_url} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center font-medium text-brand underline" data-testid="faq-link">
              Read it on ifanca.org
            </a>
          </div>
          <button
            type="button"
            onClick={() => {
              if (index + 1 < questions.length) {
                setIndex(index + 1)
                setPicked(null)
              } else {
                setDone(true)
                onDone(score)
              }
            }}
            className="mt-3 h-12 w-full rounded-xl bg-brand font-semibold text-white"
          >
            {index + 1 < questions.length ? 'Next question' : 'See my score'}
          </button>
        </div>
      )}
    </div>
  )
}
