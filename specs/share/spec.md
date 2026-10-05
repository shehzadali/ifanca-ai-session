# Spec: share

## User goal

"I found a good recipe or lesson and want to send it to my family." This supports Gap 5 (education content that is hard to find) by letting people pass good content on.

## Screens

### Share button (recipe pages and lesson pages)

- A "Share" button near the top of each recipe page and each lesson page, at least 44px tall.
- On devices with the Web Share API, it opens the phone's share sheet with:
  - title: the recipe or lesson title,
  - text: "<title>, from IFANCA's public content in The Halal Way demo. Original: <ifanca.org URL>",
  - url: the app link to this page.
- On devices without it, or if sharing fails for a reason other than the user closing the sheet, the button copies the app link and shows "Link copied" for 3 seconds. If copying is blocked, a text field with the link is shown, selected, so the user can copy it.

## Acceptance criteria

1. Given a recipe page, then a Share button is shown near the title.
2. Given a lesson page, then a Share button is shown near the title.
3. Given the Web Share API, when the user taps Share on a recipe, then it is called once with the recipe title, the text with the ifanca.org URL, and the app link to that recipe.
4. Given the same on a lesson, then the call carries the lesson question and the lesson link.
5. Given no Web Share API, when the user taps Share, then the app link is written to the clipboard and "Link copied" shows.
6. Given the user closes the share sheet (the share call is cancelled), then no message or copy happens.
7. Given no Web Share API and no clipboard access, then a field with the link shows, selected.
8. Given the screen at 390px, then nothing scrolls sideways and the button is at least 44px tall.

## Data needed

- `recipes.json` (title, url) and `faqs.json` (question, url). No new data.

## Out of scope

- Sharing products, ingredients, or articles.
- Images in the share.

## Safety notes

- The app shows only what IFANCA published. It never states a halal ruling of its own.
- The shared text names IFANCA as the source and includes the original ifanca.org URL.
- No item is given a status.
- The app is not an official IFANCA app. The shared text says it is a demo.
