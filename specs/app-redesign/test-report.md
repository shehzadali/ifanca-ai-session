# Test report: app-redesign

- Date: 2026-10-04
- Commit tested: 849088a
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 15 of 15 criteria pass

| # | Criterion | Result | Notes | Screenshot |
|---|---|---|---|---|
| 1 | Logo in the header, tiles have one line each | Pass | 6 tiles | [ac-1](screenshots/ac-1.png) |
| 2 | Learn and quiz first, then the given order | Pass |  | [ac-2](screenshots/ac-2.png) |
| 3 | Level bar shows Beginner and at least one third | Pass | fill 33% | [ac-3](screenshots/ac-3.png) |
| 4 | No snapshot outside About, dates inside About | Pass | 8 screens checked | [ac-4](screenshots/ac-4.png) |
| 5 | Bottom navigation inside sections | Pass |  | [ac-5](screenshots/ac-5.png) |
| 6 | Avatar button opens Settings | Pass |  | [ac-6](screenshots/ac-6.png) |
| 7 | Dark theme is applied and kept after reload | Pass | body rgb(11, 21, 19) | [ac-7](screenshots/ac-7.png) |
| 8 | Sign up before the quiz | Pass |  | [ac-8](screenshots/ac-8.png) |
| 9 | Score posts with avatar, leaderboard shows it, and the fallback works before 002 | Pass | avatar sent and shown. Before 002: posted without avatar, initials shown | [ac-9](screenshots/ac-9.png) |
| 10 | Network down: saved on device, posts later | Pass |  | [ac-10](screenshots/ac-10.png) |
| 11 | Recipes everywhere, no Cook label | Pass |  | [ac-11](screenshots/ac-11.png) |
| 12 | Meal plan: Wednesday, search lentil, Add, kept after reload | Pass | Maash Ki Daal | [ac-12](screenshots/ac-12.png) |
| 13 | Offline after one visit: home, sections, Settings, profile, fonts | Pass | all sections, quiz, Settings with profile, and the font work offline | [ac-13](screenshots/ac-13.png) |
| 14 | 390px layout, tap targets, and contrast in both themes | Pass | light: lowest 5.52, dark: lowest 7.87 | [ac-14](screenshots/ac-14.png) |
| 15 | Earlier feature tests pass after the redesign | Pass | product-check 12/12, ingredient-check 15/15, learn-halal 14/14, cook 16/16, read 10/10, room-leaderboard 13/13 | [ac-15](screenshots/ac-15.png) |

## Console errors

- WebSocket connection to 'wss://mock.supabase.test/realtime/v1/websocket?apikey=test-anon-key&vsn=2.0.0' failed: Error in connection establishment: net::ERR_NAME_NOT_RESOLVED
- Failed to load resource: the server responded with a status of 404 (Not Found)
- Failed to load resource: the server responded with a status of 400 (Bad Request)
- WebSocket connection to 'wss://mock.supabase.test/realtime/v1/websocket?apikey=test-anon-key&vsn=2.0.0' failed: Error in connection establishment: net::ERR_NAME_NOT_RESOLVED
- Failed to load resource: net::ERR_INTERNET_DISCONNECTED
