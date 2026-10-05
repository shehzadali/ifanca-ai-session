import { useData } from '../lib/data'
import { slugOf } from '../lib/lessons'

type Fact = { source_quote: string; faq_question: string; faq_url: string }

// Whole days since 1970-01-01 in the device's own time zone, so the fact changes at local midnight.
export function dayNumber(now = new Date()): number {
  return Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000)
}

// One sentence from an IFANCA FAQ answer each day. The sentences are the quiz quotes, which the build
// checks word for word against faqs.json.
export default function DailyFact() {
  const { data } = useData<{ items: Fact[] }>('quiz.json')
  if (!data?.items.length) return null
  const fact = data.items[dayNumber() % data.items.length]
  return (
    <section className="relative mt-3 overflow-hidden rounded-3xl border border-line bg-card p-4 shadow-sm" data-testid="daily-fact">
      <div className="geo absolute inset-0 text-gold opacity-[0.12]" aria-hidden="true" />
      <div className="relative">
        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-wider text-ingredients uppercase dark:text-gold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
          </svg>
          Did You Know?
        </h2>
        <blockquote className="mt-2 border-l-4 border-gold pl-3 text-[16px] leading-relaxed text-ink" data-testid="fact-quote">
          &ldquo;{fact.source_quote}&rdquo;
        </blockquote>
        <p className="mt-2 text-[13px] text-muted" data-testid="fact-source">
          From IFANCA's answer to "{fact.faq_question}"
        </p>
        <a href={`#/learn/${slugOf(fact.faq_url)}`} className="inline-flex min-h-11 items-center text-[14px] font-bold text-brand underline" data-testid="fact-link">
          Read the lesson
        </a>
      </div>
    </section>
  )
}
