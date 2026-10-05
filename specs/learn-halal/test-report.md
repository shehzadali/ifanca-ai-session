# Test report: learn-halal

- Date: 2026-10-05
- Commit tested: 495b5e7
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 14 of 14 criteria pass

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
| 12 | No snapshot line on Learn screens, date in Settings, About | Pass |  | [ac-12](screenshots/ac-12.png) |
| 14 | Lists from the source show as lists in all 10 lessons that have them | Pass | 10 lessons with lists, all match | [ac-14](screenshots/ac-14.png) |
| 13 | No sideways scroll and 44px tap targets | Pass |  | [ac-13](screenshots/ac-13.png) |

## Console errors

None.

## Screenshot review

All screenshots were checked by eye at 390px. Lesson lists, lesson text, read marks, the round list with locked rounds, and answer feedback render cleanly.

Lists are restored (AC 14). The export now keeps the paragraph and list structure from the cached FAQ HTML. Ten lessons have lists: "What is halal?", "Are kosher products halal?", "May I eat in fast food restaurants?", "What are the fees for certification?", "What certification schemes does IFANCA follow?", "What is the benefit of IFANCA halal certification?", "Can IFANCA refuse to grant a halal certificate?", and the three policy lessons. Paragraph breaks from the source are kept too. The words are unchanged (AC 4).

## Safety check

- Lesson text equals IFANCA's FAQ answer exactly for all 26 lessons, and each lesson links its FAQ URL (AC 3, 4). Only formatting changed.
- Every quiz question quotes the FAQ sentence it comes from and links the lesson and the FAQ (AC 8). The build checks every quote word for word (AC 7).
- The quiz says the questions were written for this demo and are not published by IFANCA.
- No screen states a halal status of its own. The snapshot date is shown on every Learn screen (AC 12).
