# Test report: learn-halal

- Date: 2026-10-04
- Commit tested: 37fcda7
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 13 of 13 criteria pass

| # | Criterion | Result | Notes | Screenshot |
|---|---|---|---|---|
| 1 | Tile reads Learn and quiz and opens Learn | Pass |  | [ac-1](screenshots/ac-1.png) |
| 2 | 26 lessons, first is What is halal? | Pass |  | [ac-2](screenshots/ac-2.png) |
| 3 | What is halal? is word for word with a source link | Pass |  | [ac-3](screenshots/ac-3.png) |
| 4 | All 26 lessons are word for word | Pass | 26 of 26 match | [ac-4](screenshots/ac-4.png) |
| 5 | Next moves through lessons and ends at the quiz | Pass |  | [ac-5](screenshots/ac-5.png) |
| 6 | Read lessons stay marked after reload | Pass | 26 of 26 lessons read | [ac-6](screenshots/ac-6.png) |
| 7 | quiz.json has 15 to 20 questions with word-for-word quotes, and the check fails on a bad quote | Pass | quiz.json ok: 18 questions, every quote found in its FAQ answer | [ac-7](screenshots/ac-7.png) |
| 8 | Feedback shows the quote and links | Pass |  | [ac-8](screenshots/ac-8.png) |
| 9 | Six right answers give 6 of 6, level Beginner, Learner opens | Pass |  | [ac-9](screenshots/ac-9.png) |
| 10 | Locked round is disabled with a reason | Pass |  | [ac-10](screenshots/ac-10.png) |
| 11 | Level survives a reload | Pass |  | [ac-11](screenshots/ac-11.png) |
| 12 | Snapshot date on Learn home, lesson, and quiz | Pass |  | [ac-12](screenshots/ac-12.png) |
| 13 | No sideways scroll and 44px tap targets | Pass |  | [ac-13](screenshots/ac-13.png) |

## Console errors

None.

## Screenshot review

All screenshots were checked by eye at 390px. Lesson lists, lesson text, read marks, the round list with locked rounds, and answer feedback render cleanly.

One content observation, not a failure: the FAQ "What is halal?" has a bulleted list on ifanca.org, but the crawl stored it as running text ("Swine/Pork and its by-products Animals NOT properly slaughtered..."). The lesson shows the stored text word for word. Adding line breaks would mean guessing where IFANCA's bullets were. Fixing this belongs in the crawl export, not the app.

## Safety check

- Lesson text equals IFANCA's FAQ answer exactly for all 26 lessons, and each lesson links its FAQ URL (AC 3, 4).
- Every quiz question quotes the FAQ sentence it comes from and links the lesson and the FAQ (AC 8). The build checks every quote word for word (AC 7).
- The quiz says that the questions were written for this demo and are not published by IFANCA.
- No screen states a halal status of its own. The snapshot date is shown on every Learn screen (AC 12).
