# Build log: The Halal Way

Started 2026-10-04. The build runs without approval stops, by instruction from the project owner. Every decision made without asking is recorded here. If context is lost, read the Status table first, then the newest entries.

## Status

| Item | State | Commit or note |
|---|---|---|
| Foundation (routing, shared components) | done | 8492252 |
| Feature 1 product-check | done, 12 of 12 pass | 96e4f81 to 573192d |
| Feature 2 ingredient-check | in progress | |
| Feature 3 learn-halal | not started | |
| Feature 4 cook | not started | |
| Feature 5 read | not started | |
| PWA (manifest, icons, offline, noindex) | not started | |
| /ship command and smoke test | not started | |
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
