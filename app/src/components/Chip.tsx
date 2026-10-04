export default function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-11 shrink-0 rounded-full border px-4 text-[14px] font-medium ${
        on ? 'border-brand bg-brand text-on-brand' : 'border-line bg-card text-ink'
      }`}
    >
      {children}
    </button>
  )
}
