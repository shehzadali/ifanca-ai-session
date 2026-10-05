import IngredientCheck from './IngredientCheck'
import ProductCheck from './ProductCheck'

// Check holds two tools: #/check/products and #/check/ingredients[/paste|/photo].
export default function CheckScreen({ params }: { params: string[] }) {
  if (params[0] === 'ingredients') return <IngredientCheck params={params.slice(1)} />
  return <ProductCheck params={[]} />
}
