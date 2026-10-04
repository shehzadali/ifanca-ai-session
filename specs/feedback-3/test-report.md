# Test report: feedback-3

- Date: 2026-10-04
- Commit tested: d0b0226
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 11 of 11 criteria pass

| # | Criterion | Result | Notes | Screenshot |
|---|---|---|---|---|
| 1 | Splash on load and again on reload | Pass |  | [ac-1](screenshots/ac-1.png) |
| 2 | Logo tap from a section plays the splash, then shows home | Pass |  | [ac-2](screenshots/ac-2.png) |
| 3 | Logo tap on home plays the splash again | Pass |  | [ac-3](screenshots/ac-3.png) |
| 4 | Home in the navigation: home, no splash | Pass |  | [ac-4](screenshots/ac-4.png) |
| 5 | Navigation on home: seven items, Home marked | Pass |  | [ac-5](screenshots/ac-5.png) |
| 6 | In a section: Home first, section marked | Pass |  | [ac-6](screenshots/ac-6.png) |
| 7 | Tap closes a logo splash at once | Pass | closed 429 ms after the tap | [ac-7](screenshots/ac-7.png) |
| 8 | Reduced motion on load and on a logo tap | Pass | load 1.1 s, logo tap 1.0 s | [ac-8](screenshots/ac-8.png) |
| 9 | No splash on the projector | Pass |  | [ac-9](screenshots/ac-9.png) |
| 10 | 390px: no side scroll, nav items 44px, labels fit | Pass |  | [ac-10](screenshots/ac-10.png) |
| 11 | Earlier tests pass after the change | Pass | product-check 12/12, ingredient-check 15/15, learn-halal 14/14, cook 16/16, read 10/10, room-leaderboard 13/13, app-redesign 15/15, feedback-2 14/14 | [ac-11](screenshots/ac-11.png) |

## Console errors

None.

## How this was tested

- Run on the preview at :4173, built without Supabase settings.
- Splash criteria use fresh browser contexts. All other tests skip the splash with the session flag `thw.splash.skip`.
- AC 4 watches the page for any splash element while Home is tapped, not only at the end.
- AC 11 reads the latest results of every earlier test, rerun after this change: product-check 12/12, ingredient-check 15/15, learn-halal 14/14, cook 16/16, read 10/10, room-leaderboard 13/13 (with 31/31 SQL checks), app-redesign 15/15, feedback-2 14/14.

## First run

learn-halal (3) and read (8) failed. Their first step selected the home tile with `a[href="#/learn"]` or `a[href="#/read"]`. With the navigation now on home, that also matched the navigation item. The selectors are now limited to `main`. The read failures after AC 1 followed from the first one.

## Screenshot review

Checked by eye. `ac-2-logo-splash.png` shows the splash replaying after a logo tap. `ac-4-home-nav.png` shows home with the seven-item navigation and Home marked. Every label fits at 390px, including "Ingredients" when it is marked.

## Safety check

- No content changed. No screen states a halal status of its own.
- The splash uses the original logo and pattern only. The footer stays.
