import { useState } from 'react'
import { useOnline } from '../lib/online'

// Recipe photos load from ifanca.org only while online. The service worker does not store them.
// Offline, missing, or failed photos show a plain placeholder.
export default function RecipePhoto({ src, alt }: { src: string; alt: string }) {
  const online = useOnline()
  const [failed, setFailed] = useState<string | null>(null)
  const broken = failed === src

  let note = ''
  if (!src) note = 'No photo for this recipe.'
  else if (!online) note = 'The photo shows when you are online.'
  else if (broken) note = 'The photo could not load.'

  return (
    <div className="mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-line/40">
      {note ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-muted" data-testid="photo-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.5" />
            <path d="m21 16-5-5-8 8" />
          </svg>
          <p className="text-[13px]">{note}</p>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(src)}
          className="h-full w-full object-cover"
          data-testid="recipe-photo"
        />
      )}
    </div>
  )
}
