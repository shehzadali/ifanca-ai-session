# Test report: read

- Date: 2026-10-05
- Commit tested: 1858c3c
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 10 of 10 criteria pass

| # | Criterion | Result | Notes | Screenshot |
|---|---|---|---|---|
| 1 | Read tile opens the screen with search and theme chips | Pass |  | [ac-1](screenshots/ac-1.png) |
| 2 | 763 articles, newest first | Pass |  | [ac-2](screenshots/ac-2.png) |
| 3 | Card shows date, title, type, theme, preview, and link | Pass | Published June 30, 2026 | [ac-3](screenshots/ac-3.png) |
| 4 | Halal basics gives 26, all Halal basics | Pass |  | [ac-4](screenshots/ac-4.png) |
| 5 | Theme and search combine | Pass | 1 articles | [ac-5](screenshots/ac-5.png) |
| 6 | Search gelatin | Pass | 13 articles | [ac-6](screenshots/ac-6.png) |
| 7 | No match message | Pass |  | [ac-7](screenshots/ac-7.png) |
| 8 | Show more adds 20 | Pass |  | [ac-8](screenshots/ac-8.png) |
| 9 | Snapshot date and themes note | Pass |  | [ac-9](screenshots/ac-9.png) |
| 10 | No sideways scroll and 44px tap targets | Pass |  | [ac-10](screenshots/ac-10.png) |

## Console errors

None.

## Screenshot review

All screenshots were checked by eye at 390px. The date line leads every card in bold. Chips wrap onto four rows, which pushes the first card lower on a phone, but every chip stays readable and at least 44px tall.

Observation, not a failure: the footer on every screen shows the snapshot date in raw form ("2026-10-03"). It is fixed in the polish step before deploy.

## Safety check

- The Read screen states no halal status. Titles and previews are shown as stored, with a link to each article on ifanca.org.
- Each card shows the article's original date. The snapshot date is shown at the top (AC 9).
- The themes note says themes are approximate.
