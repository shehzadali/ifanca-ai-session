# Test report: share

- Date: 2026-10-05
- Commit tested: 495b5e7
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 8 of 8 criteria pass

| # | Criterion | Result | Notes | Screenshot |
|---|---|---|---|---|
| 1 | Share on a recipe page | Pass |  | [ac-1](screenshots/ac-1.png) |
| 2 | Share on a lesson page | Pass |  | [ac-2](screenshots/ac-2.png) |
| 3 | Web Share on a recipe: title, text with source, app link | Pass | Beef Pasanday, from IFANCA's public content in The Halal Way demo. Original: https://ifanca.org/resources/beef-pasanday/ | [ac-3](screenshots/ac-3.png) |
| 4 | Web Share on a lesson | Pass |  | [ac-4](screenshots/ac-4.png) |
| 5 | No Web Share: copies the link | Pass |  | [ac-5](screenshots/ac-5.png) |
| 6 | Closing the share sheet does nothing | Pass |  | [ac-6](screenshots/ac-6.png) |
| 7 | No Web Share and no clipboard: a selected field | Pass |  | [ac-7](screenshots/ac-7.png) |
| 8 | 390px layout and button size | Pass |  | [ac-8](screenshots/ac-8.png) |

## Console errors

None.

## First run

- AC 2 failed on a timing race in the test. It counted buttons before the lesson loaded. The test now waits for the lesson text.
- AC 7 failed on a real bug. The link field was selected before it was on the page. It is now selected after it renders. Fixed in the app, then retested.

## Screenshot review

Checked by eye at 390px. The Share button sits under the title area on recipes and lessons.

## Safety check

- The shared text names IFANCA as the source, includes the original ifanca.org URL, and says it is a demo.
- No status is shown or shared.
