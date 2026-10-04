import Screen from '../components/Screen'

export default function ProductCheck(_: { params: string[] }) {
  return (
    <Screen title="Check a product" snapshot="2026-10-03" sourceUrl="https://ifanca.org/halal-certified-products/">
      <p className="text-muted">Loading the product list...</p>
    </Screen>
  )
}
