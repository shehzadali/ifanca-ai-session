# Test report: room-leaderboard

- Date: 2026-10-04
- Commit tested: 7da18f6
- Viewport: 390 x 844, deviceScaleFactor 2, mobile, touch
- Target: http://localhost:4173
- Result: 13 of 13 criteria pass

| # | Criterion | Result | Notes | Screenshot |
|---|---|---|---|---|
| 1 | Post a score after a round | Pass | one post_score call, total 6 | [ac-1](screenshots/ac-1.png) |
| 2 | Posting again updates the same entry | Pass | same device key, one entry, score 12 | [ac-2](screenshots/ac-2.png) |
| 3 | Bad names keep the button disabled | Pass |  | [ac-3](screenshots/ac-3.png) |
| 4 | Network failure keeps the score on the device | Pass | pending total 18 saved, level Advocate kept | [ac-4](screenshots/ac-4.png) |
| 5 | Retries by itself when back online | Pass |  | [ac-5](screenshots/ac-5.png) |
| 6 | Projector view: top 10, large text, QR visible | Pass | 12 entries, 10 shown, rank and name 34 and 34px, row 10 ends at 705px of 720 | [ac-6](screenshots/ac-6.png) |
| 7 | A new score appears within 10 seconds without reload | Pass | appeared after 5.3 s (poll, realtime cannot reach the stand-in) | [ac-7](screenshots/ac-7.png) |
| 8 | Wrong reset code | Pass |  | [ac-8](screenshots/ac-8.png) |
| 9 | Right reset code clears the board | Pass |  | [ac-9](screenshots/ac-9.png) |
| 10 | /leaderboard path opens the screen | Pass |  | [ac-10](screenshots/ac-10.png) |
| 11 | Without settings the feature is hidden | Pass |  | [ac-11](screenshots/ac-11.png) |
| 12 | Database access rules (local Postgres) | Pass | 23 passed, 0 failed. Output in sql-test-output.txt | [ac-12](screenshots/ac-12.png) |
| 13 | No sideways scroll and 44px tap targets at 390px | Pass |  | [ac-13](screenshots/ac-13.png) |

## Console errors

- Failed to load resource: net::ERR_INTERNET_DISCONNECTED
- WebSocket connection to 'wss://mock.supabase.test/realtime/v1/websocket?apikey=test-anon-key&vsn=2.0.0' failed: Error in connection establishment: net::ERR_NAME_NOT_RESOLVED
- WebSocket connection to 'wss://mock.supabase.test/realtime/v1/websocket?apikey=test-anon-key&vsn=2.0.0' failed: Error in connection establishment: net::ERR_NAME_NOT_RESOLVED
- WebSocket connection to 'wss://mock.supabase.test/realtime/v1/websocket?apikey=test-anon-key&vsn=2.0.0' failed: Error in connection establishment: net::ERR_NAME_NOT_RESOLVED
- Failed to load resource: the server responded with a status of 400 (Bad Request)
- WebSocket connection to 'wss://mock.supabase.test/realtime/v1/websocket?apikey=test-anon-key&vsn=2.0.0' failed: Error in connection establishment: net::ERR_NAME_NOT_RESOLVED
- WebSocket connection to 'wss://mock.supabase.test/realtime/v1/websocket?apikey=test-anon-key&vsn=2.0.0' failed: Error in connection establishment: net::ERR_NAME_NOT_RESOLVED
- WebSocket connection to 'wss://mock.supabase.test/realtime/v1/websocket?apikey=test-anon-key&vsn=2.0.0' failed: Error in connection establishment: net::ERR_NAME_NOT_RESOLVED
- WebSocket connection to 'wss://mock.supabase.test/realtime/v1/websocket?apikey=test-anon-key&vsn=2.0.0' failed: Error in connection establishment: net::ERR_NAME_NOT_RESOLVED

## How this was tested

- Client (AC 1 to 11, 13): the test builds the app twice, once pointed at a stand-in Supabase URL and once with no settings. Playwright answers the stand-in's REST calls from an in-memory store that applies the same rules as `supabase/setup.sql`. The real Supabase project was not available when this ran.
- Database (AC 12): `supabase/test-setup.sh` runs the real `setup.sql` twice on local Postgres 18 with stand-in Supabase roles, then checks every rule as the `anon` role. 23 of 23 checks pass. Output: [sql-test-output.txt](sql-test-output.txt).
- Live updates (AC 7) came from the 5-second poll, because realtime cannot connect to a stand-in host. Realtime against the real project is checked after the owner provides the project URL and key.

## Console errors

All 9 are expected in this setup:
- 7 are realtime trying to reach the stand-in host, which does not exist.
- 1 is the request blocked on purpose in AC 4 (`ERR_INTERNET_DISCONNECTED`).
- 1 is the wrong reset code in AC 8 (`400 Bad Request`).

## First run

AC 12 failed in the first run because the test treated any "skip" in the SQL output as a skipped check. Postgres printed the notice "database does not exist, skipping". The SQL checks themselves were 23 of 23. The test now looks only for lines that start with "skip".

## Screenshot review

All screenshots were checked by eye. At 1280 x 720 all 10 rows and the QR code fit without scrolling (row 10 ends at 705px). At 390px the post section, failure message, retry, and reset control render cleanly. The reset code field hides what is typed, because the screen is on a projector.

## Safety check

- These screens show names and quiz scores only. No halal status is shown.
- Only a first name is collected. Device keys and the reset code hash cannot be read with the public key (AC 12).
- The footer stays on every screen.
