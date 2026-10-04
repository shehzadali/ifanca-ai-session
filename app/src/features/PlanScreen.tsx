import Screen from '../components/Screen'
import { useRecipes } from './Cook'
import MealPlan, { DAYS } from './MealPlan'

export default function PlanScreen({ params }: { params: string[] }) {
  const { recipes, error } = useRecipes()
  const day = DAYS.includes(params[0]) ? params[0] : undefined
  return (
    <Screen title={day ?? 'Meal plan'} tone="plan" back={day ? { href: '#/plan', label: 'Whole week' } : undefined}>
      {error && <p>The recipes could not load. Check your connection and try again.</p>}
      {!recipes && !error && <p className="text-muted">Loading...</p>}
      {recipes && <MealPlan recipes={recipes} day={day} />}
    </Screen>
  )
}
