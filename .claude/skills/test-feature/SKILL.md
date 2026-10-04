---
name: test-feature
description: Test a feature of The Halal Way app against the acceptance criteria in specs/<feature>/spec.md using Playwright at 390px width, and write specs/<feature>/test-report.md with screenshots. Use after implement-feature.
---

# Test feature

## Steps

1. Read the acceptance criteria in `specs/<feature>/spec.md` and the test cases in `plan.md`.
2. Start the app: `npm run build && npm run preview -- --port 4173` in `app/`, in the background.
3. Write a Playwright script at `specs/<feature>/test.mjs`:
   - Chromium, viewport 390 x 844, `deviceScaleFactor: 2`, `isMobile: true`, `hasTouch: true`.
   - One block per acceptance criterion. Do the actions, then assert the expected result.
   - Take a screenshot per criterion to `specs/<feature>/screenshots/ac-<n>.png`.
   - Catch each failure, record it, and keep going so every criterion gets a result.
   - Also record console errors.
4. Run it with `node specs/<feature>/test.mjs`. If `playwright` is not installed, run `npm i -D playwright` in `app/` first.
5. Look at each screenshot. A passing assertion with a broken-looking screen is a fail.
6. Write `specs/<feature>/test-report.md`:
   - Date, commit hash, viewport.
   - A table: criterion number, criterion, result (Pass or Fail), notes, screenshot link.
   - Console errors, if any.
   - Safety check: confirm no screen states a halal status without IFANCA source text and a link.
7. Stop the preview server. Commit the report, script, and screenshots.

Report results faithfully. Do not change app code in this skill. List failures for the next implement-feature run.

## Writing style

US English. No em dashes, no semicolons, no contractions. Short sentences.
