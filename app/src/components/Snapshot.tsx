import { formatDate } from '../lib/data'

export default function Snapshot({ date, sourceUrl }: { date: string; sourceUrl?: string }) {
  return (
    <p className="text-[13px] leading-snug text-muted" data-testid="snapshot">
      IFANCA data snapshot: {formatDate(date)}.{' '}
      {sourceUrl && (
        <a href={sourceUrl} target="_blank" rel="noopener" className="font-medium text-brand underline">
          Source on ifanca.org
        </a>
      )}
    </p>
  )
}
