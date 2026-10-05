import RemoteImage from './RemoteImage'

const NOTES = {
  none: 'No photo for this recipe.',
  offline: 'The photo shows when you are online.',
  failed: 'The photo could not load.',
}

// Recipe photo with a shimmer while loading and a plain placeholder offline or on failure.
export default function RecipePhoto({ src, alt }: { src: string; alt: string }) {
  const frame = 'mt-4 aspect-[4/3] w-full rounded-xl border border-line'
  return (
    <RemoteImage
      src={src}
      alt={alt}
      frame={frame}
      testId="recipe-photo"
      fallback={(reason) => (
        <div className={`${frame} flex flex-col items-center justify-center gap-2 bg-line/40 text-muted`} data-testid="photo-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.5" />
            <path d="m21 16-5-5-8 8" />
          </svg>
          <p className="text-[13px]">{NOTES[reason]}</p>
        </div>
      )}
    />
  )
}
