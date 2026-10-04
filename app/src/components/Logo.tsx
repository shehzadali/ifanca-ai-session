// The app logo: an original eight-point star around a leaf. Not IFANCA's logo or the Crescent-M mark.
export default function Logo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" className={className} role="img" aria-label="The Halal Way logo">
      <defs>
        <linearGradient id="thw-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#138a6c" />
          <stop offset="1" stopColor="#0a4c3d" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#thw-logo)" />
      <g fill="none" stroke="#e9bd55" strokeWidth="20" strokeLinejoin="round">
        <path d="M141 141h230v230H141z" />
        <path d="M256 93.4 418.6 256 256 418.6 93.4 256z" />
      </g>
      <path d="M256 334c-46-28-62-76-36-128 18-36 54-56 74-62 10 44 4 96-14 130-6 12-14 24-24 60z" fill="#f6f1e7" />
      <path d="M256 330c4-44 14-90 32-130" fill="none" stroke="#0f6b55" strokeWidth="10" strokeLinecap="round" />
    </svg>
  )
}
