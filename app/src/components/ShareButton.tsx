import { useRef, useState } from 'react'

// Share a recipe or lesson. Uses the phone's share sheet when there is one, otherwise copies the link.
export default function ShareButton({ title, sourceUrl, path }: { title: string; sourceUrl: string; path: string }) {
  const [note, setNote] = useState<'copied' | 'manual' | null>(null)
  const field = useRef<HTMLInputElement>(null)
  const url = `${window.location.origin}${path}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setNote('copied')
      window.setTimeout(() => setNote((n) => (n === 'copied' ? null : n)), 3000)
    } catch {
      setNote('manual')
      window.setTimeout(() => field.current?.select(), 0)
    }
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${title}, from IFANCA's public content in The Halal Way demo. Original: ${sourceUrl}`, url })
        return
      } catch (e) {
        // The user closed the share sheet. Nothing to do.
        if (e instanceof DOMException && e.name === 'AbortError') return
      }
    }
    await copy()
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={share}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-card px-4 text-[15px] font-semibold text-brand shadow-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12M7 8l5-5 5 5" />
          <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
        </svg>
        Share
      </button>
      <span aria-live="polite" data-testid="share-note">
        {note === 'copied' && <span className="ml-3 text-[14px] font-semibold text-brand">Link copied</span>}
      </span>
      {note === 'manual' && (
        <label className="mt-2 block">
          <span className="mb-1 block text-[13px] text-muted">Copy this link:</span>
          <input
            ref={field}
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            className="h-11 w-full rounded-xl border border-line bg-card px-3 text-[14px]"
            data-testid="share-field"
          />
        </label>
      )}
    </div>
  )
}
