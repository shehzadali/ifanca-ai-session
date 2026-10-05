import Screen from '../components/Screen'
import SectionShell, { RECIPE_TABS } from '../components/SectionShell'
import { useRecipes } from './Cook'
import MealPlan, { DAYS } from './MealPlan'

// Meal Plan, a tab of Recipes. A day opens as its own screen.
export default function PlanScreen({ params }: { params: string[] }) {
  const { recipes, error } = useRecipes()
  const day = DAYS.includes(params[0]) ? params[0] : undefined
  const body = (
    <>
      {error && <p>The recipes could not load. Check your connection and try again.</p>}
      {!recipes && !error && <p className="text-muted">Loading...</p>}
      {recipes && <MealPlan recipes={recipes} day={day} />}
    </>
  )
  if (day) {
    return (
      <Screen title={day} tone="plan" back={{ href: '#/recipes/plan', label: 'Whole week' }}>
        {body}
      </Screen>
    )
  }
  return (
    <SectionShell title="Recipes" tone="recipes" tabs={RECIPE_TABS} current="plan">
      {body}
    </SectionShell>
  )
}
