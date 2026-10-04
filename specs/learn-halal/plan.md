# Plan: learn-halal

## Files

| File | Change | Why |
|---|---|---|
| `app/src/lib/storage.ts` | add | Safe read and write of small JSON values in localStorage. Shared with the cook meal plan later. |
| `app/src/lib/lessons.ts` | add | Lesson order and sections (by FAQ URL), slug from URL, sentence paragraphs, reading time. |
| `app/src/features/Learn.tsx` | add | Learn home, lesson screen, and routing between them and the quiz. |
| `app/src/features/Quiz.tsx` | add | Rounds, questions, feedback, results, saved level. |
| `app/public/data/quiz.json` | add | 18 questions written from FAQ answers only. |
| `app/scripts/check-quiz.mjs` | add | Fails the build if a quiz quote is not word for word in its FAQ, or the count is outside 15 to 20. |
| `app/package.json` | change | `prebuild` also runs the quiz check. |
| `app/src/App.tsx` | change | Route `#/learn`, rename the tile to "Learn and quiz". |

## Components

- `Learn({ params })`: `params[0]` empty shows `LearnHome`, `quiz` shows `Quiz`, anything else is a lesson slug and shows `Lesson`.
- `LearnHome({ lessons, read, level })`: quiz card, progress line, sections with lesson rows.
- `Lesson({ lessons, index })`: header, paragraphs, source link, previous and next.
- `Quiz({ items, faqs })`: round picker, `QuestionView`, `RoundResult`.
- Reuses `Screen` and `useData`.

## Data

- `faqs.json` (29 KB) and `quiz.json` (small) load when Learn opens. faqs.json is already cached because the footer reads its date.
- Lesson order is a fixed list of FAQ URLs in `lessons.ts`, grouped into five sections. Any FAQ not in the list is added at the end, so no FAQ is lost.
- Slug is the last part of the FAQ URL, for example `what-is-halal`.
- Paragraphs: split the answer at ". ", "? ", or "! " when the next character is an uppercase letter, then group sentences into paragraphs of about 60 words. Joining the paragraphs with a space gives back the original answer.
- Device storage keys: `thw.learn.read` (list of slugs), `thw.quiz` (best score per round and level).

## Steps

- [x] 1. `storage.ts`, `lessons.ts`, Learn home, lesson screen, route, and tile rename. (AC 1, 2, 3, 4, 5, 6, 12)
- [ ] 2. `quiz.json` and `check-quiz.mjs` in prebuild. (AC 7)
- [ ] 3. Quiz screen with rounds, feedback, results, and saved level. Next on the last lesson opens the quiz. (AC 5, 8, 9, 10, 11, 13)

## Test cases

1. AC 1: on home, expect a tile "Learn and quiz". Tap it. Expect `#/learn`.
2. AC 2: expect 26 lesson rows. The first row reads "What is halal?".
3. AC 3: open the first lesson. Join the paragraph texts with a space. Expect it to equal the answer in faqs.json. Expect a link to the FAQ URL.
4. AC 4: open each of the 26 lessons by slug. Expect the same equality for each.
5. AC 5: on lesson 1, tap Next. Expect lesson 2. Open the last lesson, tap Next. Expect `#/learn/quiz`.
6. AC 6: open lesson 1, go back, reload. Expect a read mark on lesson 1 and progress "1 of 26" or more.
7. AC 7: run `node scripts/check-quiz.mjs`. Expect exit code 0. Edit a copy with a broken quote. Expect a non-zero exit.
8. AC 8: start Beginner, answer question 1. Expect the quote text from quiz.json and links to `#/learn/<slug>` and the FAQ URL.
9. AC 9: answer all 6 Beginner questions correctly using quiz.json. Expect "6 of 6", level Beginner, and the Learner round button enabled.
10. AC 10: on a fresh device, expect the Learner button disabled with a reason line.
11. AC 11: reload after passing Beginner. Expect level Beginner shown on the Learn home.
12. AC 12: expect the snapshot date on Learn home, a lesson, and the quiz.
13. AC 13: check scroll width and tap targets on Learn home, a lesson, and a quiz question.

Every acceptance criterion has a test case. No gaps. No new dependency.
