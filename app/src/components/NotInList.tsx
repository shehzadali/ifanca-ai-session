// The only wording the app uses for an item that is missing from IFANCA's data.
export const NOT_IN_LIST =
  "Not in IFANCA's published list. This does not mean it is not certified or not halal."

export default function NotInList({ className = '' }: { className?: string }) {
  return (
    <p className={`font-medium text-ink ${className}`} data-testid="not-in-list">
      {NOT_IN_LIST}
    </p>
  )
}
