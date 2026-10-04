import Screen from '../components/Screen'
import { useRecipes } from './Cook'
import MealPlan from './MealPlan'

export default function PlanScreen(_: { params: string[] }) {
  const { recipes, error } = useRecipes()
  return (
    <Screen title="Meal plan" tone="plan">
      {error && <p>The recipes could not load. Check your connection and try again.</p>}
      {!recipes && !error && <p className="text-muted">Loading...</p>}
      {recipes && <MealPlan recipes={recipes} />}
    </Screen>
  )
}
