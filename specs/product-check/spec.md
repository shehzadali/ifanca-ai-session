# Spec: product-check

## User goal

"I am in a store and I want to see if this product is on IFANCA's certified list." This comes from Journey 1 (steps 2 to 4 and step 7) and Gap 1 in `analysis/gaps.md`. On ifanca.org the category tiles do not apply the category, and a missing product gets no explanation.

## Screens

### Product check (`#/product`)

Purpose: find a product in IFANCA's published certified product list fast, on a phone.

Elements, top to bottom at 390px:
- Back link to home.
- Title "Check a product".
- Snapshot line: "IFANCA data snapshot: October 3, 2026" and a link to the source list on ifanca.org.
- Search box with placeholder "Product name, company, or category". Type `search`, large text, a clear button.
- Category filter: a select with "All categories" and every category, each with its product count.
- Result count line, for example "37 products".
- Result list. Each card shows product name, company, category, "Sold in", marketplace, and a "View on ifanca.org" link to the product URL.
- "Show more" button when more than 50 results match.
- Empty state when nothing matches: "Not in IFANCA's published list. This does not mean it is not certified or not halal." Then a short line that the list is a dated snapshot, a link to the official list on ifanca.org, and a link to check ingredients instead.
- Loading state while the product file loads.
- Footer from the app shell.

## Acceptance criteria

1. Given the home screen, when the user taps "Check a product", then the product check screen opens with a search box and a category filter.
2. Given the product screen has loaded, when the user types a product name such as "Gain Advance", then matching products appear and each card shows name, company, category, and sold in.
3. Given the product screen, when the user types a company name such as "General Mills", then only products from that company or with that text in name or category appear.
4. Given the product screen, when the user picks the category "Cheese" with an empty search, then the count reads 258 products and every card shows the category "Cheese".
5. Given a category is picked, when the user also types a search term, then results match both the category and the term.
6. Given a category name that contains an ampersand, when the user opens the filter, then it reads "Ice Cream & Frozen Yogurt" and not "&amp;".
7. Given the product screen, when the user types text that matches nothing, such as "zzqx", then the screen shows "Not in IFANCA's published list. This does not mean it is not certified or not halal." and does not show the words "halal" or "not halal" as a status anywhere else.
8. Given the data has loaded, when the user types a character, then results update within 100 ms on a desktop browser with 4x CPU slowdown.
9. Given the product screen, then no snapshot line is shown, and Settings, About shows "October 3, 2026" for products. (Changed in the redesign.)
10. Given more than 50 results, when the user taps "Show more", then 50 more cards appear.
11. Given the screen at 390px width, then nothing scrolls sideways and tap targets are at least 44px tall.
12. Given the first page load of the home screen, then `products.json` is not requested until the product screen opens.


### Change on 2026-10-04: redesign

The owner asked to remove the snapshot line from every screen. The crawl date now shows only in Settings, About. The criterion about the snapshot date was changed to match. See `specs/app-redesign/spec.md`.

### Change on 2026-10-04: navigation and fixes

The owner asked for category chips before typing (Beverages, Food, Cosmetics and Personal Care, Nutritional and Dietary Supplements, Pharmaceuticals) instead of the full list, and for consumer products to sort before ingredients and base materials. Products now live under Check (`#/check/products`).

13. Given the product screen before typing, then the five category chips show with counts and no product list.
14. Given a search, then consumer products are listed before ingredients and base materials.

## Data needed

- `app/public/data/products.json`: `crawl_date` (2026-10-03), `source`, `count` (11,642), and `items` with `name`, `company`, `category`, `sold_in`, `marketplace`, `url`. 149 companies. 60 or more categories. All present. No blocker.

## Out of scope

- Barcode scanning.
- Certificate or expiry lookups. The data has none (Gap 1).
- Marketplace and country filters. Search covers them in part.
- Any statement about whether a product is halal beyond being in the published list.

## Safety notes

- The app shows only what IFANCA published. It never states a halal ruling of its own.
- Any halal status shown must quote IFANCA's source text and link the source URL. This screen shows no status. It shows list membership and links each product to its page on ifanca.org.
- An item that is not in the data has no status. The screen says "Not in IFANCA's published list. This does not mean it is not certified or not halal."
- Product data is a dated demo snapshot. The crawl date is shown on the screen.
- The app is not an official IFANCA app. The footer says so.
