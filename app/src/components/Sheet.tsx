import { useEffect, useRef, type ReactNode } from 'react'
import { CloseIcon } from './Icons'

// A bottom sheet over the page. Escape and a tap outside close it.
export default function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45" onClick={onClose}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-paper px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl outline-none"
        data-testid="sheet"
      >
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-line" aria-hidden="true" />
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full text-muted">
            <CloseIcon />
          </button>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  )
}
