# Test report: product-check

- Date: 2026-10-04
- Commit tested: b85fa3e
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 12 of 12 criteria pass

| # | Criterion | Result | Notes | Screenshot |
|---|---|---|---|---|
| 1 | Home tile opens the product check with search and category filter | Pass |  | [ac-1](screenshots/ac-1.png) |
| 2 | Product name search shows name, company, category, sold in | Pass | 88 products | [ac-2](screenshots/ac-2.png) |
| 3 | Company search | Pass | 504 products | [ac-3](screenshots/ac-3.png) |
| 4 | Category Cheese gives 258 products, all Cheese | Pass |  | [ac-4](screenshots/ac-4.png) |
| 5 | Category and search combine | Pass | 8 products | [ac-5](screenshots/ac-5.png) |
| 6 | Ampersand decoded in category names | Pass | 62 categories | [ac-6](screenshots/ac-6.png) |
| 7 | No match shows the fixed message and no own ruling | Pass |  | [ac-7](screenshots/ac-7.png) |
| 8 | Results update within 100 ms with 4x CPU slowdown | Pass | 30 ms | [ac-8](screenshots/ac-8.png) |
| 9 | Snapshot date visible | Pass |  | [ac-9](screenshots/ac-9.png) |
| 10 | Show more adds 50 cards | Pass |  | [ac-10](screenshots/ac-10.png) |
| 11 | No sideways scroll, tap targets 44px | Pass |  | [ac-11](screenshots/ac-11.png) |
| 12 | products.json not loaded on home | Pass |  | [ac-12](screenshots/ac-12.png) |

## Console errors

None.

## First run

The first run had 2 failures.
- AC 2 failed because the test looked for the exact phrase "Gain Advance". Search matches every word, and the first result is "Gain Plus Advance". The test was wrong. It now checks both words.
- AC 11 failed because the "Source on ifanca.org" link was 34px tall. Fixed in plan step 4 (larger tap area). The rerun above passes.

## Screenshot review

All screenshots were checked by eye. Cards, the filter, and the empty state render cleanly at 390px. One observation, not a failure: the source list repeats a product once per country (for example "180° Face Wash" for Brunei, Indonesia, Thailand). The app shows the list as published.

## Safety check

- The product screen states no halal status. It shows list membership and links each product to its page on ifanca.org.
- A search with no match shows only the fixed message "Not in IFANCA's published list. This does not mean it is not certified or not halal."
- The words "not halal" appear nowhere else (AC 7).
- The snapshot date is shown (AC 9). The footer says the app is not official.
