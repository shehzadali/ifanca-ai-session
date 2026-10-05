# Test report: ingredient-check

- Date: 2026-10-05
- Commit tested: 495b5e7
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 16 of 16 criteria pass

| # | Criterion | Result | Notes | Screenshot |
|---|---|---|---|---|
| 1 | Home tile opens the screen with three tabs | Pass |  | [ac-1](screenshots/ac-1.png) |
| 2 | Rennet card quotes each statement with source and link | Pass |  | [ac-2](screenshots/ac-2.png) |
| 3 | E471 suggests E-471 | Pass |  | [ac-3](screenshots/ac-3.png) |
| 4 | No match shows the fixed message | Pass |  | [ac-4](screenshots/ac-4.png) |
| 5 | Gelatin shows statements side by side | Pass | 3 columns, 8 statements | [ac-5](screenshots/ac-5.png) |
| 6 | Lecithin and Mono and diglycerides side by side | Pass | Lecithin 2 columns, 2 statements. Mono and diglycerides 2 columns, 9 statements | [ac-6](screenshots/ac-6.png) |
| 7 | Pasted list matches Gelatin and Lecithin, lists Sugar and Salt as not found | Pass |  | [ac-7](screenshots/ac-7.png) |
| 8 | Longest match wins for mono and diglycerides | Pass | Mono and diglycerides, Artificial and natural flavors | [ac-8](screenshots/ac-8.png) |
| 9 | No verdict on the product | Pass |  | [ac-9](screenshots/ac-9.png) |
| 10 | Photo shows progress then editable recognized text | Pass | recognized: INGREDIENTS: SUGAR, GELATIN, SOY LECITHIN, SALT, NATURAL FLAVORS. | [ac-10](screenshots/ac-10.png) |
| 11 | Edited text is what gets checked | Pass | Gelatin, Lecithin, Lard, Artificial and natural flavors | [ac-11](screenshots/ac-11.png) |
| 12 | OCR files load from the app origin only | Pass | 5 requests, all on http://localhost:4173 | [ac-12](screenshots/ac-12.png) |
| 13 | No snapshot line on screen, date in Settings, About | Pass |  | [ac-13](screenshots/ac-13.png) |
| 14 | No page side scroll, tap targets 44px | Pass |  | [ac-14](screenshots/ac-14.png) |
| 15 | No OCR files before the Photo tab | Pass |  | [ac-15](screenshots/ac-15.png) |
| 16 | Enter opens the top match | Pass |  | [ac-16](screenshots/ac-16.png) |

## Console errors

None.

## Screenshot review

All screenshots were checked by eye at 390px. Tabs, cards, the side-by-side columns, the Not found box, and the photo flow render cleanly. The second status column peeks in from the right, which shows the user there is more to swipe.

The OCR test uses `specs/fixtures/label.png`, a printed label rendered by `specs/fixtures/make-label.mjs`. A real phone photo with glare or a curved package will read less well. That is why the recognized text is editable before checking.

## Safety check

- Every status word on the screen sits beside a quote of IFANCA's source text and a link to the source URL (AC 2, 5, 6).
- Where sources disagree, every statement is shown in a column for its recorded status. None is picked (AC 5, 6).
- Results never give a verdict on the product. The no-verdict line is shown on the screen and above results (AC 9).
- Items with no match show only the fixed message "Not in IFANCA's published list. This does not mean it is not certified or not halal." (AC 4, 7).
- The photo is read on the device. All OCR files load from the app origin (AC 12).
