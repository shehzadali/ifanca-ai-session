# Spec: article-reader

## User goal

"I want to read IFANCA's articles inside the app, the way they were written, without leaving for the website." This comes from Gap 5: the library is hard to browse on ifanca.org, and the Read section only showed a preview with a link out.

## Screens

### Read list (`#/read`)

- As before. Tapping a card now opens the article in the app. The "Read on ifanca.org" link stays on each card.

### Article (`#/read/<slug>`)

- Back link "All articles" above the colored header.
- Header: the article title.
- Top line: "Published <date>", type, and theme. "From IFANCA's resource library. Text as published." A link "Read on ifanca.org".
- A Share button, as on recipes and lessons.
- The body, rendered from the cached page, with its structure kept:
  - headings (h2 to h5),
  - paragraphs, with line breaks kept,
  - bulleted and numbered lists,
  - block quotes,
  - tables, which scroll sideways inside their own box,
  - images with captions.
- Images: while online, loaded from their ifanca.org URLs with the same shimmer as recipe photos. Offline, or when an image fails, the image is left out and the text continues. Captions stay.
- The same published date, source link, and attribution again at the bottom.
- If the article body is not on the device and the device is offline: "This article is not saved on this device yet. Open it once while online to read it offline." with the ifanca.org link.
- Two articles in the cache have no body. They show the stored preview and the ifanca.org link.

## Acceptance criteria

1. Given the Read list, when the user taps a card title, then the article opens in the app at `#/read/<slug>`.
2. Given an article, then the published date, type, attribution, and a link to the source URL show at the top and again at the bottom.
3. Given any article, then the text of all its blocks, joined, equals the text of the cached page body with only whitespace differences. (Checked by the export for all 761 articles with a body.)
4. Given an article with headings and lists in the source, then they render as headings and lists.
5. Given an article with a table, then it renders as a table and the page itself does not scroll sideways.
6. Given an article with images while online, then each image loads from its ifanca.org URL, with a shimmer until it loads.
7. Given the device is offline, then the article shows its text and no images.
8. Given an image fails to load, then it is left out and the text around it shows.
9. Given an article opened once online, when the device is offline, then it opens again with its text.
10. Given an article never opened, when the device is offline, then the "not saved on this device yet" message and the ifanca.org link show.
11. Given an article page, then a Share button is shown.
12. Given the screen at 390px, then nothing scrolls sideways and tap targets are at least 44px.

## Data needed

- `app/public/data/articles.json` (763 items: title, url, type, theme, date, first_40_words). Present.
- New: one file per article, `app/public/data/articles/<slug>.json`, with `blocks` exported from the cached HTML in `data/raw/html/`. 761 of 763 cached pages have a body (about 4.4 MB of text, 252 images, 67 tables). Not a blocker.

## Out of scope

- Changing, summarizing, or translating article text.
- Inline formatting inside paragraphs (bold, italics, links). Paragraph text is kept, inline styling is not.
- Storing images for offline use.
- Saving every article for offline use at install. Each article is saved when first opened.

## Safety notes

- The app shows only what IFANCA published. It never states a halal ruling of its own.
- Article text is IFANCA's, unchanged, with the date, source link, and attribution at the top and bottom. The export checks every article's text word for word.
- No item is given a status.
- The app is not an official IFANCA app.
