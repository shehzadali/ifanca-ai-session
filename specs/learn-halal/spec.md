# Spec: learn-halal

## User goal

"I want to start from 'What is halal?' and learn the basics in small steps, then check what I learned." This comes from Journey 2 (steps 1 to 3) and Gap 2 in `analysis/gaps.md`: ifanca.org has no starting point for a newcomer, and the best short explainer is one FAQ answer among 26.

## Screens

### Learn home (`#/learn`)

- Back link, title "Learn and quiz", snapshot line with a link to the FAQ page.
- A quiz card at the top: "Your level" (Not started, Beginner, Learner, or Advocate) and a button "Take the quiz".
- Progress line: "<n> of 26 lessons read".
- Lessons grouped into sections in a fixed order. The first lesson is "What is halal?". Sections: Halal basics, Ingredients, Eating out, Certification for companies, IFANCA policies. Each row shows the question, an estimated reading time, and a mark when read.

### Lesson (`#/learn/<slug>`)

- Back link to Learn, the section name, "Lesson <n> of 26", and the question as the title.
- The answer word for word, set in short paragraphs at sentence breaks. No words are added, removed, or changed.
- A line "IFANCA's answer, quoted in full." and a link to the FAQ page on ifanca.org.
- Previous and Next buttons. Next on the last lesson goes to the quiz.
- Opening a lesson marks it as read on the device.

### Quiz (`#/learn/quiz`)

- Three rounds named Beginner, Learner, and Advocate, 6 questions each, 18 in total. A round is open when the round before it is passed. Beginner is always open.
- A round shows one question at a time with 3 or 4 answer buttons, and "Question <n> of 6".
- After an answer: whether it was right, the correct answer, the quote from IFANCA's FAQ answer that the question comes from, a link to the lesson in the app, and a link to the FAQ on ifanca.org. Then a Next button.
- At the end: the score, whether the round is passed (4 or more of 6), and the level reached. Passing a round sets the level to that round's name.
- Level and best scores are saved on the device and kept after a reload.

### Home tile

- The tile reads "Learn and quiz".

## Acceptance criteria

1. Given the home screen, then the tile reads "Learn and quiz", and when tapped it opens the Learn home.
2. Given the Learn home, then 26 lessons are listed and the first is "What is halal?".
3. Given the lesson "What is halal?", then the text on the screen, with paragraph breaks removed, equals the FAQ answer in faqs.json exactly, and a link to https://ifanca.org/faqs/what-is-halal/ is shown.
4. Given every lesson, then its text equals its FAQ answer exactly. (Checked for all 26.)
5. Given a lesson, when the user taps Next, then the next lesson in the list opens. Given the last lesson, Next opens the quiz.
6. Given a lesson has been opened, when the user goes back to the Learn home and reloads, then the lesson shows as read and the progress count includes it.
7. Given quiz.json, then it has 15 to 20 questions, each with a `faq_url` that is in faqs.json and a `source_quote` that is found word for word in that FAQ's answer. The build fails if not.
8. Given the quiz, when the user answers a question, then the feedback shows the quote and a link to the matching lesson and the FAQ on ifanca.org.
9. Given the Beginner round, when the user answers all 6 correctly, then the score reads 6 of 6, the level becomes Beginner, and the Learner round opens.
10. Given the Learner round is locked, then its button is disabled and says what is needed to open it.
11. Given a level has been reached, when the page reloads, then the same level is shown.
12. Given any Learn screen, then the snapshot date is visible.
13. Given any Learn screen at 390px, then nothing scrolls sideways and tap targets are at least 44px.

### Change on 2026-10-04: lists restored

The first build showed each answer as running text because the crawl export dropped list markup. The export now also writes `blocks` (paragraphs and lists) from the cached FAQ HTML. Joining the blocks gives the same `answer` text, and the export fails if it does not.

14. Given a lesson whose FAQ answer has a list on ifanca.org, then the lesson shows the same list (numbered for `ol`, bulleted for `ul`) with the same items. (Checked for all 10 such lessons.)

## Data needed

- `app/public/data/faqs.json`: `crawl_date` (2026-10-03), `count` (26), `items` with `question`, `answer`, `blocks`, `url`. Present.
- `app/public/data/quiz.json`: not present before this feature. It is written in this feature from the FAQ answers only. Fields: `crawl_date`, `note`, `source`, `count`, and `items` with `id`, `level`, `question`, `options`, `answer` (index), `faq_question`, `faq_url`, `source_quote`. Not a blocker, but a person at IFANCA should review it.

## Out of scope

- Any explanation, summary, or simplification of IFANCA's answers. Lessons are the answers as published.
- Content for children. The project does not write religious explanations (Gap 2 stays open for IFANCA).
- Accounts, sync between devices, or leaderboards.

## Safety notes

- The app shows only what IFANCA published. It never states a halal ruling of its own.
- Lesson text is IFANCA's FAQ answer word for word, with a source link.
- Every quiz question is built from one FAQ answer and shows the exact sentence it came from, with a link. Questions are phrased as "According to IFANCA" where they touch a status.
- No item without data is given a status.
- The FAQ text is a dated snapshot. The crawl date is shown.
- The app is not an official IFANCA app.
