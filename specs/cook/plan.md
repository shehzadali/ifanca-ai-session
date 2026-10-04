# Plan: cook

## Files

| File | Change | Why |
|---|---|---|
| `app/src/features/Cook.tsx` | add | Routing within Cook, the recipe list with search and chips, and the recipe screen. |
| `app/src/features/MealPlan.tsx` | add | Meal plan screen, the day picker, and the `useMealPlan` hook. |
| `app/src/App.tsx` | change | Route `#/cook` and the new tile subtitle. |

## Components

- `Cook({ params })`: empty shows `RecipeList`, `plan` shows `MealPlan`, anything else is a recipe slug and shows `RecipeView`.
- `RecipeList({ recipes })`: meal plan button, search, chips, count, rows, show more.
- `RecipeView({ recipe })`: header, `AddToPlan`, ingredients, steps, source.
- `AddToPlan({ url })`: toggle, seven day buttons, confirmation line.
- `MealPlan({ recipes })`: seven days with planned recipes, Remove, Clear with confirm.
- Reuses `Screen`, `useData`, `formatDate`, `decodeEntities`, `fold`, `terms`, and `useStored`.

## Data

- `recipes.json` (466 KB) loads when Cook opens.
- On load, each recipe gets a slug (last part of the URL), a lowercase haystack of title and ingredients, the ingredient count (lines that do not end with a colon), and main-ingredient flags from word patterns on the ingredient lines.
- Sorted by date, newest first.
- Meal plan in localStorage key `thw.mealplan`: `{ Monday: [url, ...], ... }`. Stored by URL so it survives data refreshes. Unknown URLs are skipped when shown.

## Steps

- [x] 1. Route, tile subtitle, recipe list with search, chips, count, and show more. (AC 1, 2, 3, 4, 5, 11)
- [ ] 2. Recipe screen with unchanged ingredients and steps, source link, and date. (AC 6, 10)
- [ ] 3. Meal plan hook, Add to meal plan, and the meal plan screen. (AC 7, 8, 9, 12)

## Test cases

1. AC 1: on home, expect the Cook tile text to include "meal plan". Tap it. Expect `#/cook`.
2. AC 2: expect "341 recipes". Expect the first row date to be the newest date in recipes.json.
3. AC 3: type "lentil". Expect every row to match "lentil" in title or ingredients (checked against the data by URL).
4. AC 4: tap Chicken. Expect every row to have chicken in its ingredients. Tap again. Expect 341.
5. AC 5: tap "8 or fewer ingredients". Expect every row to have 8 or fewer ingredient lines.
6. AC 6: open the first recipe. Expect ingredient lines and step lines on screen to equal the data. Expect the source link and the published date.
7. AC 7: tap Add to meal plan, then Tuesday. Open the meal plan. Expect the recipe under Tuesday.
8. AC 8: reload the meal plan. Expect the recipe still there.
9. AC 9: tap Remove. Expect Tuesday to say "Nothing planned."
10. AC 10: on the list, a recipe, and the meal plan, remove recipe text and check the remaining text for the banned words.
11. AC 11: expect the snapshot date on all three screens.
12. AC 12: check scroll width and tap targets on all three screens.

Every acceptance criterion has a test case. No gaps. No new dependency.
