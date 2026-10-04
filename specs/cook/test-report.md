# Test report: cook

- Date: 2026-10-04
- Commit tested: 3054384
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 12 of 12 criteria pass

| # | Criterion | Result | Notes | Screenshot |
|---|---|---|---|---|
| 1 | Cook tile mentions the meal plan and opens Cook | Pass |  | [ac-1](screenshots/ac-1.png) |
| 2 | Newest first, with title and date, 341 recipes | Pass |  | [ac-2](screenshots/ac-2.png) |
| 3 | Search lentil | Pass | 14 recipes for lentil | [ac-3](screenshots/ac-3.png) |
| 4 | Chicken chip filters and clears | Pass | 52 recipes with Chicken. Tapping again restored 341. | [ac-4](screenshots/ac-4.png) |
| 5 | 8 or fewer ingredients | Pass | 131 recipes | [ac-5](screenshots/ac-5.png) |
| 6 | Recipe text equals the data, with source link and date | Pass | Lemon Tiramisu | [ac-6](screenshots/ac-6.png) |
| 7 | Add to Tuesday shows in the meal plan | Pass |  | [ac-7](screenshots/ac-7.png) |
| 8 | Meal plan survives a reload | Pass |  | [ac-8](screenshots/ac-8.png) |
| 9 | Remove takes it out of the plan | Pass |  | [ac-9](screenshots/ac-9.png) |
| 10 | No diet, calorie, healthy, or nutrition words in app text | Pass |  | [ac-10](screenshots/ac-10.png) |
| 11 | Snapshot date on every Cook screen | Pass |  | [ac-11](screenshots/ac-11.png) |
| 12 | No sideways scroll and 44px tap targets | Pass |  | [ac-12](screenshots/ac-12.png) |

## Console errors

None.

## Screenshot review

All screenshots were checked by eye at 390px. The list, chips, recipe page, day picker, and meal plan render cleanly.

Content observations, not failures. The app shows recipe text as published.
- "Lemon Tiramisu" (June 30, 2026) lists "2 tablespoons limoncello (optional)". It is the only alcohol word in the 341 ingredient lists. IFANCA may want to review it on its own site.
- Some recipe titles use health words, for example "Antioxidant-Rich Yogurt Parfait". These are IFANCA's titles. The app adds no such words of its own (AC 10).

## Safety check

- The Cook screens state no halal status.
- Ingredient and step lines equal recipes.json (AC 6). Every recipe shows its published date and a link to the original.
- The feature is called a meal plan. App text has no diet, calorie, healthy, or nutrition words (AC 10).
- The snapshot date is shown on every Cook screen (AC 11).
