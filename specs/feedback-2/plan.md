# Plan: feedback-2

## Files

| File | Change | Why |
|---|---|---|
| `app/index.html` | change | The splash as plain HTML, CSS, and a short script. It paints before the app code loads, so it covers the loading time instead of adding to it. |
| (inline in `app/index.html`) | add | Splash layout and animation, with a reduced motion version. Inline, so it applies on the first paint. |
| `app/src/App.tsx` | change | Remove the home header box. Title case tiles. Mark Meal Plan in the navigation for recipe pages opened from a day. |
| `app/src/components/Icons.tsx` | change | Title case section labels and short labels. |
| `app/src/features/*.tsx` | change | Title case screen and in-screen headings. |
| `app/src/features/Cook.tsx` | change | Export the recipe list for reuse. Read `#/recipes/<slug>/for/<Day>` and pass the day to the recipe page. |
| `app/src/features/MealPlan.tsx` | change | Day view uses the recipe list. `AddToPlan` takes an optional day. |
| `specs/test-lib.mjs` | change | Skip the splash in feature tests, except the splash tests. |
| Earlier `test.mjs` files and `app/tests/smoke.mjs` | change | New headings and the day view. |

## Components

- Splash (HTML in `index.html`): logo SVG with two animated squares and a leaf, title, line. A script shows it only when `sessionStorage['thw.splash']` is not set and the page is not `/leaderboard`, then sets it. Removed after the fade. A tap fades it at once.
- `RecipeList({ recipes, linkSuffix?, showPlanLink? })`: the current list. Rows link to `#/recipes/<slug><linkSuffix>`.
- `RecipeView({ recipe, day? })`: with a day, the back link goes to the day and `AddToPlan` gets the day.
- `AddToPlan({ url, day? })`: with a day, a main "Add to <Day>" button and a "Choose another day" toggle for the picker.

## Data

- No new data. The splash uses inline SVG, so it needs no extra file.

## Steps

- [ ] 1. Splash in `index.html` and `splash.css`, test helper to skip it. Remove the home header box. (AC 1, 2, 3, 4, 5)
- [ ] 2. Title case labels and headings. (AC 6)
- [ ] 3. Day view with the recipe list, day-aware recipe page and `AddToPlan`. (AC 7, 8, 9, 10, 11, 12)
- [ ] 4. Update earlier tests and the smoke test, then run everything. (AC 13, 14)

## Test cases

1. AC 1: fresh context, open home. Expect `#splash` visible with the logo and both texts. Expect it removed within 3 seconds.
2. AC 2: fresh context, tap the splash after 300 ms. Expect it gone within 700 ms.
3. AC 3: after the splash, go to `#/read`, then reload. Expect no `#splash`.
4. AC 4: fresh context with `reducedMotion: 'reduce'`. Expect no running CSS animations with transforms on the logo parts, and the splash gone within 1.5 seconds.
5. AC 5: home has no header box (no `h1` "The Halal Way" in main). The first tile reads "Learn and Quiz".
6. AC 6: read tile labels, navigation labels, and the `h2` on each listed screen. Expect the title case list.
7. AC 7: open `#/plan/Wednesday`. Expect the search box, 4 main ingredient chips, the "8 or fewer ingredients" chip, "340 recipes", and rows.
8. AC 8: type "lentil", tap the first row. Expect the recipe page with ingredients and steps.
9. AC 9: expect "Back to Wednesday" and a first button "Add to Wednesday".
10. AC 10: tap it. Expect "Added to Wednesday.". Tap the back link. Expect the recipe under Planned for Wednesday.
11. AC 11: tap that planned recipe name. Expect its recipe page.
12. AC 12: open a recipe from `#/recipes`. Expect "Add to meal plan" and the seven day picker on tap.
13. AC 13: scroll width and tap targets on the day view and the day-aware recipe page.
14. AC 14: rerun every feature test and the smoke test.

Every acceptance criterion has a test case. No gaps. No new dependency.
