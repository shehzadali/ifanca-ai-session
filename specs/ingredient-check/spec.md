# Spec: ingredient-check

## User goal

"This product is not on the list, so what has IFANCA said about the ingredients on the label?" This comes from Journey 1 step 8 and Gap 5 in `analysis/gaps.md`. The ingredient guidance on ifanca.org is spread across FAQ answers and two old guides in a 1,115-item library, and none of it is linked from the product list.

## Screens

### Ingredient check (`#/ingredients`)

Purpose: show what IFANCA has published about the ingredients a shopper sees on a label.

Elements at 390px:
- Back link, title "Check ingredients", snapshot line with the date and a link to the sources.
- A short line: "This shows what IFANCA has published about each ingredient. It is not a verdict on the product."
- Three tabs, each at least 44px tall: "One ingredient", "Paste a list", "Photo".
- **One ingredient** tab: a search box. Typing shows matching ingredient names. Tapping one opens its card below. A term that matches nothing shows the fixed missing-item message.
- **Paste a list** tab: a large text area, placeholder "Paste the ingredient list from the label", and a "Check ingredients" button.
- **Photo** tab: two buttons, "Take a photo" (opens the camera on a phone) and "Choose a photo". While reading, a progress line. After reading, the recognized text in an editable text area with the note "Check the text and fix any mistakes before checking." and a "Check ingredients" button. A line says the photo is read on this device and not uploaded.
- **Results** (paste and photo): a heading with the number of ingredients IFANCA mentions, one card per matched ingredient, then a "Not found" box listing the parts of the text that matched nothing, under the fixed missing-item message.
- **Ingredient card**: the ingredient name. Each IFANCA statement shows the quoted source text, the IFANCA heading or context it came from, the source title, the source date when known, and a link. The status word shown is the one recorded for that statement, labeled "Recorded status in this source".
- **Sources differ** card (gelatin, lecithin, mono and diglycerides): the line "IFANCA's sources say different things about this ingredient. Each statement is shown below." Statements are grouped by recorded status into columns placed side by side. At 390px the columns sit in a row that scrolls sideways inside the card, and a line tells the user how many columns there are.

## Acceptance criteria

1. Given the home screen, when the user taps "Check ingredients", then the ingredient screen opens with three tabs: One ingredient, Paste a list, Photo.
2. Given the One ingredient tab, when the user types "rennet" and taps the suggestion, then a card shows each IFANCA statement for Rennet with quoted text, the source title, and a link to the source URL.
3. Given the One ingredient tab, when the user types "E471", then the suggestion "E-471" appears.
4. Given the One ingredient tab, when the user types a term with no match such as "quinoa", then the screen shows "Not in IFANCA's published list. This does not mean it is not certified or not halal."
5. Given the Gelatin card, then it shows the "sources say different things" line, the statements grouped into one column per recorded status placed side by side, and the number of statements shown equals the number in ingredients.json.
6. Given the Lecithin card and the Mono and diglycerides card, then each shows its statements side by side in the same way.
7. Given the Paste a list tab, when the user pastes "Sugar, Gelatin, Soy Lecithin, Salt" and taps Check ingredients, then cards appear for Gelatin and Lecithin, and Sugar and Salt are listed under the fixed missing-item message.
8. Given the Paste a list tab, when the user pastes "Mono- and diglycerides, natural flavors", then the result shows Mono and diglycerides and Artificial and natural flavors, and does not also show Monoglycerides.
9. Given any result, then the screen shows no overall verdict on the product. The line "It is not a verdict on the product." is visible and no text says the product is halal, haram, or not halal.
10. Given the Photo tab, when the user chooses a photo of a printed ingredient list, then a progress line shows, and the recognized text appears in an editable text area.
11. Given recognized text, when the user edits it and taps Check ingredients, then the results reflect the edited text.
12. Given the Photo tab is used, then all OCR files load from the app's own origin and the photo is not sent anywhere.
13. Given the ingredient screen, then no snapshot line is shown, and Settings, About shows "October 3, 2026". (Changed in the redesign.)
14. Given the screen at 390px, then nothing on the page scrolls sideways (the side-by-side row scrolls inside its card) and tap targets are at least 44px.
15. Given the home screen or the One ingredient tab, then no OCR files are requested until the Photo tab is used.


### Change on 2026-10-04: redesign

The owner asked to remove the snapshot line from every screen. The crawl date now shows only in Settings, About. The criterion about the snapshot date was changed to match. See `specs/app-redesign/spec.md`.

## Data needed

- `app/public/data/ingredients.json`: `crawl_date` (2026-10-03), `source`, `scope_note`, `count` (99), `statement_count` (147), and `items` with `name`, `status`, `sources_disagree`, `statuses`, and `statements` (`status`, `ifanca_label`, `source_text`, `context`, `url`, `source_title`, `source_date`). Three items have `sources_disagree: true`. No blocker.
- Tesseract.js and English language data, served from the app.

## Out of scope

- Any status for the product as a whole.
- Matching ingredients that IFANCA did not name, including synonyms the sources do not give. Only spelling variants of the same name are matched, such as "E471" for "E-471" and plurals.
- Languages other than English for photos.
- Barcode lookups.

## Safety notes

- The app shows only what IFANCA published. It never states a halal ruling of its own.
- Any halal status shown must quote IFANCA's source text and link the source URL. Every status word sits next to its quote and link.
- An item that is not in the data has no status. The screen says "Not in IFANCA's published list. This does not mean it is not certified or not halal."
- Where sources disagree, every statement is shown and none is picked.
- Data is a dated demo snapshot. The crawl date is shown.
- The app is not an official IFANCA app.
