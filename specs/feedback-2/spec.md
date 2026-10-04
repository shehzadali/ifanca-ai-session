# Spec: feedback-2

## User goal

"The app should open with a proper welcome, look polished, and let me plan a day's meals the same way I browse recipes." This comes from the owner's second review of the live app on 2026-10-04.

## Screens

### Splash screen (on opening the app)

- Full screen on the app's emerald, with the geometric lattice fading in.
- The logo animates: the two squares of the eight-point star turn into place from opposite directions, then the leaf grows in the center.
- "The Halal Way" and the line "Halal products, ingredients, recipes, and lessons" rise into view.
- The splash fades out after about 2 seconds and shows the screen the user opened. A tap skips it.
- Shown once per app session (each time the app is opened fresh). Not shown again when moving between screens.
- With "reduce motion" set on the device, no movement: the splash shows still and fades quickly.
- Not shown on the projector leaderboard.

### Home

- The "The Halal Way" header box is removed. Home starts with the Learn and Quiz tile.

### Title case headings

- Section names and screen headings use title case, with small words (a, and, to, for, of) in lower case:
  Learn and Quiz, Check a Product, Check Ingredients, Recipes, Meal Plan, Read, Sign Up to Play, Edit Profile, Room Leaderboard, Quiz: Beginner.
- Bottom navigation: Learn, Products, Ingredients, Recipes, Meal Plan, Read.
- Headings inside screens also: Ingredients, Steps, Planned for Wednesday, Add a Recipe, Not Found, Your Level.
- Not changed: titles IFANCA wrote (FAQ questions, recipe and article titles), buttons, and sentences.

### Meal Plan day view

- "Planned for <Day>": each planned recipe opens its recipe page, with Remove.
- "Add a Recipe": the same list as the Recipes section, with the same search, Main Ingredient chips, "8 or fewer ingredients", counts, rows with title, date, and number of ingredients, and "Show more".
- Tapping a recipe opens its full recipe page.

### Recipe page opened from a day

- The back link reads "Back to <Day>" and returns to that day.
- The first button reads "Add to <Day>". After the tap: "Added to <Day>." with a link back to the day. If the recipe is already on that day, the button reads "Added to <Day>" and is disabled.
- "Choose another day" opens the seven day buttons, as on any recipe page.
- The bottom navigation marks Meal Plan.

## Acceptance criteria

1. Given a fresh app session, when the app opens, then the splash shows the logo, "The Halal Way", and the line, and it is gone within 3 seconds.
2. Given the splash is showing, when the user taps it, then it closes at once.
3. Given the splash was shown in this session, when the user moves to another screen or reloads, then it does not show again.
4. Given the device asks for reduced motion, then the splash has no moving parts and is gone within 1.5 seconds.
5. Given the home screen, then there is no "The Halal Way" header box, and the first tile is "Learn and Quiz".
6. Given home, the bottom navigation, and every screen heading listed above, then they read in title case as listed.
7. Given a Meal Plan day, then "Add a Recipe" shows the recipe search, the Main Ingredient chips, the "8 or fewer ingredients" chip, the count "340 recipes", and recipe rows.
8. Given a Meal Plan day, when the user searches "lentil" and taps a row, then that recipe's page opens with its ingredients and steps.
9. Given the recipe page opened from Wednesday, then the back link reads "Back to Wednesday" and the first button reads "Add to Wednesday".
10. Given that page, when the user taps "Add to Wednesday", then "Added to Wednesday." shows, and the day view lists the recipe after tapping the back link.
11. Given a planned recipe in the day view, when the user taps its name, then its recipe page opens.
12. Given the recipe page opened from Recipes (not from a day), then it shows "Add to meal plan" with the day picker, as before.
13. Given any screen at 390px, then nothing scrolls sideways and tap targets are at least 44px.
14. Given the earlier tests, when rerun with the new headings and routes, then they pass.

### Change on 2026-10-04: feedback-3

The owner asked for the splash on every app load and on a tap of the top-left logo, so criterion 3 now covers screen changes and the projector only. The bottom navigation gained Home. See `specs/feedback-3/spec.md`.

## Data needed

- `app/public/data/recipes.json` (340 recipes). No new data.

## Out of scope

- Changing titles written by IFANCA.
- A splash on every screen change.
- Sound or video in the splash.

## Safety notes

- The app shows only what IFANCA published. It never states a halal ruling of its own.
- Any halal status shown must quote IFANCA's source text and link the source URL. Unchanged.
- An item that is not in the data has no status. Unchanged.
- The data date stays in Settings, About, as the owner asked in the first review.
- The app is not an official IFANCA app. The footer stays.
- The splash uses the original logo and pattern. No Crescent-M mark, no IFANCA logo.
