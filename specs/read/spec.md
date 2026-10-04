# Spec: read

## User goal

"I want to find IFANCA articles on a topic and know how old each one is before I read it." This comes from Gap 5 and Journey 2 step 3 in `analysis/gaps.md` and `analysis/journeys.md`: the resources library holds 1,115 items in a 93-page list sorted by date, the topic filter has 2 topics, and 979 items have no topic.

## Screens

### Read (`#/read`)

- Back link, title "Read", snapshot line with the resources crawl date and a link to the resources library.
- A line: "Articles from IFANCA's resource library, newest first. Themes are approximate."
- Search box: "Search articles". Matches the title and the preview text.
- Theme chips in one row that wraps: All, Halal basics, Ingredients, Health and nutrition, Industry and certification, Community and events, Other. Each shows its count.
- Count line, for example "26 articles".
- Article cards, newest first:
  - The original date first and in bold: "Published March 31, 1998".
  - Title.
  - Type (for example Article, Editorial, Spotlight) and theme.
  - The preview as stored (the first 40 words).
  - "Read the full article on ifanca.org" link.
- 20 cards at a time with "Show more".
- No match: "No articles match. Try another word or theme."

## Acceptance criteria

1. Given the home screen, when the user taps "Read", then the Read screen opens with a search box and theme chips.
2. Given the Read screen, then the count reads "763 articles", and cards are in date order, newest first.
3. Given a card, then it shows the published date, title, type, theme, preview, and a link to the article URL.
4. Given the Read screen, when the user taps "Halal basics", then the count reads 26 and every card's theme is Halal basics.
5. Given a theme is picked, when the user types a word, then results match both.
6. Given the Read screen, when the user types "gelatin", then every card has "gelatin" in its title or preview.
7. Given no match, then the screen says "No articles match. Try another word or theme."
8. Given more than 20 results, when the user taps "Show more", then 20 more cards appear.
9. Given the Read screen, then the line says themes are approximate, no snapshot line is shown, and Settings, About shows the articles date. (Changed in the redesign.)
10. Given the Read screen at 390px, then nothing scrolls sideways and tap targets are at least 44px.


### Change on 2026-10-04: redesign

The owner asked to remove the snapshot line from every screen. The crawl date now shows only in Settings, About. The criterion about the snapshot date was changed to match. See `specs/app-redesign/spec.md`.

## Data needed

- `app/public/data/articles.json`: `crawl_date` (2026-10-04), `count` (763), `theme_note`, and `items` with `title`, `url`, `type`, `theme`, `date`, `first_40_words`. Six themes. Dates from 1998 to 2026. No blocker.

## Out of scope

- Showing full article text in the app. The link opens the article on ifanca.org.
- Fixing or improving the themes. They come from keyword rules in Stage 2.
- News posts and magazine issues. They are not in articles.json.

## Safety notes

- The app shows only what IFANCA published. It never states a halal ruling of its own.
- Titles and previews are shown as stored, with a link to the source.
- No item is given a status.
- The data is a dated snapshot. The crawl date and each article's original date are shown.
- The app is not an official IFANCA app.
