# Spec: app-redesign

## User goal

"I want this to feel like a friendly, colorful app I would keep on my phone, not a manual." This comes from the owner's review of the first live version on 2026-10-04. It touches every screen and adds a player profile and a meal plan section.

## Screens

### Look and feel (every screen)

- A modern font (Plus Jakarta Sans), bundled with the app so it works offline.
- A colorful palette: deep emerald, teal, saffron gold, terracotta, and indigo on warm sand. A matching dark theme.
- Islamic geometric patterns (eight-point star tessellations) drawn in original SVG, used in the home header, section headers, tiles, and the leaderboard. No Crescent-M mark, no IFANCA logo, no crescent shapes.
- A new original app logo: an eight-point star in gold around a small green leaf on emerald. Used on the home screen, in the top bar, and for the installed app icons.

### Top bar (every screen except the projector leaderboard)

- Left: the logo and "The Halal Way" (links home).
- Right: the player's avatar (or a plain person icon before sign up). Tapping it opens Settings.

### Settings (sheet over the current screen)

- Profile: avatar and name, "Edit profile", "Sign out". Sign out asks to confirm and clears the profile and quiz progress on this device.
- Appearance: System, Light, Dark.
- About: "Demo built from IFANCA's public content. Not an official IFANCA app.", the snapshot dates of the data, and a link to ifanca.org.

### Home

- A header band with the geometric pattern, the logo, "The Halal Way", and one short line.
- Tiles with an icon and a label only. No second line. Order:
  1. Learn and quiz (full width). Shows the current level and a horizontal bar with the four steps Not started, Beginner, Learner, Advocate, and how far the player is toward the top level.
  2. Check a product
  3. Check ingredients
  4. Recipes
  5. Meal plan
  6. Read
- No content snapshot line.

### Bottom navigation (inside any section)

- Six items with icon and short label: Learn, Products, Ingredients, Recipes, Meal plan, Read. The current section is highlighted. Tap targets at least 44px. It stays fixed at the bottom of the screen.

### Sign up (before the quiz)

- Opening the quiz without a profile shows "Sign up to play": a name field (2 to 20 characters: letters, numbers, spaces, hyphens, apostrophes, periods, or underscores) and a grid of 12 original avatars. Button "Start playing".
- A line: "Your name and avatar show on the room leaderboard. Saved on this device. No password."
- Lessons stay open without a profile.

### Quiz results

- After each round, the score is posted to the room leaderboard with the profile name and avatar, without a separate step. The result shows "Posted to the room leaderboard" or "Saved on this device. It will post when you are back online."

### Recipes (was Cook)

- The tile, bottom tab, and screen title read "Recipes". Search, filters, recipe pages, and photos work as before.

### Meal plan (new home tile and tab)

- Seven day cards, Monday to Sunday, each with its planned recipes and a count.
- Tapping a day opens that day: its recipes with Remove, a search box "Search recipes to add", and results with an Add button. Added recipes show at once.
- Saved on the device.

### Screens with IFANCA data

- No "IFANCA data snapshot" line and no snapshot line in the footer. The footer keeps "Demo built from IFANCA's public content. Not an official IFANCA app."
- All other content rules stay: quotes with source links, the fixed missing-item message, recipe text unchanged.

### Room leaderboard

- Shows each player's avatar next to the name. Same live updates, QR code, and reset.

## Acceptance criteria

1. Given the home screen, then the app logo shows in the header, and the tiles show labels with no second line.
2. Given the home screen, then the first tile is "Learn and quiz", and the order is Learn and quiz, Check a product, Check ingredients, Recipes, Meal plan, Read.
3. Given a player who passed the Beginner round, when they open home, then the Learn tile shows "Beginner" and a bar filled to at least one third.
4. Given any screen outside Settings, About, then the word "snapshot" and the crawl dates do not appear, and the footer says "Demo built from IFANCA's public content. Not an official IFANCA app." Given Settings, About, then the crawl dates are shown.
5. Given any section screen, then a bottom navigation with six items shows, the current section is marked, and tapping another item opens it.
6. Given the top bar, when the user taps the avatar button, then Settings opens with Profile, Appearance, and About.
7. Given Settings, when the user picks Dark, then the page uses the dark theme, and the choice is kept after a reload.
8. Given no profile, when the user opens the quiz, then the sign up screen shows. When they enter a valid name and pick an avatar, then the quiz rounds show and the top bar shows their avatar.
9. Given a signed up player finishes a round, then the score is posted with their name and avatar, and the leaderboard shows the avatar.
10. Given the network is down when a round ends, then the result says the score is saved on the device, and it posts later.
11. Given the home screen, then there is a "Recipes" tile and no "Cook" label anywhere.
12. Given the Meal plan screen, when the user taps Wednesday, searches "lentil", and taps Add on a result, then that recipe shows under Wednesday, also after a reload.
13. Given the app has been opened once online, when the device goes offline, then home, every section, Settings, and the profile still work, with the bundled fonts.
14. Given any screen at 390px, then nothing scrolls sideways and tap targets are at least 44px. Body text keeps a contrast ratio of at least 4.5 to 1 in both themes.
15. Given the earlier feature tests (product-check, ingredient-check, learn-halal, cook, read, room-leaderboard), when they are run again after the redesign with updated selectors, then they pass.

### Change on 2026-10-04: feedback-2

Headings are now in title case, the home header box became a splash screen, and the Meal Plan day lists recipes like the Recipes section. Test 2 and test 12 were updated to match. See `specs/feedback-2/spec.md`.

### Change on 2026-10-04: feedback-3

The bottom navigation now has seven items (Home first) and also shows on home. Test 5 was updated to match.

## Data needed

- All existing files in `app/public/data/`. No new data.
- Supabase: a new `avatar` column and an updated name rule. **Owner action:** run `supabase/002_profiles.sql` in the SQL editor. Until then the app posts without the avatar and the leaderboard shows initials.

## Out of scope

- Real accounts, passwords, or signing in on a second device.
- Uploaded photos as avatars.
- Text size settings and languages other than English.
- Changes to IFANCA content or to the quiz questions.

## Safety notes

- The app shows only what IFANCA published. It never states a halal ruling of its own.
- Any halal status shown must quote IFANCA's source text and link the source URL. Unchanged by this redesign.
- An item that is not in the data has no status. The fixed missing-item message is unchanged.
- Product data is a dated demo snapshot. **Change requested by the owner:** the snapshot date is no longer shown on each screen. It stays in Settings, About, so the age of the data is still disclosed. The missing-product message still says the list is a copy of IFANCA's website from a past date and can change.
- The app is not an official IFANCA app. The footer and About say so.
- The geometric patterns and logo are original artwork. No Crescent-M mark, no IFANCA logo.
- Only a name and a preset avatar are collected. Both are shown to the room.
