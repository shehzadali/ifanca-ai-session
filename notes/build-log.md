# Build log: The Halal Way

Started 2026-10-04. The build runs without approval stops, by instruction from the project owner. Every decision made without asking is recorded here. If context is lost, read the Status table first, then the newest entries.

## Status

| Item | State | Commit or note |
|---|---|---|
| Foundation (routing, shared components) | done | 8492252 |
| Feature 1 product-check | done, 12 of 12 pass | 96e4f81 to 573192d |
| Feature 2 ingredient-check | done, 15 of 15 pass | spec 9b06901 to report |
| Feature 3 learn-halal | done, 13 of 13 pass | 476fcd0 to report |
| Feature 4 cook | done, 12 of 12 pass | 6dbfb03 to report |
| Feature 5 read | done, 10 of 10 pass | a397f93 to report |
| PWA (manifest, icons, offline, noindex) | done, local smoke 8 of 8 | see git log "pwa:" |
| /ship command and smoke test | in progress | `app/tests/smoke.mjs` done |
| Vercel project and production deploy | not started | |
| QR code | not started | |
| Live smoke test | not started | |

## How each feature is built

1. journey-to-spec writes `specs/<feature>/spec.md`.
2. spec-to-plan writes `specs/<feature>/plan.md`.
3. implement-feature makes one commit per plan step.
4. test-feature writes `specs/<feature>/test-report.md` with screenshots.

The skills say to show the user the criteria or the plan and ask before moving on. The owner asked for no stops, so those review points are skipped and the owner reviews afterward.

## Decisions

### General

- D1. Approval steps in the skills are skipped (see above).
- D2. Hash routes stay, as in the scaffold. Feature screens move to `app/src/features/`. Shared parts go to `app/src/components/` and `app/src/lib/`.
- D3. Product categories contain HTML entities such as `&amp;` (1,815 values). They are decoded in the browser when the data loads. The data files are not changed.
- D4. Snapshot date shown as "IFANCA data snapshot: October 3, 2026" using the `crawl_date` of the file the screen reads.
- D5. New dependencies: `tesseract.js` and `@tesseract.js-data/eng` for on-device OCR (asked for by the owner), and `qrcode` as a dev dependency for the QR files. Nothing else.
- D6. Tesseract files (worker, LSTM core variants, English data `4.0.0_best_int`, about 3 MB) are copied from node_modules into `public/tesseract/` by a `prebuild` script. They are served from the app itself, not a third-party CDN. They are not committed.
- D7. Shared test harness `specs/test-lib.mjs` and report writer `specs/report.mjs`. Each feature test uses them so results look the same. Tests block service workers so each run reads fresh files.
- D8. The preview server stays running across features instead of stopping after each test run. It serves `dist/`, which each build replaces. It is stopped at the end.
- D9. On feature screens the large home header becomes a compact app bar to save space on a phone.

### Feature 1 product-check

- D10. Search matches every typed word against name, company, and category together. No fuzzy matching, so results are easy to explain.
- D11. Category filter is a native select with counts, not chips. There are 62 categories, too many for chips at 390px.
- D12. 50 cards at a time with "Show more". Measured 25 ms per keystroke with 4x CPU slowdown.
- D13. No marketplace or country filter. Cut to keep the screen simple. Search does not cover "Sold in".
- D14. The empty state links to the current list on ifanca.org and to the ingredient check.
- D15. The source list repeats a product once per country. Shown as published, not merged.

### Feature 2 ingredient-check

- D16. Matching is on whole words, case ignored. Only spelling variants are matched: hyphens and spaces, "and", "&", or "/" between words, an optional final "s", and E-numbers written as "E471", "E 471", or "E-471".
- D17. Three names were merged by the Stage 3 export from several printed spellings. The matcher accepts those spellings: "Artificial and natural flavors" matches "natural flavors", "artificial flavors", and "artificial/natural flavors". The same for colorings. "Yellow No. 5" matches "Yellow 5" and "Yellow #5".
- D18. Longest name wins. "Mono and diglycerides" is not also shown as "Monoglycerides".
- D19. "Alcohol" matches inside "sugar alcohol". Left as is, because the card shows IFANCA's context ("Listed for Mouth Wash"), so the reader can judge.
- D20. Status words come from ingredients.json and are labeled "Recorded status in this source". The mapping of IFANCA's headings to status words was made in Stage 3 and is shown next to the heading text.
- D21. Side by side at 390px: one column per recorded status, in a row that scrolls sideways inside the card, with a line that says how many columns there are. Three full columns do not fit on a phone. On wider screens the columns share the width.
- D22. The Not found box sits above the ingredient cards so both parts of the answer show without long scrolling.
- D23. Photos are shrunk to a 2000px long side before OCR. English only. The OCR files (about 7 MB on first use) are cached by the service worker on first use, so the Photo tab works offline only after one use.
- D24. "Take a photo" uses the camera input. "Choose a photo" opens the photo library. Both read on the device.

### Feature 3 learn-halal

- D25. quiz.json did not exist. It was written in this build: 18 questions, 6 per level. Each question quotes one sentence from one FAQ answer and links that FAQ. Questions that touch a status start with "According to IFANCA". **IFANCA should review it before any wider use.**
- D26. `scripts/check-quiz.mjs` runs before every build. The build fails if a quote is not word for word in its FAQ answer, a FAQ link is unknown, or the count is outside 15 to 20.
- D27. Levels are three quiz rounds: Beginner, Learner, Advocate. Beginner is open. A round opens when the round before it is passed with 4 or more of 6. "Your level" is the highest round passed. Saved in localStorage (`thw.quiz`).
- D28. Lesson order: five topic groups (Halal basics, Ingredients, Eating out, Certification for companies, IFANCA policies), starting with "What is halal?". Grouping only. Text is unchanged.
- D29. Lessons are split into paragraphs of about 60 words at sentence breaks. No words change. The test joins the paragraphs and compares with faqs.json for all 26.
- D30. The crawl flattened the bulleted list in "What is halal?" into running text. The app shows it as stored. Fix belongs in the crawl export.
- D31. Opening a lesson marks it read (`thw.learn.read`). No separate "mark as read" button.

### Feature 4 cook

- D32. Filters are "Main ingredient" (Chicken, Beef, Lamb or goat, Fish and seafood, one at a time) and "8 or fewer ingredients". A main ingredient matches when the ingredient lines name it. These are plain text facts, not categories the app invents. Counts: Chicken 52, 8 or fewer 131.
- D33. Search covers titles and ingredient lines. Newest first. 30 rows at a time.
- D34. No recipe photos. They are hosted on ifanca.org, would load from IFANCA's server on every view, and would not work offline.
- D35. Ingredient and step lines that end with a colon show as small headings. Steps are numbered by the app. The words are unchanged.
- D36. Meal plan: seven days, Monday to Sunday, any number of recipes per day. Stored by recipe URL in localStorage (`thw.mealplan`). Clearing asks for confirmation.
- D37. Lemon Tiramisu lists "limoncello (optional)". Left unchanged as IFANCA published it. Flagged in the test report for IFANCA to review.

### Feature 5 read

- D38. Theme chips with counts from the data. One theme at a time. Labels in sentence case. A line says themes are approximate, as the data note says.
- D39. Each card leads with "Published <date>" in bold, then title, type and theme, the stored 40-word preview, and the link.
- D40. 20 cards at a time. Search covers title and preview only, because the full text is not in the data.
- D41. The filter chip moved to `components/Chip.tsx` so Cook and Read share it.

### PWA

- D42. New original icon: a cream winding path with a small green leaf on the brand green. The scaffold icon was a crescent with a dot. It was replaced so nothing in the app resembles IFANCA's Crescent-M mark.
- D43. Icon files from `scripts/make-icons.mjs` (Playwright renders the SVG): 192, 512, maskable 512 (full bleed, art in the safe zone), Apple touch 180, favicon 32, and the SVG. They are committed. The script is run by hand.
- D44. Manifest name "The Halal Way", short name "Halal Way", theme color #1f5f4a (the existing brand green), background #f7f5ef.
- D45. Offline: all data files are now precached (40 entries, about 4.3 MB) so every screen works offline after the first visit. This changes a Stage 3 decision that cached data only on first use. The precache downloads in the background after the first page shows, so it does not slow the first load. The precache size limit is raised to 4 MB for products.json.
- D46. OCR files are not precached. The Photo tab works offline only after one photo has been read online.
- D47. noindex in three places: a robots meta tag, `robots.txt` with "Disallow: /", and an `X-Robots-Tag` header in `vercel.json`.
- D48. `vercel.json` sets `sw.js` to revalidate on every load, so installed copies find a new deployment on the next open. Hashed assets are cached for a year.
- D49. The footer date now uses the same format as the screens ("October 3, 2026").
- D50. `app/tests/smoke.mjs` checks all five features at 390px, the manifest, noindex, robots.txt, and offline loading of all five screens. It takes the base URL as an argument.
