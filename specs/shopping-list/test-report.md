# Test report: shopping-list

- Date: 2026-10-05
- Commit tested: 190799a
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 10 of 10 criteria pass

| # | Criterion | Result | Notes | Screenshot |
|---|---|---|---|---|
| 1 | Three Recipes tabs, Shopping List opens its route | Pass |  | [ac-1](screenshots/ac-1.png) |
| 2 | Empty plan shows the empty state | Pass |  | [ac-2](screenshots/ac-2.png) |
| 3 | Sugar from two recipes groups into one item | Pass | Sugar / 1 1/4 cups sugar (Ras Malai Milk Cake) / 1/2-1 teaspoon sugar (optional) (Udang Balado (Indonesian Chili-Tomato Shrimp)) | [ac-3](screenshots/ac-3.png) |
| 4 | Every non-heading line appears word for word | Pass | 27 lines | [ac-4](screenshots/ac-4.png) |
| 5 | A recipe planned on two days counts once | Pass |  | [ac-5](screenshots/ac-5.png) |
| 6 | An item with IFANCA guidance opens the sheet | Pass |  | [ac-6](screenshots/ac-6.png) |
| 7 | An item without guidance ticks and moves to the end | Pass | all purpose flour | [ac-7](screenshots/ac-7.png) |
| 8 | Ticks stay after reload | Pass |  | [ac-8](screenshots/ac-8.png) |
| 9 | Clear ticks | Pass |  | [ac-9](screenshots/ac-9.png) |
| 10 | 390px layout and tap targets, sheet closed and open | Pass |  | [ac-10](screenshots/ac-10.png) |

## Console errors

None.

## Screenshot review

Checked by eye at 390px. Items, ticks, the guidance badge, and the guidance sheet render cleanly. `ac-6-sheet.png` shows the sheet for shredded cheddar cheese with IFANCA's two Cheese statements.

## Notes

- No recipe in recipes.json names gelatin, so the guidance test uses cheese, which is in ingredients.json.
- Grouping uses a simplified name only to place lines together. Each line is shown as published, with its recipe.

## Safety check

- Guidance shows only IFANCA's statements, each quoted with its source link, through the same card as the ingredient check.
- The sheet says it is not a verdict on the product. Items without a match show no status.
