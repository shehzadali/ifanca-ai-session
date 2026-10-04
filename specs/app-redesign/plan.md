# Plan: app-redesign

## Files

| File | Change | Why |
|---|---|---|
| `app/src/index.css` | change | Font import, color tokens for light and dark, pattern utilities. |
| `app/src/components/Pattern.tsx` | add | Original eight-point star tessellation as an SVG pattern, reused in bands, tiles, and the leaderboard. |
| `app/src/components/Logo.tsx` | add | The new logo as inline SVG. |
| `app/public/icon.svg`, `favicon.svg`, PNG icons | change | New logo. Rendered by `scripts/make-icons.mjs`. |
| `app/src/components/Icons.tsx` | add | Section icons, shared by home tiles and the bottom navigation. |
| `app/src/components/Avatar.tsx` | add | 12 original avatars (geometric motif on a color) and the avatar picker. |
| `app/src/lib/profile.ts` | add | Player profile on the device: name, avatar, sign out. |
| `app/src/lib/theme.ts` | add | Appearance setting (system, light, dark), applied to `<html data-theme>`. |
| `app/src/components/TopBar.tsx` | add | Logo, title, avatar button. |
| `app/src/components/Settings.tsx` | add | Settings sheet: profile, appearance, about with crawl dates. |
| `app/src/components/BottomNav.tsx` | add | Six-item section navigation. |
| `app/src/components/Screen.tsx` | change | Patterned section header, no snapshot line. Back link only for sub-screens. |
| `app/src/components/Snapshot.tsx` | remove | No longer shown on screens. |
| `app/src/App.tsx` | change | New shell, new home, routes `recipes` and `plan` (old `cook` routes still work), footer without snapshot. |
| `app/src/features/Cook.tsx` | change | Title "Recipes", routes under `#/recipes`. |
| `app/src/features/MealPlan.tsx` | change | Day cards, day view with search and Add. |
| `app/src/features/Learn.tsx`, `Quiz.tsx` | change | Sign up gate before the quiz, auto post after a round, level helpers for the home bar. |
| `app/src/features/SignUp.tsx` | add | Name and avatar form. |
| `app/src/features/PostScore.tsx` | change | Posts automatically with the profile. Shows status only. |
| `app/src/lib/board.ts` | change | Send the avatar. Fall back to the old function when the database has not been updated. |
| `app/src/features/Leaderboard.tsx` | change | Avatars, pattern styling. |
| Other feature screens | change | Remove snapshot props, use new tokens. Missing-product text drops the word "snapshot". |
| `supabase/002_profiles.sql` | add | Avatar column, wider name rule, new `post_score` with avatar. |
| `supabase/test-setup.sh` | change | Also run and check 002. |
| `app/package.json` | change | Add `@fontsource-variable/plus-jakarta-sans`. |
| `app/vite.config.ts` | change | Precache `woff2`. New theme and background colors in the manifest. |
| `specs/*/test.mjs`, `app/tests/smoke.mjs` | change | Selectors and texts that the redesign changes. |

## Dependency

`@fontsource-variable/plus-jakarta-sans`: a modern font served from the app itself, so it works offline and loads no third-party font server. One variable woff2 file for Latin.

## Components

- `TopBar({ onSettings })`: logo link home, avatar button.
- `Settings({ open, onClose })`: bottom sheet. Profile block, appearance segmented control, about.
- `BottomNav({ current })`: six links with icons.
- `Screen({ title, back?, tone?, children })`: header band with pattern and title, then content.
- `Avatar({ id, size })`, `AvatarPicker({ value, onChange })`.
- `SignUp({ onDone })`: name field, picker, start button.
- `LevelBar({ quiz })`: four steps and fill.
- `MealPlan({ recipes, day? })`: week view, or one day with search and Add.

## Data

- No new data files. Crawl dates for About come from the `crawl_date` of faqs.json, products.json, recipes.json, and articles.json, loaded when About opens.
- Device storage: `thw.profile` `{ name, avatar }`, `thw.theme` (`system`, `light`, `dark`). Existing keys stay.
- Level bar fill: rounds passed count as whole steps. The best score in the next round adds a part of a step. Three steps make the full bar.

## Steps

- [ ] 1. Design base: font, tokens with dark theme, pattern, logo, new icons, theme setting. (AC 7, 14)
- [ ] 2. Shell: top bar, settings sheet, bottom navigation, new home with level bar, footer and screens without snapshot lines, Recipes rename and routes. (AC 1, 2, 3, 4, 5, 6, 11)
- [ ] 3. Meal plan section with day view, search, and Add. (AC 12)
- [ ] 4. Profile: avatars, sign up gate, auto post with avatar, leaderboard avatars, `002_profiles.sql` with local tests, fallback when 002 has not run. (AC 8, 9, 10)
- [ ] 5. Restyle feature screens to the new look, check both themes, offline check. (AC 13, 14)
- [ ] 6. Update the earlier feature tests and the smoke test for the new texts and routes, and run them all. (AC 15)

## Test cases

1. AC 1: on home, expect the logo SVG in the header and tile texts that are one line each (label only).
2. AC 2: read tile labels in order. Expect the six labels in the spec order.
3. AC 3: set `thw.quiz` to Beginner passed. Expect "Beginner" on the Learn tile and a bar width of at least 33 percent.
4. AC 4: visit home and every section. Expect no "snapshot" and no "2026-10-0" or "October 3, 2026" text outside Settings. Open About. Expect the dates.
5. AC 5: open Products. Expect 6 nav items, "Products" marked current. Tap "Read". Expect `#/read`.
6. AC 6: tap the avatar button. Expect a dialog with the three section titles.
7. AC 7: pick Dark. Expect `data-theme="dark"` and a dark body background. Reload. Expect dark again.
8. AC 8: open the quiz with no profile. Expect sign up. Enter "Amina", pick an avatar, tap Start. Expect rounds and the avatar in the top bar.
9. AC 9: with the stand-in backend, finish a round. Expect one post with the avatar id. Open the leaderboard. Expect the avatar next to the name.
10. AC 10: with the backend down, finish a round. Expect the saved on device message and a pending post.
11. AC 11: expect a "Recipes" tile and no "Cook" text on home, in the nav, or on the recipes screen.
12. AC 12: open Meal plan, tap Wednesday, type "lentil", tap the first Add. Expect it listed under Wednesday. Reload. Expect it still there.
13. AC 13: load once with the service worker, go offline, open home, every tab, Settings, and the quiz. Expect them all to render, and the font to be Plus Jakarta Sans.
14. AC 14: check scroll width and tap targets on every screen at 390px in both themes. Check computed contrast of body text against its background.
15. AC 15: run every feature test and the smoke test. Expect all to pass.

Every acceptance criterion has a test case. No gaps.
