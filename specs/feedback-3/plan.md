# Plan: feedback-3

## Files

| File | Change | Why |
|---|---|---|
| `app/index.html` | change | Splash plays on every load. The script keeps a clean copy of the splash and exposes `window.thwSplash()` to play it again. |
| `app/src/components/TopBar.tsx` | change | The logo link calls `window.thwSplash()` and goes home. |
| `app/src/components/BottomNav.tsx` | change | Home item first. Seven columns. |
| `app/src/App.tsx` | change | Show the bottom navigation on home too. |
| `specs/test-lib.mjs`, `app/tests/smoke.mjs`, earlier tests | change | Tests skip the splash with a session flag `thw.splash.skip`. The app ignores the old once-per-session flag. |

## Components

- Splash script: `play()` clones the saved copy into the page, shows it, closes it after about 2 seconds or on a tap, then removes it. Called on load (unless on `/leaderboard` or the test skip flag is set) and by `window.thwSplash()`.
- `TopBar`: `onClick` on the logo link calls `window.thwSplash?.()`. The link still points to `#/`.
- `BottomNav({ current })`: `current` can be `home`.

## Data

- None.

## Steps

- [ ] 1. Splash on every load, `window.thwSplash()`, logo tap plays it. (AC 1, 2, 3, 7, 8, 9)
- [ ] 2. Home in the bottom navigation, navigation on home. (AC 4, 5, 6, 10)
- [ ] 3. Update tests and the smoke test, rerun everything. (AC 11)

## Test cases

1. AC 1: fresh context, open home. Expect `#splash`. Wait for it to go. Reload. Expect it again.
2. AC 2: on `#/read`, tap the logo. Expect `#splash`, then home with the tiles after it goes.
3. AC 3: on home, tap the logo. Expect `#splash`.
4. AC 4: on `#/read`, tap Home. Expect home and no `#splash` at any time during the next second.
5. AC 5: on home, expect 7 navigation items, Home with `aria-current`.
6. AC 6: on `#/recipes`, expect Home first and Recipes marked.
7. AC 7: tap the splash after a logo tap. Expect it gone within 700 ms.
8. AC 8: with reduced motion, expect no animated parts on load and on a logo tap, and the splash gone within 1.5 seconds.
9. AC 9: open `/leaderboard`. Expect no `#splash`.
10. AC 10: on home and a section, expect scroll width 390, each navigation item at least 44px tall, and each label's scroll width not larger than its box.
11. AC 11: rerun every feature test and the smoke test.

Every acceptance criterion has a test case. No gaps. No new dependency.
