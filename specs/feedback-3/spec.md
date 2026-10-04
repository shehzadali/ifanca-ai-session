# Spec: feedback-3

## User goal

"I want to see the welcome animation whenever I open the app or tap the logo, and still have a quick way home without it." This comes from the owner's third review on 2026-10-04.

## Screens

### Splash

- Plays on every app load, including a reload. It is no longer limited to once per session.
- Plays again when the user taps the logo and name at the top left. The app goes to home behind it.
- Same animation, tap to skip, and reduced motion behavior as in feedback-2.
- Never on the projector leaderboard.

### Bottom navigation

- Seven items: Home, Learn, Products, Ingredients, Recipes, Meal Plan, Read.
- Shown on home too, with Home marked. Shown on every section screen as before.
- Home goes to the home screen with no splash.
- Each item stays at least 44px tall. Labels fit at 390px.

## Acceptance criteria

1. Given the app is opened, then the splash plays. Given the page is reloaded, then it plays again.
2. Given any screen, when the user taps the logo at the top left, then the splash plays and home is shown when it ends.
3. Given the user is already on home, when they tap the logo, then the splash plays again.
4. Given any section screen, when the user taps Home in the bottom navigation, then home opens and no splash plays.
5. Given home, then the bottom navigation shows seven items with Home marked.
6. Given any section screen, then Home is the first item, and the current section is marked.
7. Given the splash is playing, when the user taps it, then it closes at once.
8. Given reduced motion, then the splash has no moving parts and closes within 1.5 seconds, on load and on a logo tap.
9. Given the projector leaderboard, then no splash plays on load.
10. Given any screen at 390px, then nothing scrolls sideways, every navigation item is at least 44px tall, and no label overflows its item.
11. Given the earlier tests, when rerun, then they pass.

## Data needed

- None.

## Out of scope

- A setting to turn the splash off.
- A splash on other navigation.

## Safety notes

- The app shows only what IFANCA published. It never states a halal ruling of its own.
- Any halal status shown must quote IFANCA's source text and link the source URL. Unchanged.
- An item that is not in the data has no status. Unchanged.
- The data date stays in Settings, About, as the owner asked.
- The app is not an official IFANCA app. The footer stays.
- The splash uses the original logo and pattern only.
