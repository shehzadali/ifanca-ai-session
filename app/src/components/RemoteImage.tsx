import { useState, type ReactNode } from 'react'
import { useOnline } from '../lib/online'

// An image from ifanca.org. Only requested while online. The service worker never stores it.
// A light shimmer shows while it loads. Offline or on failure, the fallback shows instead (or nothing).
export default function RemoteImage({
  src,
  alt,
  frame,
  fallback,
  testId,
  imgClass = 'h-full w-full object-cover',
  loadingClass = '',
}: {
  src: string
  alt: string
  frame: string
  fallback?: (reason: 'none' | 'offline' | 'failed') => ReactNode
  testId?: string
  imgClass?: string
  loadingClass?: string
}) {
  const online = useOnline()
  const [state, setState] = useState<{ src: string; status: 'loading' | 'loaded' | 'failed' }>({ src, status: 'loading' })
  const status = state.src === src ? state.status : 'loading'

  const reason = !src ? 'none' : !online ? 'offline' : status === 'failed' ? 'failed' : null
  if (reason) return fallback ? <>{fallback(reason)}</> : null

  return (
    <div className={`relative overflow-hidden ${frame} ${status === 'loaded' ? '' : loadingClass}`}>
      {status !== 'loaded' && <div className="shimmer absolute inset-0" data-testid="shimmer" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setState({ src, status: 'loaded' })}
        onError={() => setState({ src, status: 'failed' })}
        className={`${imgClass} transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        data-testid={testId}
      />
    </div>
  )
}
