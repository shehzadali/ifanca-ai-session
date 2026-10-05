# Spec: shopping-list

## User goal

"I planned my week. Now I want one list of what to buy, and to see what IFANCA says about any ingredient on it." This builds on the meal plan (feature cook) and the ingredient check (Journey 1 step 8, Gap 5).

## Screens

### Shopping List (`#/recipes/shopping`, a tab of Recipes)

- Tabs at the top: Recipes, Meal Plan, Shopping List.
- A line: "Everything in your meal plan, combined. Saved on this device."
- Count: "<n> items from <m> recipes".
- One combined list. Lines that name the same ingredient after their amount and unit are grouped under one item. Example: "1/2 cup granulated sugar" and "1/4 cup granulated sugar" group under "granulated sugar".
- Each item shows:
  - A checkbox to tick it off (at least 44px). Ticked items move to the end and are struck through.
  - The item name.
  - Under it, every original ingredient line with its recipe name, word for word as published.
  - A badge "IFANCA guidance" when the item matches an ingredient in ingredients.json.
- Tapping an item with the badge opens a sheet with IFANCA's statements for each matched ingredient (the same card as the ingredient check), the line "This shows what IFANCA has published about this ingredient. It is not a verdict on the product.", and a close button.
- Tapping an item without the badge ticks it.
- "Clear ticks" resets all ticks.
- Empty state when the meal plan is empty: "Your meal plan is empty. Add recipes to days first." with a link to Meal Plan.
- The same recipe planned on two days counts once.

## Acceptance criteria

1. Given Recipes, then the tabs read Recipes, Meal Plan, Shopping List, and Shopping List opens `#/recipes/shopping`.
2. Given an empty meal plan, then the empty state and the link to Meal Plan show.
3. Given two planned recipes that both use sugar in different amounts, then the list shows one sugar item with both original lines and their recipe names.
4. Given a planned recipe, then every non-heading ingredient line of it appears on the list word for word.
5. Given the same recipe planned on two days, then its lines appear once.
6. Given an item whose text matches an ingredient in ingredients.json (for example "gelatin"), then it shows the "IFANCA guidance" badge. Tapping it opens the sheet with that ingredient's statements, quotes, and source links, and the no-verdict line.
7. Given an item without a match, when tapped, then it is ticked and moves to the end.
8. Given ticked items, when the page reloads, then they stay ticked.
9. Given "Clear ticks", then no item is ticked.
10. Given the screen at 390px, then nothing scrolls sideways and tap targets are at least 44px.

## Data needed

- `app/public/data/recipes.json` (340 recipes, `ingredients` lines) and the meal plan on the device (`thw.mealplan`).
- `app/public/data/ingredients.json` (99 ingredients) for guidance.

## Out of scope

- Adding up amounts across recipes. Units differ and the text stays as published.
- Store aisles, prices, or sharing the list.
- Any status for a recipe or product as a whole.

## Safety notes

- The app shows only what IFANCA published. It never states a halal ruling of its own.
- Any halal status shown must quote IFANCA's source text and link the source URL. The guidance sheet reuses the ingredient card, which does this.
- An item that is not in the data has no status. Items without a match show no badge and no status.
- Recipe text is not changed. Grouping uses a simplified name only for matching lines, and every original line is shown.
- The app is not an official IFANCA app.
