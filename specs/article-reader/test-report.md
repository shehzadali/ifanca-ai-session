# Test report: article-reader

- Date: 2026-10-05
- Commit tested: 29aac82
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 12 of 12 criteria pass

| # | Criterion | Result | Notes | Screenshot |
|---|---|---|---|---|
| 1 | Tapping a card title opens the article in the app | Pass | Insulin Resistance and Poor Glycemic Control in South Asians | [ac-1](screenshots/ac-1.png) |
| 2 | Date, type, attribution, and source link at top and bottom | Pass |  | [ac-2](screenshots/ac-2.png) |
| 3 | Text on screen equals the exported body, word for word | Pass | a-breath-of-fresh-air 7656 chars, 25th-year-anniversary-ifanca-in-historic-perspective 2627 chars, a-neat-way-to-stay-fit 5320 chars. The export checked all 761 bodies against their pages. | [ac-3](screenshots/ac-3.png) |
| 4 | Headings and lists render as headings and lists | Pass |  | [ac-4](screenshots/ac-4.png) |
| 5 | Tables render and the page does not scroll sideways | Pass |  | [ac-5](screenshots/ac-5.png) |
| 6 | Images load from ifanca.org with a shimmer first | Pass | https://ifanca.org/app/uploads/2024/09/AdobeStock_228201096-768x512.jpeg | [ac-6](screenshots/ac-6.png) |
| 7 | Offline: text without images | Pass |  | [ac-7](screenshots/ac-7.png) |
| 8 | A failed image is left out | Pass |  | [ac-8](screenshots/ac-8.png) |
| 9 | Opened once online, it opens again offline | Pass |  | [ac-9](screenshots/ac-9.png) |
| 10 | Never opened and offline: not saved message | Pass |  | [ac-10](screenshots/ac-10.png) |
| 11 | Share button on the article | Pass |  | [ac-11](screenshots/ac-11.png) |
| 12 | 390px layout and tap targets | Pass | table, images, and the article without a body | [ac-12](screenshots/ac-12.png) |

## Console errors

- Failed to load resource: net::ERR_FAILED

## How this was tested

- AC 7, 9, and 10 used a browser context with the service worker on, because offline reading depends on it.
- The one console error is the image request blocked on purpose in AC 8.

## First run

- AC 8 failed because the test never scrolled the lazy-loading images into view, so they were never requested and could not fail. The test now scrolls through the article first.
- AC 12 failed on a real issue. For the two articles with no body file, the preview server answers with the app page and status 200, not a 404. The app showed "could not load" instead of the preview and link. The app now treats any response that is not JSON as "no body", which works on any host. Retested.

## Screenshot review

Checked by eye at 390px. Headings, lists, tables (scrolling inside their own box), images with captions, the offline view without images, and the "not saved on this device yet" message all render cleanly.

## Export check

The export compares every article's text, with whitespace removed, against the text of its cached page. All 761 bodies match. Two cached pages have no body. They show the stored preview and the ifanca.org link.

## Safety check

- Article text is IFANCA's, unchanged. Inline styling (bold, italics, links) inside paragraphs is not kept. The words are.
- Each article shows the published date, type, attribution, and source link at the top and bottom.
- Images load only from their ifanca.org URLs while online, and the service worker does not store them.
- No status is shown.
