import { formatDate } from '../lib/data'

export default function Snapshot({ date, sourceUrl }: { date: string; sourceUrl?: string }) {
  return (
    <div className="text-[13px] leading-snug text-muted" data-testid="snapshot">
      <p>IFANCA data snapshot: {formatDate(date)}.</p>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener"
          className="-my-2.5 inline-flex min-h-11 items-center font-medium text-brand underline"
        >
          Source on ifanca.org
        </a>
      )}
    </div>
  )
}
