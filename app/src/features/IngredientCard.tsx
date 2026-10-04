import { formatDate } from '../lib/data'
import { groupByStatus, STATUS_LABEL, type Ingredient, type Statement as S } from '../lib/ingredients'

export default function IngredientCard({ item }: { item: Ingredient }) {
  return (
    <article className="rounded-2xl border border-line bg-card shadow-sm p-4" data-testid="ingredient-card" data-name={item.name}>
      <h3 className="text-lg font-semibold">{item.name}</h3>
      <p className="mt-0.5 text-[13px] text-muted">
        {item.statements.length} {item.statements.length === 1 ? 'statement' : 'statements'} from IFANCA
      </p>
      {item.sources_disagree ? (
        <SideBySide item={item} />
      ) : (
        <ul className="mt-3 space-y-3">
          {item.statements.map((s, i) => (
            <li key={i}>
              <Statement s={s} />
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

// Sources that disagree: one column per recorded status, side by side. None is picked.
function SideBySide({ item }: { item: Ingredient }) {
  const groups = groupByStatus(item.statements)
  return (
    <div className="mt-3" data-testid="side-by-side">
      <p className="rounded-lg bg-brand-soft p-3 text-[14px] text-ink">
        IFANCA's sources say different things about this ingredient. Each statement is shown below.
      </p>
      <p className="mt-2 text-[13px] text-muted sm:hidden">
        {groups.length} columns. Swipe sideways to see them all.
      </p>
      <div className="mt-2 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2">
        {groups.map(([status, list]) => (
          <section
            key={status}
            className="w-[85%] shrink-0 snap-start rounded-lg border border-line p-2 sm:w-auto sm:flex-1"
            data-testid="status-column"
          >
            <h4 className="px-1 pt-1 text-[13px] font-semibold text-ink">
              Recorded status: {STATUS_LABEL[status] ?? status}
            </h4>
            <p className="px-1 text-[12px] text-muted">
              {list.length} {list.length === 1 ? 'statement' : 'statements'}
            </p>
            <ul className="mt-2 space-y-2">
              {list.map((s, i) => (
                <li key={i}>
                  <Statement s={s} hideStatus />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

export function Statement({ s, hideStatus = false }: { s: S; hideStatus?: boolean }) {
  return (
    <div className="rounded-lg bg-paper p-3" data-testid="statement">
      {!hideStatus && (
        <p className="mb-2 text-[12px] font-medium tracking-wide text-muted uppercase">
          Recorded status in this source: <span className="text-ink">{STATUS_LABEL[s.status] ?? s.status}</span>
        </p>
      )}
      <blockquote className="border-l-4 border-brand pl-3 text-[15px] leading-relaxed text-ink">
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
