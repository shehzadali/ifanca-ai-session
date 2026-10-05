# Plan: share

## Files

| File | Change | Why |
|---|---|---|
| `app/src/components/ShareButton.tsx` | add | The button with Web Share, clipboard, and manual fallbacks. |
| `app/src/features/Cook.tsx` | change | Share on recipe pages. |
| `app/src/features/Learn.tsx` | change | Share on lesson pages. |

## Components

- `ShareButton({ title, sourceUrl, path })`: builds the app link from `location.origin` and `path` (for example `/#/recipes/beef-pasanday`). Calls `navigator.share` when present. On `AbortError` does nothing. Otherwise falls back to `navigator.clipboard.writeText`, then to a selected text field.

## Data

- None beyond the page's own title and source URL.

## Steps

- [x] 1. `ShareButton` on recipe and lesson pages. (AC 1 to 8)

## Test cases

1. AC 1: open a recipe. Expect a button named "Share".
2. AC 2: open a lesson. Expect a button named "Share".
3. AC 3: stub `navigator.share` to record calls. Tap Share on a recipe. Expect one call with the title, text containing the ifanca.org URL, and url ending in `#/recipes/<slug>`.
4. AC 4: same on a lesson. Expect the question and `#/learn/<slug>`.
5. AC 5: remove `navigator.share`, grant clipboard permission. Tap Share. Expect the clipboard to hold the link and "Link copied".
6. AC 6: stub `navigator.share` to reject with `AbortError`. Tap Share. Expect no message and an unchanged clipboard.
7. AC 7: remove both. Tap Share. Expect a field with the link, selected.
8. AC 8: check scroll width and the button height.

Every acceptance criterion has a test case. No gaps. No new dependency.
