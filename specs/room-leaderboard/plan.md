# Plan: room-leaderboard

## Files

| File | Change | Why |
|---|---|---|
| `supabase/setup.sql` | add | Table, private tables, access rules, `post_score` and `reset_leaderboard` functions, realtime. Run once in the Supabase SQL editor. |
| `supabase/test-setup.sh` | add | Runs setup.sql on a local scratch Postgres with stand-in Supabase roles, then checks the access rules as the `anon` role. |
| `app/src/lib/board.ts` | add | Supabase config from env, lazy client, post with retry, top 10, live subscription with polling backup, reset. |
| `app/src/features/PostScore.tsx` | add | The post section on the round result screen. |
| `app/src/features/Quiz.tsx` | change | Render `PostScore` on the result screen. Export the round sizes for the total. |
| `app/src/features/Leaderboard.tsx` | add | Projector screen, QR code, reset control. |
| `app/src/App.tsx` | change | Route `leaderboard` from the hash or the `/leaderboard` path. Wide layout for that route. |
| `app/vercel.json` | change | Rewrite `/leaderboard` to the app. |
| `app/scripts/qr.mjs` | change | Also write `app/public/qr.svg`, so the leaderboard shows the same code as the slides. |
| `app/package.json` | change | Add `@supabase/supabase-js`. |
| `app/.env.example` | add | Names of the two settings. |

## Dependency

`@supabase/supabase-js`, because the owner asked for Supabase and its client handles the REST calls and the realtime connection. It is loaded with `import()` only on the leaderboard and when posting, so other screens do not load it.

## Components

- `PostScore({ total, level })`: name field, post button, status line, try again. Hidden when the board is not configured.
- `Leaderboard()`: header, ranked list, QR panel, live status, `ResetControl`.
- `ResetControl({ onCleared })`: toggle, code field, clear button, result line.
- Reuses `useStored` and the quiz state in `thw.quiz`.

## Data

- Settings: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, set in Vercel for production and in `app/.env.local` for local builds. Both empty means not configured.
- Device storage: `thw.board` holds `{ deviceId, name, pendingTotal, postedTotal }`. `deviceId` is a random UUID made once.
- Total = sum of the best score in each round from `thw.quiz`. Level from `thw.quiz`.
- Database: `public.leaderboard (id, name, score, level, updated_at)` readable by everyone. Device keys and the reset code hash live in a schema the API cannot reach. Writes only through two functions that check their input.
- Live: realtime changes on `public.leaderboard` trigger a reload of the top 10. A poll every 5 seconds is a backup in case realtime is blocked on the venue network.

## Steps

- [x] 1. `setup.sql` and `test-setup.sh`. Run the local test. (AC 12, and the server side of AC 2, 3, 8, 9)
- [x] 2. `board.ts`, `PostScore`, the Quiz change, and the dependency. (AC 1, 2, 3, 4, 5, 11)
- [ ] 3. Leaderboard screen, path route, rewrite, QR file, and reset control. (AC 6, 7, 8, 9, 10, 11, 13)

## Test cases

Client tests use a build with a stand-in Supabase URL. Playwright answers its REST calls from an in-memory list, so the tests do not need the real project. The database rules are tested separately with `supabase/test-setup.sh` on local Postgres.

1. AC 1: pass the Beginner round. Type "Amina", tap Post. Expect "Posted as Amina" and one `post_score` call with total 6.
2. AC 2: post again after a higher total. Expect the same device key in both calls. In SQL, expect one row with the higher score.
3. AC 3: type an empty name, then 21 letters, then "Bob<1>". Expect the button disabled each time. In SQL, expect `post_score` to refuse a bad name.
4. AC 4: make every request to the stand-in URL fail. Post. Expect the failure message. Reload. Expect the level and best score still shown.
5. AC 5: after a failed post, go offline then online with the stand-in working again. Expect a `post_score` call and "Posted as".
6. AC 6: at 1280 x 720 with 12 entries, expect 10 rows in score order, rank and name at least 32px, and the QR image inside the viewport.
7. AC 7: with the board open, add an entry to the in-memory list. Expect it on screen within 10 seconds.
8. AC 8: open Reset, type a wrong code. Expect the message and the same rows. In SQL, expect an error and no rows removed.
9. AC 9: type the right code. Expect the empty state. In SQL, expect all rows removed.
10. AC 10: open `/leaderboard`. Expect the title "Room leaderboard".
11. AC 11: in a build without settings, expect no post section after a round and the not connected line on the leaderboard.
12. AC 12: in local Postgres as `anon`, expect select to work, and insert, update, delete, and reading the private schema to fail.
13. AC 13: check scroll width and tap targets on the round result screen and the leaderboard at 390px.

Every acceptance criterion has a test case. No gaps.
