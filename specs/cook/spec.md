# Spec: cook

## User goal

"I want to find a halal recipe from IFANCA, cook it, and plan my meals for the week." This comes from Gap 5 in `analysis/gaps.md`: 352 recipes sit inside the 1,115-item resources library, sorted only by date, with no recipe search or filter.

## Screens

### Recipes (`#/cook`)

- Back link, title "Cook", snapshot line with the resources crawl date and a link to the resources library.
- A "My meal plan" button with the number of planned meals.
- Search box: "Search recipes or ingredients". Matches the title and ingredient lines.
- Filters, each a chip at least 44px tall:
  - Main ingredient (pick one or none): Chicken, Beef, Lamb or goat, Fish and seafood. A recipe matches when its ingredient list names it.
  - "8 or fewer ingredients".
- Count line, for example "52 recipes". Newest first.
- Recipe rows: title, published date, number of ingredients. 30 at a time with "Show more".
- No match: "No recipes match. Try fewer filters."

### Recipe (`#/cook/<slug>`)

- Back link to recipes, title, "Published <date> on ifanca.org", and a link to the original recipe.
- "Add to meal plan" with seven day buttons, Monday to Sunday. After a tap: "Added to <day>." with a link to the meal plan.
- Ingredients exactly as published. Lines that end with a colon (for example "For the Lemon Curd:") show as small headings.
- Steps exactly as published, numbered.
- The source link and date again at the end.

### Meal plan (`#/cook/plan`)

- Back link to recipes, title "Meal plan", the line "Saved on this device only."
- Seven days, Monday to Sunday. Each day lists its recipes with links and a Remove button. An empty day says "Nothing planned."
- "Clear the meal plan" with a confirm step.

### Home tile

- Cook tile subtitle: "Recipes from IFANCA's library and a weekly meal plan".

## Acceptance criteria

1. Given the home screen, then the Cook tile subtitle mentions the meal plan, and tapping it opens the recipes screen.
2. Given the recipes screen, then recipes are listed newest first, each with title and date, and the count reads "340 recipes".
3. Given the recipes screen, when the user types "lentil", then every listed recipe has "lentil" in its title or ingredients.
4. Given the recipes screen, when the user taps the "Chicken" chip, then every listed recipe names chicken in its ingredients, and tapping it again removes the filter.
5. Given the "8 or fewer ingredients" chip is on, then every listed recipe has 8 or fewer ingredient lines.
6. Given a recipe, when the user opens it, then the ingredients and steps on screen equal the lines in recipes.json, and the source link and published date are visible.
7. Given a recipe, when the user taps "Add to meal plan" and then "Tuesday", then the meal plan shows that recipe under Tuesday.
8. Given a planned recipe, when the page is reloaded, then the meal plan still shows it.
9. Given a planned recipe, when the user taps Remove, then it leaves the plan.
10. Given any Cook screen, then the words "diet", "calorie", "healthy", and "nutrition" do not appear in text the app wrote. Recipe text from IFANCA is excluded from this check.
11. Given any Recipes or Meal plan screen, then no snapshot line is shown, and Settings, About shows the recipes date. (Changed in the redesign. Cook is now called Recipes.)
12. Given any Cook screen at 390px, then nothing scrolls sideways and tap targets are at least 44px.

### Change on 2026-10-04: one recipe hidden, photos added

- "Lemon Tiramisu" is left out by the data export (`crawl/app_exclusions.csv`). The list now has 340 recipes.
- The recipe screen shows the recipe photo from its ifanca.org URL when the device is online. Offline, when a recipe has no photo, or when the photo fails to load, a plain placeholder shows instead. The service worker never stores the photos.

13. Given a recipe with a photo and the device online, then the photo loads from its ifanca.org URL.
14. Given the device is offline, when the user opens a recipe, then a plain placeholder shows and no photo is requested.
15. Given the photo request fails, then the placeholder shows "The photo could not load."
16. Given the recipe list, then "Lemon Tiramisu" is not in it and its URL does not open a recipe.


### Change on 2026-10-04: redesign

The owner asked to remove the snapshot line from every screen. The crawl date now shows only in Settings, About. The criterion about the snapshot date was changed to match. See `specs/app-redesign/spec.md`.

### Change on 2026-10-04: navigation and fixes

Recipes now holds three tabs: Recipes, Meal Plan, Shopping List. A Vegetarian filter was added, based on the ingredient list only, and recipe photos show a shimmer while loading.

17. Given the Vegetarian chip, then only recipes whose ingredient lines name no meat, poultry, fish, seafood, gelatin, animal stock or broth, fish sauce, anchovy, or lard are listed, and the note says it is based on the ingredient list.
18. Given a recipe photo is loading, then a shimmer shows until it loads.

## Data needed

- `app/public/data/recipes.json`: `crawl_date` (2026-10-04), `count` (340, after one exclusion), `items` with `title`, `url`, `date`, `ingredients` (lines), `steps` (lines), `image_url`, `parsed_from`. Dates range from 2006 to 2026. No blocker.

## Out of scope

- Nutrition facts, health claims, or diet advice of any kind.
- Storing recipe photos for offline use.
- Shopping lists, serving sizes, or meal times within a day.
- Checking recipe ingredients against IFANCA's ingredient statements.
- Changing recipe text in any way.

## Safety notes

- The app shows only what IFANCA published. It never states a halal ruling of its own.
- Recipe text is IFANCA's text, unchanged, with a source link and date on every recipe.
- The feature is called a meal plan. It makes no nutrition or health claims.
- An item that is not in the data has no status.
- The data is a dated snapshot. The crawl date is shown.
- The app is not an official IFANCA app.
