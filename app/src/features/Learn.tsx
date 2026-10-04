import { useEffect, useMemo } from 'react'
import Screen from '../components/Screen'
import { useData, type Dataset } from '../lib/data'
import { buildLessons, paragraphs, type Faq, type Lesson as L } from '../lib/lessons'
import { useStored } from '../lib/storage'

export const READ_KEY = 'thw.learn.read'
export const QUIZ_KEY = 'thw.quiz'
export type QuizState = { best: Record<string, number>; level: string | null }
export const EMPTY_QUIZ: QuizState = { best: {}, level: null }

const SOURCE = 'https://ifanca.org/faqs/'

export default function Learn({ params }: { params: string[] }) {
  const { data, error } = useData<Dataset<Faq>>('faqs.json')
  const lessons = useMemo(() => (data ? buildLessons(data.items) : null), [data])
  const date = data?.crawl_date ?? '2026-10-03'
  const slug = params[0] ?? ''

  if (error) return <Screen title="Learn and quiz">The lessons could not load. Check your connection and try again.</Screen>
  if (!lessons) return <Screen title="Learn and quiz">Loading...</Screen>

  if (slug === 'quiz') {
    return (
      <Screen title="Quiz" back={{ href: '#/learn', label: 'Back to lessons' }} snapshot={date} sourceUrl={SOURCE}>
        <p className="text-muted">The quiz is not built yet.</p>
      </Screen>
    )
  }

  const index = lessons.findIndex((l) => l.slug === slug)
  if (slug && index >= 0) return <Lesson lessons={lessons} index={index} date={date} />
  return <LearnHome lessons={lessons} date={date} />
}

function LearnHome({ lessons, date }: { lessons: L[]; date: string }) {
  const [read] = useStored<string[]>(READ_KEY, [])
  const [quiz] = useStored<QuizState>(QUIZ_KEY, EMPTY_QUIZ)
  const sections = [...new Set(lessons.map((l) => l.section))]
  const readCount = lessons.filter((l) => read.includes(l.slug)).length

  return (
    <Screen title="Learn and quiz" snapshot={date} sourceUrl={SOURCE}>
      <p className="text-[15px] text-muted">
        IFANCA's answers to common questions, in a suggested order. Each lesson is IFANCA's answer, quoted in full.
      </p>

      <div className="mt-4 rounded-2xl border border-line bg-card p-4">
        <p className="text-[13px] font-medium text-muted">Your level</p>
        <p className="text-xl font-semibold" data-testid="level">{quiz.level ?? 'Not started'}</p>
        <a
          href="#/learn/quiz"
          className="mt-3 flex h-12 items-center justify-center rounded-xl bg-brand font-semibold text-white"
        >
          Take the quiz
        </a>
      </div>

      <p className="mt-5 text-[14px] font-medium text-muted" data-testid="progress">
        {readCount} of {lessons.length} lessons read
      </p>

      {sections.map((section) => (
        <section key={section} className="mt-4">
          <h3 className="mb-2 text-[13px] font-semibold tracking-wide text-muted uppercase">{section}</h3>
          <ul className="overflow-hidden rounded-xl border border-line bg-card">
            {lessons
              .map((l, i) => [l, i] as const)
              .filter(([l]) => l.section === section)
              .map(([l, i]) => {
                const done = read.includes(l.slug)
                return (
                  <li key={l.slug} className="border-b border-line last:border-0">
                    <a href={`#/learn/${l.slug}`} className="flex min-h-14 items-center gap-3 px-4 py-2" data-testid="lesson-row" data-read={done}>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
                          done ? 'bg-brand text-white' : 'bg-brand-soft text-brand'
                        }`}
                        aria-label={done ? 'Read' : undefined}
                      >
                        {done ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                            <path d="m5 12 5 5 9-10" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span className="flex-1">
                        <span className="block text-[15px] leading-snug font-medium" data-testid="lesson-title">{l.question}</span>
                        <span className="block text-[12px] text-muted">{l.minutes} min read</span>
                      </span>
                    </a>
                  </li>
                )
              })}
          </ul>
        </section>
      ))}
    </Screen>
  )
}

function Lesson({ lessons, index, date }: { lessons: L[]; index: number; date: string }) {
  const lesson = lessons[index]
  const [, setRead] = useStored<string[]>(READ_KEY, [])
  useEffect(() => {
    setRead((r) => (r.includes(lesson.slug) ? r : [...r, lesson.slug]))
  }, [lesson.slug, setRead])

  const prev = lessons[index - 1]
  const next = lessons[index + 1]

  return (
    <Screen title={lesson.question} back={{ href: '#/learn', label: 'All lessons' }} snapshot={date}>
      <p className="-mt-2 mb-3 text-[13px] text-muted">
        {lesson.section}. Lesson {index + 1} of {lessons.length}.
      </p>
      <div className="space-y-4 text-[17px] leading-relaxed text-ink" data-testid="lesson-text">
        {paragraphs(lesson.answer).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mt-5 rounded-xl bg-brand-soft p-3 text-[14px]">
        <p>IFANCA's answer, quoted in full.</p>
        <a
          href={lesson.url}
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-11 items-center font-medium text-brand underline"
          data-testid="faq-link"
        >
          Read it on ifanca.org
        </a>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {prev ? (
          <a href={`#/learn/${prev.slug}`} className="flex h-12 items-center justify-center rounded-xl border border-line bg-card font-medium text-brand">
            Previous
          </a>
        ) : (
          <span />
        )}
        <a
          href={next ? `#/learn/${next.slug}` : '#/learn/quiz'}
          className="flex h-12 items-center justify-center rounded-xl bg-brand font-semibold text-white"
        >
          {next ? 'Next' : 'Take the quiz'}
        </a>
      </div>
    </Screen>
  )
}
