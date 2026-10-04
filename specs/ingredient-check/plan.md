# Plan: ingredient-check

## Files

| File | Change | Why |
|---|---|---|
| `app/src/lib/ingredients.ts` | add | Types, the name matcher, list splitting, and statement grouping. Pure functions, no React. |
| `app/src/lib/ocr.ts` | add | Lazy wrapper around Tesseract.js with local paths. Loaded only from the Photo tab. |
| `app/src/features/IngredientCheck.tsx` | add | Screen with three tabs and the results view. |
| `app/src/features/IngredientCard.tsx` | add | One ingredient with its statements, including the side-by-side view. |
| `app/src/App.tsx` | change | Route `#/ingredients` to the screen. |
| `app/scripts/copy-tesseract.mjs` | add | Copies the Tesseract worker, LSTM cores, and English data into `public/tesseract/`. |
| `app/package.json` | change | `prebuild` and `predev` run the copy script. |
| `app/.gitignore` | change | Ignore `public/tesseract/`. |

## Components

- `IngredientCheck()`: tabs, the search box with suggestions, the paste text area, the photo flow, and `Results`.
- `Results({ text, index })`: runs the matcher on text and renders a count, `IngredientCard` per match, and a Not found box with `NotInList`.
- `IngredientCard({ item })`: name, then `StatementList` or `SideBySide` when `sources_disagree` is true.
- `Statement({ s })`: recorded status, the quote in a blockquote, the heading or context, source title, date, and a link.
- `SideBySide({ item })`: groups statements by status into columns in a row that scrolls sideways at 390px.
- Reuses `Screen`, `NotInList`, and `useData` from feature 1.

## Data

- `ingredients.json` (77 KB) loads when the screen opens.
- Matcher: one pattern per ingredient name, built at load time. Case is ignored. Spaces, hyphens, and "&" or "and" between words are treated alike, so "Mono- and diglycerides" and "Mono & Diglycerides" match. E-numbers match "E471", "E 471", and "E-471". A final "s" is optional. Patterns use word boundaries.
- Longest match wins. Names are tried longest first and matched spans are masked, so "Mono and diglycerides" is not also counted as "Monoglycerides", and "Calcium stearoyl lactylate" is not also "Stearoyl lactylate".
- List splitting for the Not found box: the text is split at commas, semicolons, periods, new lines, brackets, and parentheses. Leading words "ingredients" and "contains" are dropped. A part with no match goes to the Not found list.
- Single search: names that contain the typed text, plus names whose pattern matches the typed text.
- OCR: `tesseract.js` is imported with `import()` from the Photo tab only. `workerPath`, `corePath`, and `langPath` point to `/tesseract/`. One worker is created on first use and reused.

## Steps

- [x] 1. Copy script, gitignore, `ingredients.ts` matcher, route, and the One ingredient tab with `IngredientCard` for statements without disagreement. (AC 1, 2, 3, 4, 13)
- [x] 2. `SideBySide` for the three disagreeing ingredients. (AC 5, 6, 14)
- [x] 3. Paste a list tab and `Results` with the Not found box and the no-verdict line. (AC 7, 8, 9)
- [x] 4. Photo tab with lazy OCR, progress, editable text, and check. (AC 10, 11, 12, 15)

## Test cases

1. AC 1: tap "Check ingredients" on home. Expect `#/ingredients` and three tabs with the given names.
2. AC 2: type "rennet", tap the "Rennet" suggestion. Expect a card titled Rennet with one statement block per statement in the data, each with a blockquote and a link whose href is the statement URL.
3. AC 3: type "E471". Expect a suggestion "E-471".
4. AC 4: type "quinoa". Expect the fixed missing-item message.
5. AC 5: open Gelatin. Expect the differ line, one column per status (3), and the statement count equal to the data.
6. AC 6: open Lecithin and Mono and diglycerides. Expect 2 columns each and statement counts equal to the data.
7. AC 7: paste the list, tap Check. Expect cards Gelatin and Lecithin and Not found items Sugar and Salt.
8. AC 8: paste the text, tap Check. Expect cards Mono and diglycerides and Artificial and natural flavors and no Monoglycerides card.
9. AC 9: on results, expect the no-verdict line and no text matching "product is halal", "product is haram", or "not halal" outside the fixed message.
10. AC 10: generate a PNG of printed text "INGREDIENTS: SUGAR, GELATIN, SOY LECITHIN, SALT" and set it on the Choose a photo input. Expect a progress line and then a text area containing "GELATIN".
11. AC 11: replace "SALT" with "LARD" in the text area, tap Check. Expect a Lard card.
12. AC 12: record requests during OCR. Expect every request on the app origin (data URLs and blobs excluded).
13. AC 13: expect "October 3, 2026".
14. AC 14: on the Gelatin card expect page scrollWidth 390 and tap targets at least 44px.
15. AC 15: record requests on home and the One ingredient tab. Expect none under `/tesseract/`.

Every acceptance criterion has a test case. No gaps.

Dependencies: `tesseract.js` and `@tesseract.js-data/eng`, for on-device OCR as the owner asked. Already installed.
