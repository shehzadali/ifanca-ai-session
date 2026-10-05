# Test report: daily-fact

- Date: 2026-10-05
- Commit tested: 495b5e7
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 6 of 6 criteria pass

| # | Criterion | Result | Notes | Screenshot |
|---|---|---|---|---|
| 1 | Card with quote, source FAQ, and lesson link | Pass |  | [ac-1](screenshots/ac-1.png) |
| 2 | The quote is word for word in the named FAQ | Pass | Are kosher products halal? | [ac-2](screenshots/ac-2.png) |
| 3 | The link opens that lesson | Pass |  | [ac-3](screenshots/ac-3.png) |
| 4 | Different days, different facts. Same day, same fact | Pass | October 5 and 6 differ, two times on October 5 match | [ac-4](screenshots/ac-4.png) |
| 5 | Offline after one visit | Pass |  | [ac-5](screenshots/ac-5.png) |
| 6 | 390px layout and link size | Pass |  | [ac-6](screenshots/ac-6.png) |

## Console errors

None.

## Screenshot review

Checked by eye at 390px. The card sits between the Learn and Quiz tile and the section tiles. The label uses the darker amber for contrast on white.

## Notes

- The facts are the 18 quiz quotes. The build already fails if any of them is not word for word in its FAQ answer, so the card can only show IFANCA's own sentences.
- The fact changes at local midnight, using the device's time zone.

## Safety check

- The card quotes IFANCA word for word, names the FAQ, and links the lesson, which links the FAQ on ifanca.org. No status is shown.
