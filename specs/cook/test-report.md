# Test report: cook

- Date: 2026-10-04
- Commit tested: f3eed7b
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 16 of 16 criteria pass

| # | Criterion | Result | Notes | Screenshot |
|---|---|---|---|---|
| 1 | Cook tile mentions the meal plan and opens Cook | Pass |  | [ac-1](screenshots/ac-1.png) |
| 2 | Newest first, with title and date, 341 recipes | Pass |  | [ac-2](screenshots/ac-2.png) |
| 3 | Search lentil | Pass | 14 recipes for lentil | [ac-3](screenshots/ac-3.png) |
| 4 | Chicken chip filters and clears | Pass | 52 recipes with Chicken. Tapping again restored 340. | [ac-4](screenshots/ac-4.png) |
| 5 | 8 or fewer ingredients | Pass | 131 recipes | [ac-5](screenshots/ac-5.png) |
| 6 | Recipe text equals the data, with source link and date | Pass | Pakistani Street-Style Bun Kabob | [ac-6](screenshots/ac-6.png) |
| 7 | Add to Tuesday shows in the meal plan | Pass |  | [ac-7](screenshots/ac-7.png) |
| 8 | Meal plan survives a reload | Pass |  | [ac-8](screenshots/ac-8.png) |
| 9 | Remove takes it out of the plan | Pass |  | [ac-9](screenshots/ac-9.png) |
| 10 | No diet, calorie, healthy, or nutrition words in app text | Pass |  | [ac-10](screenshots/ac-10.png) |
| 11 | Snapshot date on every Cook screen | Pass |  | [ac-11](screenshots/ac-11.png) |
| 13 | Photo loads from ifanca.org when online | Pass | Beef Pasanday, 1280px wide | [ac-13](screenshots/ac-13.png) |
| 14 | Offline shows the placeholder and requests no photo | Pass |  | [ac-14](screenshots/ac-14.png) |
| 15 | A failed photo shows the placeholder | Pass |  | [ac-15](screenshots/ac-15.png) |
| 16 | Lemon Tiramisu is hidden | Pass | search "tiramisu" gives 0 rows | [ac-16](screenshots/ac-16.png) |
| 12 | No sideways scroll and 44px tap targets | Pass |  | [ac-12](screenshots/ac-12.png) |

## Console errors

- Failed to load resource: net::ERR_FAILED

## Notes on this run

- The one console error is "Failed to load resource: net::ERR_FAILED". AC 15 causes it on purpose by blocking the photo request.
- AC 14 asserts while offline. The harness screenshot `ac-14.png` is taken after the network is back, so it shows the photo. The offline view is in [ac-14-offline.png](screenshots/ac-14-offline.png).
- AC 15 runs in a fresh browser context. In the first run it shared the context with AC 13, the browser served the photo from memory, and the blocked request never fired. That was a test fault, not an app fault.

## Screenshot review

All screenshots were checked by eye at 390px. The list, chips, recipe page with photo, offline and failed placeholders, day picker, and meal plan render cleanly.

Observation, not a failure: some recipe titles use health words, for example "Antioxidant-Rich Yogurt Parfait". These are IFANCA's titles. The app adds no such words of its own (AC 10).

## Safety check

- The Cook screens state no halal status.
- Ingredient and step lines equal recipes.json (AC 6). Every recipe shows its published date and a link to the original.
- "Lemon Tiramisu" is no longer in the data or the app (AC 16).
- Photos load only from their ifanca.org URLs while online. The live smoke test checks that the service worker stores none of them.
- The feature is called a meal plan. App text has no diet, calorie, healthy, or nutrition words (AC 10).
