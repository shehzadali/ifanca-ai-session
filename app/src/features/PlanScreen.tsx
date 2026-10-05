import Screen from '../components/Screen'
import SectionShell, { PLAN_TABS } from '../components/SectionShell'
import ShoppingList from './ShoppingList'
import { useRecipes } from './Cook'
import MealPlan, { DAYS } from './MealPlan'

// Meal Plan section: the week and the Shopping List as tabs. A day opens as its own screen.
export default function PlanScreen({ params }: { params: string[] }) {
  const { recipes, error } = useRecipes()
  if (params[0] === 'shopping') return <ShoppingList />
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
      <Screen title={day} tone="plan" back={{ href: '#/plan', label: 'Whole week' }}>
        {body}
      </Screen>
    )
  }
  return (
    <SectionShell title="Meal Plan" tone="plan" tabs={PLAN_TABS} current="plan">
      {body}
    </SectionShell>
  )
}
