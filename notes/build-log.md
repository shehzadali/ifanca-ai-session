# Build log: The Halal Way

Started 2026-10-04. The build runs without approval stops, by instruction from the project owner. Every decision made without asking is recorded here. If context is lost, read the Status table first, then the newest entries.

## Status

| Item | State | Commit or note |
|---|---|---|
| Foundation (routing, shared components) | in progress | |
| Feature 1 product-check | not started | |
| Feature 2 ingredient-check | not started | |
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
