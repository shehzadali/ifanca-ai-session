# Plan: shopping-list

## Files

| File | Change | Why |
|---|---|---|
| `app/src/lib/shopping.ts` | add | Builds the combined list: strips amounts and units for a grouping key, keeps every original line. Pure functions. |
| `app/src/features/ShoppingList.tsx` | add | The tab screen, items, ticks, and the guidance sheet. |
| `app/src/components/Sheet.tsx` | add | A small bottom sheet, also usable later. |
| `app/src/components/SectionShell.tsx` | change | Add the Shopping List tab to `RECIPE_TABS`. |
| `app/src/features/Cook.tsx` | change | Route `#/recipes/shopping`. |

## Components

- `ShoppingList()`: loads recipes and ingredients, reads the meal plan, renders items.
- `Sheet({ title, onClose, children })`: dialog over the page, Escape and backdrop close it.
- Reuses `IngredientCard`, `SectionShell`, `useMealPlan`, `useStored`, and the ingredient matchers.

## Data

- recipes.json and ingredients.json load when the tab opens.
- Grouping key: lowercase line, without a leading amount (numbers, fractions, ranges, sizes in parentheses) and unit words (cup, tablespoon, teaspoon, pound, ounce, gram, can, clove, pinch, and similar), and without text after the first comma.
- Matching: `findMatches` from `lib/ingredients.ts` on the original lines of the item.
- Ticks: `thw.shopping.ticked`, a list of grouping keys.

## Steps

- [x] 1. `shopping.ts` and a check in Node on real recipes. (AC 3, 4, 5)
- [x] 2. Screen, tab, route, ticks, empty state. (AC 1, 2, 7, 8, 9, 10)
- [x] 3. Guidance badge and sheet. (AC 6)

## Test cases

1. AC 1: open Recipes. Expect three tabs. Tap Shopping List. Expect `#/recipes/shopping`.
2. AC 2: clear the plan. Expect the empty state with a link to Meal Plan.
3. AC 3: plan two recipes with sugar lines. Expect one item whose key contains "sugar" listing both lines and both recipe names.
4. AC 4: for each planned recipe, every non-heading line is on the page.
5. AC 5: plan one recipe on Monday and Tuesday. Expect its lines once.
6. AC 6: plan a recipe with gelatin, or seed one, and tap the gelatin item. Expect the sheet with the Gelatin card, quotes, links, and the no-verdict line.
7. AC 7: tap an item without a badge. Expect it ticked and last.
8. AC 8: reload. Expect the same ticks.
9. AC 9: tap Clear ticks. Expect no ticks.
10. AC 10: check scroll width and tap targets, with the sheet closed and open.

Every acceptance criterion has a test case. No gaps. No new dependency.
