# Test report: cook

- Date: 2026-10-04
- Commit tested: 849088a
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 16 of 16 criteria pass

| # | Criterion | Result | Notes | Screenshot |
|---|---|---|---|---|
| 1 | Recipes tile opens Recipes, and no Cook label remains | Pass |  | [ac-1](screenshots/ac-1.png) |
| 2 | Newest first, with title and date, 341 recipes | Pass |  | [ac-2](screenshots/ac-2.png) |
| 3 | Search lentil | Pass | 14 recipes for lentil | [ac-3](screenshots/ac-3.png) |
| 4 | Chicken chip filters and clears | Pass | 52 recipes with Chicken. Tapping again restored 340. | [ac-4](screenshots/ac-4.png) |
| 5 | 8 or fewer ingredients | Pass | 131 recipes | [ac-5](screenshots/ac-5.png) |
| 6 | Recipe text equals the data, with source link and date | Pass | Pakistani Street-Style Bun Kabob | [ac-6](screenshots/ac-6.png) |
| 7 | Add to Tuesday shows in the meal plan | Pass |  | [ac-7](screenshots/ac-7.png) |
| 8 | Meal plan survives a reload | Pass |  | [ac-8](screenshots/ac-8.png) |
| 9 | Remove takes it out of the plan | Pass |  | [ac-9](screenshots/ac-9.png) |
| 10 | No diet, calorie, healthy, or nutrition words in app text | Pass |  | [ac-10](screenshots/ac-10.png) |
| 11 | No snapshot line on Recipes and Meal plan, date in Settings, About | Pass |  | [ac-11](screenshots/ac-11.png) |
| 13 | Photo loads from ifanca.org when online | Pass | Beef Pasanday, 1280px wide | [ac-13](screenshots/ac-13.png) |
| 14 | Offline shows the placeholder and requests no photo | Pass |  | [ac-14](screenshots/ac-14.png) |
| 15 | A failed photo shows the placeholder | Pass |  | [ac-15](screenshots/ac-15.png) |
| 16 | Lemon Tiramisu is hidden | Pass | search "tiramisu" gives 0 rows | [ac-16](screenshots/ac-16.png) |
| 12 | No sideways scroll and 44px tap targets | Pass |  | [ac-12](screenshots/ac-12.png) |

## Console errors

- Failed to load resource: net::ERR_FAILED
