# Plan: article-reader

## Files

| File | Change | Why |
|---|---|---|
| `crawl/export_app_data.py` | change | Export `app/public/data/articles/<slug>.json` with `blocks` from the cached body. Check each article's text word for word. |
| `app/public/data/articles/*.json` | add | 761 article bodies. |
| `app/vite.config.ts` | change | Leave article bodies out of the precache. Cache each one when it is first opened (StaleWhileRevalidate). |
| `app/src/features/ArticleView.tsx` | add | The article screen and block rendering. |
| `app/src/features/Read.tsx` | change | Route `#/read/<slug>`. Card titles open the article. |

## Components

- `ArticleView({ article })`: loads `/data/articles/<slug>.json`, renders the header, attribution, Share, blocks, and attribution again.
- `Block({ b })`: h2 to h5, p (with line breaks), ul and ol, blockquote, table (in a box that scrolls sideways), figure (image with caption), hr.
- Reuses `Screen`, `RemoteImage` (shimmer, online only), `ShareButton`, `formatDate`.

## Data

- Export: walk the body element. Block tags become blocks. Inline tags (strong, em, a, span, sup) become plain text inside their block. `<br>` becomes a line break. Text directly inside a wrapper div becomes a paragraph. Images keep `src` (made absolute) and `alt`. Captions from `figcaption`.
- Check: for each article, the joined block text equals the body's text after collapsing whitespace. The export stops on any mismatch.
- Slug: last part of the article URL. Body files are fetched only when an article opens.

## Steps

- [x] 1. Export article bodies with the word-for-word check. (AC 3)
- [ ] 2. Article screen, route, card links, attribution, Share, offline message. (AC 1, 2, 4, 5, 10, 11, 12)
- [ ] 3. Images with shimmer, left out offline or on failure. Service worker caching for bodies. (AC 6, 7, 8, 9)

## Test cases

1. AC 1: on Read, tap the first card title. Expect `#/read/<slug>` and the article title.
2. AC 2: expect the date, type, attribution, and a source link at the top and bottom.
3. AC 3: run the export. Expect "articles checked: 761". In the test, compare the joined text on screen with the body file for three articles.
4. AC 4: open an article with h2 and ul blocks. Expect `h2` and `ul` elements in the body.
5. AC 5: open an article with a table. Expect a `table` element and page scroll width 390.
6. AC 6: open an article with images while online. Expect `img` elements with ifanca.org URLs and a shimmer before load.
7. AC 7: go offline, open the article. Expect no `img` and the text present.
8. AC 8: block image requests, open the article. Expect no `img` and the text present.
9. AC 9: with the service worker on, open an article online, go offline, reload, open it again. Expect the text.
10. AC 10: with the service worker on, go offline, open an article never opened. Expect the message and the link.
11. AC 11: expect a Share button.
12. AC 12: check scroll width and tap targets on an article with a table and images.

Every acceptance criterion has a test case. No gaps. No new dependency.
