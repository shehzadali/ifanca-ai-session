# Plan: read

## Files

| File | Change | Why |
|---|---|---|
| `app/src/components/Chip.tsx` | add | Move the filter chip out of `Cook.tsx` so Read can reuse it. |
| `app/src/features/Cook.tsx` | change | Import the shared chip. No behavior change. |
| `app/src/features/Read.tsx` | add | Search, theme chips, count, article cards, show more. |
| `app/src/App.tsx` | change | Route `#/read`. |

## Components

- `Chip({ on, onClick, children })`: toggle button, at least 44px tall. Moved from Cook.
- `Read()`: loads articles, renders controls and cards.
- `ArticleCard({ a })`: date line, title, type and theme, preview, link.
- Reuses `Screen`, `useData`, `formatDate`, `decodeEntities`, `fold`, and `terms`.

## Data

- `articles.json` (370 KB) loads when Read opens.
- On load: decode entities in title and preview, build a lowercase haystack of title and preview, and sort by date, newest first.
- Theme labels map the stored values to sentence case. Theme counts come from the data, not hardcoded.

## Steps

- [x] 1. Shared chip, route, Read screen with search, theme chips, cards, and show more. (AC 1 to 10)

The feature is small, so one step covers it.

## Test cases

1. AC 1: tap the Read tile. Expect `#/read`, a search box, and 7 chips.
2. AC 2: expect "763 articles". Expect card dates in non-increasing order for the first 20.
3. AC 3: check the first card for date, title, type, theme, preview, and a link equal to the data URL.
4. AC 4: tap "Halal basics". Expect "26 articles" and every card theme "Halal basics".
5. AC 5: with Halal basics on, type "zabiha". Expect fewer results, all Halal basics, all containing the word.
6. AC 6: clear the theme, type "gelatin". Expect every card to contain "gelatin" in title or preview.
7. AC 7: type "zzqx". Expect the no-match line.
8. AC 8: clear search. Expect 20 cards. Tap Show more. Expect 40.
9. AC 9: expect the snapshot date and the word "approximate".
10. AC 10: check scroll width and tap targets.

Every acceptance criterion has a test case. No gaps. No new dependency.
