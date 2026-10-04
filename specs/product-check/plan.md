# Plan: product-check

## Files

| File | Change | Why |
|---|---|---|
| `app/src/App.tsx` | change | Keep the shell and home. Route `#/product` to the new screen. Route matching uses the first path segment so later features can add sub-routes. |
| `app/src/lib/data.ts` | add | `useData(file)` hook. Fetches a JSON file once per session and caches the promise. Exposes `decodeEntities` and `formatDate`. |
| `app/src/components/Screen.tsx` | add | Shared screen frame: back link, title, optional snapshot line. |
| `app/src/components/Snapshot.tsx` | add | "IFANCA data snapshot: <date>" with an optional source link. |
| `app/src/components/NotInList.tsx` | add | The fixed missing-item message. One place for the exact wording. |
| `app/src/features/ProductCheck.tsx` | add | Search box, category select, results, show more, empty state. |

## Components

- `Screen({ title, snapshot?, sourceUrl?, children })`: renders a "Back to home" link (44px tall), an `h2` title, the `Snapshot` line when `snapshot` is set, then children.
- `Snapshot({ date, sourceUrl? })`: one line of small text with the formatted date and an optional "Source" link.
- `NotInList()`: renders "Not in IFANCA's published list. This does not mean it is not certified or not halal."
- `ProductCheck()`: loads products, builds an index, renders the controls and the list.
- `ProductCard({ product })`: name, company, category, sold in, marketplace, link. Defined inside `ProductCheck.tsx`.

## Data

- `products.json` loads only when the product screen mounts (AC 12). It is fetched with `fetch`, not imported, so it is not in the JS bundle.
- On load, each item gets decoded text fields and a lowercase `haystack` string of name, company, and category.
- Category list is built once from the items, sorted by name, with counts.
- Filtering: the query is split into words. A product matches when every word is in its haystack and the category matches the selected one. A linear scan of 11,642 short strings takes a few milliseconds. `useDeferredValue` keeps typing smooth on slow phones.
- Render at most 50 cards, plus 50 more per "Show more" tap. The limit resets when the query or category changes.

## Steps

- [x] 1. Add `lib/data.ts`, `Screen`, `Snapshot`, `NotInList`. Change `App.tsx` routing to use the first path segment and render feature screens. Product route renders `ProductCheck` with the controls only. (AC 1, 9, 12)
- [ ] 2. Load products, build the index and category list, render search, category select, count, and cards with show more. (AC 2, 3, 4, 5, 6, 8, 10)
- [ ] 3. Empty state with `NotInList`, links to the official list and to the ingredient check. Check 390px layout and tap targets. (AC 7, 11)

## Test cases

1. AC 1: on home, tap "Check a product". Expect the URL hash `#/product`, a search box, and a select labeled "Category".
2. AC 2: type "Gain Advance". Expect at least one card. The first card shows a name containing "Gain Advance", a company, a category, and "Sold in".
3. AC 3: type "General Mills". Expect at least one card and every visible card contains "General Mills" in its text.
4. AC 4: clear search, pick "Cheese". Expect the count "258 products" and every visible card category is "Cheese".
5. AC 5: with "Cheese" picked, type a word from one cheese product name. Expect fewer results, all with category "Cheese".
6. AC 6: read the select options. Expect "Ice Cream & Frozen Yogurt" present and no option containing "&amp;".
7. AC 7: type "zzqx". Expect the exact missing-item message. Expect no other occurrence of "not halal" on the page.
8. AC 8: with CPU throttled 4x through the DevTools protocol, type one character and measure time until the count changes. Expect under 100 ms.
9. AC 9: expect the text "October 3, 2026" on the product screen.
10. AC 10: with empty search and all categories, expect 50 cards. Tap "Show more". Expect 100 cards.
11. AC 11: expect `document.documentElement.scrollWidth` equal to 390. Expect the search box, select, and buttons each at least 44px tall.
12. AC 12: load home and record network requests. Expect no request for `products.json`. Open the product screen. Expect one request.

Every acceptance criterion has a test case. No gaps.

No new dependency.
