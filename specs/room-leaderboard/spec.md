# Spec: room-leaderboard

## User goal

"I finished the quiz and I want to see my name on the screen with everyone else in the room." This supports the 90-minute session, where staff play the quiz on their phones. It builds on learn-halal (Journey 2, Gap 2) by giving the quiz a shared, visible goal.

## Screens

### Post your score (on the quiz round result screen)

- Shown under the score after any round, passed or not, so everyone in the room can take part.
- Text: "Room leaderboard. Your total is <n> of 18." The total is the sum of the best score in each round.
- A "First name" field (1 to 20 characters) and a "Post my score" button, both at least 44px tall.
- After posting: "Posted as <name>." Posting again later updates the same entry. The best total is kept.
- If posting fails: "Could not reach the leaderboard. Your score is saved on this device." and a "Try again" button. The app also tries again when the device comes back online.
- If the leaderboard is not set up: the section is hidden. The quiz works as before.
- The name and the device's entry key are saved on the device.

### Leaderboard (`/leaderboard`, also `#/leaderboard`)

Purpose: show the room's top 10 on a projector.

- A wide layout that fills a laptop screen. Large text readable from the back of a room.
- Title "Room leaderboard" and the line "Quiz scores from The Halal Way. Top 10."
- A ranked list: rank, first name, level, and total score out of 18. Ties are ordered by who reached the score first.
- An empty state: "No scores yet. Scan the code to play."
- A QR code for the app's production URL with the text "Scan to play" and the URL written out.
- Live updates without a reload. A small "Live" or "Reconnecting" status.
- A small "Reset" button at the bottom. It opens a code field and a "Clear all scores" button. A wrong code shows "That code is not right." A right code clears every entry and shows "All scores cleared."
- If the leaderboard is not set up: "The room leaderboard is not connected yet."
- The usual footer.

## Acceptance criteria

1. Given a signed up player finishes a quiz round and the leaderboard works, then the score is posted without a tap, with the profile name, avatar, and the total of best round scores, and the result says it was posted. (Changed in the redesign.)
2. Given the same device posts again with a higher total, then the same entry is updated, not added twice.
3. Given a profile name that is shorter than 2 or longer than 20 characters, or has characters other than letters, numbers, spaces, hyphens, apostrophes, periods, or underscores, then the profile cannot be saved, and the database refuses it. (Changed in the redesign.)
4. Given the leaderboard service cannot be reached, when the player posts, then the failure message shows, the quiz score and level stay saved on the device, and the quiz still works.
5. Given a failed post, when the device comes back online, then the post is tried again without a tap.
6. Given the leaderboard screen at 1280 x 720, then up to 10 entries show in score order with large text (rank and name at least 32px), and the QR code is visible without scrolling.
7. Given the leaderboard screen is open, when a new score is posted elsewhere, then it appears within 10 seconds without a reload.
8. Given the Reset control, when the user types a wrong code, then "That code is not right." shows and no entries are removed.
9. Given the Reset control, when the user types the right code, then all entries are removed and the screen shows the empty state.
10. Given `/leaderboard` is opened as a path (not a hash), then the leaderboard screen shows.
11. Given the leaderboard is not configured, then the quiz shows no post section and the leaderboard says it is not connected yet.
12. Given the database, then a visitor with the public key can read entries and call the post and reset functions, but cannot insert, update, or delete rows directly, and cannot read device keys or the reset code.
13. Given any screen at 390px, then nothing scrolls sideways and tap targets are at least 44px.

### Change on 2026-10-04: redesign

The owner asked for a sign up with a name and an avatar before the quiz, because a leaderboard without them has no meaning. The name field moved from the result screen to the profile. Scores now post on their own after each round. The leaderboard shows avatars. `supabase/002_profiles.sql` adds the avatar column and the wider name rule. Until it runs, the app posts without the avatar.

## Data needed

- `app/public/data/quiz.json`: levels and question counts per round (18 questions). Present.
- A Supabase project with the table and functions in `supabase/setup.sql`. **Blocker for live use:** the owner must run the SQL and give the project URL and anon key. Until then the feature stays hidden in the quiz, and the leaderboard says it is not connected.

## Out of scope

- Accounts or login.
- Proof that a score is real. A player could post a made-up score with the public key. The Reset control exists to clean up before the session.
- Moderation of names beyond the character rules.
- Keeping history after a reset.

## Safety notes

- The app shows only what IFANCA published. It never states a halal ruling of its own. The leaderboard shows names and quiz scores only.
- No halal status is shown on these screens.
- No item is given a status.
- Quiz data is a dated snapshot. The leaderboard is a session tool, not IFANCA content.
- The app is not an official IFANCA app. The footer stays.
- Only a first name is collected. It is shown to the room. Nothing else about the player is stored.
