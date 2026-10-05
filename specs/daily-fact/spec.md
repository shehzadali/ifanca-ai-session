# Spec: daily-fact

## User goal

"Each time I open the app, I want to pick up one short thing IFANCA says about halal." This comes from Journey 2 and Gap 2: there is no easy starting point to learn what halal means.

## Screens

### Home, "Did you know" card

- Placed after the Learn and Quiz tile.
- Title "Did You Know?".
- One sentence from an IFANCA FAQ answer, in quotation marks, word for word.
- "From IFANCA's answer to "<FAQ question>"".
- A link "Read the lesson" to the lesson for that FAQ in the app.
- The fact changes once a day, by the device's local date. The same day always shows the same fact.

## Acceptance criteria

1. Given the home screen, then the "Did You Know?" card shows one quoted sentence, the FAQ question it comes from, and a "Read the lesson" link.
2. Given the card, then the quoted sentence is found word for word in that FAQ's answer in faqs.json.
3. Given the link, when tapped, then the matching lesson opens.
4. Given two different dates, then the card shows different facts. Given the same date twice, it shows the same fact.
5. Given the device is offline after one visit, then the card still shows.
6. Given the screen at 390px, then nothing scrolls sideways and the link is at least 44px tall.

## Data needed

- `app/public/data/quiz.json`: the 18 `source_quote` sentences, each with `faq_question` and `faq_url`. The build already checks that every quote is word for word in its FAQ answer. These sentences are reused as the facts.
- `app/public/data/faqs.json` for the check in the test.

## Out of scope

- Facts written by the app.
- Notifications.

## Safety notes

- The app shows only what IFANCA published. It never states a halal ruling of its own.
- The fact is IFANCA's sentence, quoted word for word, with the FAQ named and the lesson linked. The lesson links the FAQ on ifanca.org.
- No item is given a status.
- The app is not an official IFANCA app.
