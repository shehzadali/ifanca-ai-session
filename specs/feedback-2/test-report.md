# Test report: feedback-2

- Date: 2026-10-05
- Commit tested: 495b5e7
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 14 of 14 criteria pass

| # | Criterion | Result | Notes | Screenshot |
|---|---|---|---|---|
| 1 | Splash shows logo and texts, and is gone within 3 seconds | Pass | gone after 2.9 s from navigation | [ac-1](screenshots/ac-1.png) |
| 2 | A tap closes the splash | Pass | closed 355 ms after the tap | [ac-2](screenshots/ac-2.png) |
| 3 | No splash on screen changes or the projector (since feedback-3 it plays on every load) | Pass |  | [ac-3](screenshots/ac-3.png) |
| 4 | Reduced motion: no movement, gone within 1.5 seconds | Pass | no animated parts, gone after 1.1 s | [ac-4](screenshots/ac-4.png) |
| 5 | No header box on home, Learn and Quiz first | Pass |  | [ac-5](screenshots/ac-5.png) |
| 6 | Title case headings | Pass | 8 screen titles, nav, tiles, and the leaderboard match. Learn section headings use CSS uppercase. | [ac-6](screenshots/ac-6.png) |
| 7 | Day view shows the Recipes list | Pass |  | [ac-7](screenshots/ac-7.png) |
| 8 | Search lentil, tap a row, the recipe page opens | Pass | Maash Ki Daal | [ac-8](screenshots/ac-8.png) |
| 9 | Back to Wednesday and Add to Wednesday | Pass |  | [ac-9](screenshots/ac-9.png) |
| 10 | Add, then back: listed under Wednesday | Pass | Maash Ki Daal | [ac-10](screenshots/ac-10.png) |
| 11 | A planned recipe opens its page | Pass |  | [ac-11](screenshots/ac-11.png) |
| 12 | From Recipes, the day picker is unchanged | Pass |  | [ac-12](screenshots/ac-12.png) |
| 13 | 390px layout and tap targets | Pass |  | [ac-13](screenshots/ac-13.png) |
| 14 | Earlier tests pass with the new headings and routes | Pass | product-check 14/14, ingredient-check 16/16, learn-halal 14/14, cook 18/18, read 10/10, room-leaderboard 13/13, app-redesign 15/15 | [ac-14](screenshots/ac-14.png) |

## Console errors

None.

## How this was tested

- Run on the preview at :4173, built without Supabase settings, so no test could post to the live leaderboard.
- Splash criteria (AC 1 to 4) use fresh browser contexts. All other feature tests now skip the splash, because it shows once per session.
- AC 14 reads the latest results of every earlier feature test, rerun after these changes: product-check 12/12, ingredient-check 15/15, learn-halal 14/14, cook 16/16, read 10/10, room-leaderboard 13/13 (with 31/31 SQL checks), app-redesign 15/15.

## First run

- cook AC 7 to 9 failed. After adding from a recipe page, the link now reads "Back to Tuesday" and opens that day, instead of "See the meal plan". This is the intended change. The test now follows the new link.
- app-redesign AC 1 failed because it looked for the logo in the home header box, which was removed on purpose. The logo is in the top bar on home and on the splash. The test now checks the top bar.
- feedback-2 AC 6 failed on a timing race in the test. It read the heading before the next screen loaded. It now waits for the expected heading.

## Screenshot review

Checked by eye. `ac-1-splash.png` shows the splash mid-animation with the star, leaf, glow, title, and line. The day view, the recipe page opened from a day, and the bottom navigation (Meal Plan marked) render cleanly at 390px.

## Safety check

- No screen states a halal status of its own. Titles written by IFANCA (FAQ questions, recipe and article titles) were not changed by the title case work.
- The splash uses the original logo and pattern. No Crescent-M mark or IFANCA logo.
- The footer stays on every screen. The data dates stay in Settings, About.
