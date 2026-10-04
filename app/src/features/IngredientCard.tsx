import { formatDate } from '../lib/data'
import { STATUS_LABEL, type Ingredient, type Statement as S } from '../lib/ingredients'

export default function IngredientCard({ item }: { item: Ingredient }) {
  return (
    <article className="rounded-xl border border-line bg-card p-4" data-testid="ingredient-card" data-name={item.name}>
      <h3 className="text-lg font-semibold">{item.name}</h3>
      <p className="mt-0.5 text-[13px] text-muted">
        {item.statements.length} {item.statements.length === 1 ? 'statement' : 'statements'} from IFANCA
      </p>
      <ul className="mt-3 space-y-3">
        {item.statements.map((s, i) => (
          <li key={i}>
            <Statement s={s} />
          </li>
        ))}
      </ul>
    </article>
  )
}

export function Statement({ s }: { s: S }) {
  return (
    <div className="rounded-lg bg-paper p-3" data-testid="statement">
      <p className="text-[12px] font-medium tracking-wide text-muted uppercase">
        Recorded status in this source: <span className="text-ink">{STATUS_LABEL[s.status] ?? s.status}</span>
      </p>
      <blockquote className="mt-2 border-l-4 border-brand pl-3 text-[15px] leading-relaxed text-ink">
        &ldquo;{s.source_text}&rdquo;
      </blockquote>
      {s.context && <p className="mt-2 text-[13px] text-muted">{s.context}</p>}
      {!s.context.includes(s.source_title) && (
        <p className="mt-1 text-[13px] text-muted">
          {s.source_title}
          {s.source_date && `, ${formatDate(s.source_date)}`}
        </p>
      )}
      <a
        href={s.url}
        target="_blank"
        rel="noopener"
        className="inline-flex min-h-11 items-center text-[14px] font-medium text-brand underline"
      >
        Read the source on ifanca.org
      </a>
    </div>
  )
}
