# Build log: The Halal Way

Started 2026-10-04. The build runs without approval stops, by instruction from the project owner. Every decision made without asking is recorded here. If context is lost, read the Status table first, then the newest entries.

## Status

| Item | State | Commit or note |
|---|---|---|
| Foundation (routing, shared components) | done | 8492252 |
| Feature 1 product-check | done, 12 of 12 pass | 96e4f81 to 573192d |
| Feature 2 ingredient-check | done, 15 of 15 pass | spec 9b06901 to report |
| Feature 3 learn-halal | done, 13 of 13 pass | 476fcd0 to report |
| Feature 4 cook | done, 12 of 12 pass | 6dbfb03 to report |
| Feature 5 read | done, 10 of 10 pass | a397f93 to report |
| PWA (manifest, icons, offline, noindex) | done, local smoke 8 of 8 | see git log "pwa:" |
| /ship command and smoke test | done | `.claude/commands/ship.md`, `app/tests/smoke.mjs` |
| Vercel project and production deploy | done | https://the-halal-way.vercel.app |
| QR code | done | `slides/qr.png`, `slides/qr.svg`, decoded and checked |
| Live smoke test | done, 8 of 8 pass | 2026-10-04 |
| Feature 6 room-leaderboard | done, connected to Supabase | project qfsryjrqgsarogapkspo |
| Redesign (owner feedback) | done, 15 of 15 pass, earlier tests rerun and pass | owner to run `supabase/002_profiles.sql` for avatars |
| Feedback 2 (splash, title case, meal plan day) | done, 14 of 14 pass, all earlier tests rerun and pass | |
| Feedback 3 (splash every load and on logo, Home tab) | done, 11 of 11 pass, all earlier tests rerun and pass | |

## How each feature is built

1. journey-to-spec writes `specs/<feature>/spec.md`.
2. spec-to-plan writes `specs/<feature>/plan.md`.
3. implement-feature makes one commit per plan step.
4. test-feature writes `specs/<feature>/test-report.md` with screenshots.

The skills say to show the user the criteria or the plan and ask before moving on. The owner asked for no stops, so those review points are skipped and the owner reviews afterward.

## Decisions

### General

- D1. Approval steps in the skills are skipped (see above).
- D2. Hash routes stay, as in the scaffold. Feature screens move to `app/src/features/`. Shared parts go to `app/src/components/` and `app/src/lib/`.
- D3. Product categories contain HTML entities such as `&amp;` (1,815 values). They are decoded in the browser when the data loads. The data files are not changed.
- D4. Snapshot date shown as "IFANCA data snapshot: October 3, 2026" using the `crawl_date` of the file the screen reads.
- D5. New dependencies: `tesseract.js` and `@tesseract.js-data/eng` for on-device OCR (asked for by the owner), and `qrcode` as a dev dependency for the QR files. Nothing else.
- D6. Tesseract files (worker, LSTM core variants, English data `4.0.0_best_int`, about 3 MB) are copied from node_modules into `public/tesseract/` by a `prebuild` script. They are served from the app itself, not a third-party CDN. They are not committed.
- D7. Shared test harness `specs/test-lib.mjs` and report writer `specs/report.mjs`. Each feature test uses them so results look the same. Tests block service workers so each run reads fresh files.
- D8. The preview server stays running across features instead of stopping after each test run. It serves `dist/`, which each build replaces. It is stopped at the end.
- D9. On feature screens the large home header becomes a compact app bar to save space on a phone.

### Feature 1 product-check

- D10. Search matches every typed word against name, company, and category together. No fuzzy matching, so results are easy to explain.
- D11. Category filter is a native select with counts, not chips. There are 62 categories, too many for chips at 390px.
- D12. 50 cards at a time with "Show more". Measured 25 ms per keystroke with 4x CPU slowdown.
- D13. No marketplace or country filter. Cut to keep the screen simple. Search does not cover "Sold in".
- D14. The empty state links to the current list on ifanca.org and to the ingredient check.
- D15. The source list repeats a product once per country. Shown as published, not merged.

### Feature 2 ingredient-check

- D16. Matching is on whole words, case ignored. Only spelling variants are matched: hyphens and spaces, "and", "&", or "/" between words, an optional final "s", and E-numbers written as "E471", "E 471", or "E-471".
- D17. Three names were merged by the Stage 3 export from several printed spellings. The matcher accepts those spellings: "Artificial and natural flavors" matches "natural flavors", "artificial flavors", and "artificial/natural flavors". The same for colorings. "Yellow No. 5" matches "Yellow 5" and "Yellow #5".
- D18. Longest name wins. "Mono and diglycerides" is not also shown as "Monoglycerides".
- D19. "Alcohol" matches inside "sugar alcohol". Left as is, because the card shows IFANCA's context ("Listed for Mouth Wash"), so the reader can judge.
- D20. Status words come from ingredients.json and are labeled "Recorded status in this source". The mapping of IFANCA's headings to status words was made in Stage 3 and is shown next to the heading text.
- D21. Side by side at 390px: one column per recorded status, in a row that scrolls sideways inside the card, with a line that says how many columns there are. Three full columns do not fit on a phone. On wider screens the columns share the width.
- D22. The Not found box sits above the ingredient cards so both parts of the answer show without long scrolling.
- D23. Photos are shrunk to a 2000px long side before OCR. English only. The OCR files (about 7 MB on first use) are cached by the service worker on first use, so the Photo tab works offline only after one use.
- D24. "Take a photo" uses the camera input. "Choose a photo" opens the photo library. Both read on the device.

### Feature 3 learn-halal

- D25. quiz.json did not exist. It was written in this build: 18 questions, 6 per level. Each question quotes one sentence from one FAQ answer and links that FAQ. Questions that touch a status start with "According to IFANCA". **IFANCA should review it before any wider use.**
- D26. `scripts/check-quiz.mjs` runs before every build. The build fails if a quote is not word for word in its FAQ answer, a FAQ link is unknown, or the count is outside 15 to 20.
- D27. Levels are three quiz rounds: Beginner, Learner, Advocate. Beginner is open. A round opens when the round before it is passed with 4 or more of 6. "Your level" is the highest round passed. Saved in localStorage (`thw.quiz`).
- D28. Lesson order: five topic groups (Halal basics, Ingredients, Eating out, Certification for companies, IFANCA policies), starting with "What is halal?". Grouping only. Text is unchanged.
- D29. Lessons are split into paragraphs of about 60 words at sentence breaks. No words change. The test joins the paragraphs and compares with faqs.json for all 26.
- D30. The crawl flattened the bulleted list in "What is halal?" into running text. The app shows it as stored. Fix belongs in the crawl export.
- D31. Opening a lesson marks it read (`thw.learn.read`). No separate "mark as read" button.

### Feature 4 cook

- D32. Filters are "Main ingredient" (Chicken, Beef, Lamb or goat, Fish and seafood, one at a time) and "8 or fewer ingredients". A main ingredient matches when the ingredient lines name it. These are plain text facts, not categories the app invents. Counts: Chicken 52, 8 or fewer 131.
- D33. Search covers titles and ingredient lines. Newest first. 30 rows at a time.
- D34. No recipe photos. They are hosted on ifanca.org, would load from IFANCA's server on every view, and would not work offline.
- D35. Ingredient and step lines that end with a colon show as small headings. Steps are numbered by the app. The words are unchanged.
- D36. Meal plan: seven days, Monday to Sunday, any number of recipes per day. Stored by recipe URL in localStorage (`thw.mealplan`). Clearing asks for confirmation.
- D37. Lemon Tiramisu lists "limoncello (optional)". Left unchanged as IFANCA published it. Flagged in the test report for IFANCA to review.

### Feature 5 read

- D38. Theme chips with counts from the data. One theme at a time. Labels in sentence case. A line says themes are approximate, as the data note says.
- D39. Each card leads with "Published <date>" in bold, then title, type and theme, the stored 40-word preview, and the link.
- D40. 20 cards at a time. Search covers title and preview only, because the full text is not in the data.
- D41. The filter chip moved to `components/Chip.tsx` so Cook and Read share it.

### PWA

- D42. New original icon: a cream winding path with a small green leaf on the brand green. The scaffold icon was a crescent with a dot. It was replaced so nothing in the app resembles IFANCA's Crescent-M mark.
- D43. Icon files from `scripts/make-icons.mjs` (Playwright renders the SVG): 192, 512, maskable 512 (full bleed, art in the safe zone), Apple touch 180, favicon 32, and the SVG. They are committed. The script is run by hand.
- D44. Manifest name "The Halal Way", short name "Halal Way", theme color #1f5f4a (the existing brand green), background #f7f5ef.
- D45. Offline: all data files are now precached (40 entries, about 4.3 MB) so every screen works offline after the first visit. This changes a Stage 3 decision that cached data only on first use. The precache downloads in the background after the first page shows, so it does not slow the first load. The precache size limit is raised to 4 MB for products.json.
- D46. OCR files are not precached. The Photo tab works offline only after one photo has been read online.
- D47. noindex in three places: a robots meta tag, `robots.txt` with "Disallow: /", and an `X-Robots-Tag` header in `vercel.json`.
- D48. `vercel.json` sets `sw.js` to revalidate on every load, so installed copies find a new deployment on the next open. Hashed assets are cached for a year.
- D49. The footer date now uses the same format as the screens ("October 3, 2026").
- D50. `app/tests/smoke.mjs` checks all five features at 390px, the manifest, noindex, robots.txt, and offline loading of all five screens. It takes the base URL as an argument.

### Deployment

- D51. Vercel project "the-halal-way" in the personal team (hobby plan), linked from `app/`. Vercel builds from source (`npm run build`), so the prebuild steps (Tesseract copy, quiz check) run on every deploy.
- D52. Production URL: https://the-halal-way.vercel.app. It is the project's production domain and stays the same on every `vercel deploy --prod`. The per-deployment URL is never used.
- D53. Vercel reports "Vercel Authentication" deployment protection. On this plan it covers preview URLs only. The production URL was checked with curl and the smoke test without logging in, and it is public.
- D54. `/ship` reads `productionUrl` from the JSON that `vercel deploy --prod --yes` prints, saved to `app/.vercel/last-deploy.json`. It compares that URL with `slides/qr-url.txt` and makes a new QR code only when the URL changes.
- D55. QR code: `slides/qr.png` (1000 x 1000) and `slides/qr.svg`, dark green on white, error correction M. The PNG was decoded with jsQR and gives the production URL.
- D56. `.vercelignore` keeps tests, the icon script, `.env` files, and build output out of the upload.

### Changes on 2026-10-04 (second request)

- D57. Lemon Tiramisu is hidden. Reason: its ingredient list includes limoncello, an alcoholic liqueur, as optional. The project owner asked to hide it until IFANCA reviews it. The data export now reads `crawl/app_exclusions.csv` (url, dataset, reason, date) and leaves those URLs out. A row without a reason stops the export. recipes.json has 340 recipes and records `recipes_excluded: 1`.
- D58. The export reruns byte for byte the same before the change. After the change, only faqs.json (new `blocks` field) and recipes.json (one recipe fewer) differ. No `answer` text changed. ingredients.json is unchanged.
- D59. FAQ structure comes from the cached answer HTML in `data/raw/faq/`. `<ul>` and `<ol>` become lists. Other text is split into paragraphs at `<p>` tags and blank lines, which is how WordPress stores paragraphs. The export stops if the joined blocks differ from the `answer` text by even one character.
- D60. Ten of the 26 lessons had lists in the source. All ten now show them, numbered for `<ol>` and bulleted for `<ul>`. Source paragraph breaks are kept in every lesson. Source paragraphs over about 60 words are still split at sentence breaks for a phone screen.
- D61. Recipe photos show only on the recipe screen, from the `image_url` in recipes.json (207 of 340 recipes have one). The list has no thumbnails, so a page of 30 rows does not make 30 requests to ifanca.org.
- D62. Photos load only when the browser reports it is online. Offline, missing, or failed photos show a plain placeholder with one line of text. Images use `referrerPolicy="no-referrer"` and lazy loading.
- D63. "Do not cache the photos": the service worker has a NetworkOnly rule for ifanca.org, so it never stores them, and the live smoke test checks this. The browser's own short-lived HTTP cache is controlled by ifanca.org's headers and is outside the app's control.

### Feature 6 room-leaderboard

- D64. Score posted = the sum of the best score in each round (0 to 18) plus the level. The post section shows after every round, passed or not, so everyone in the room can take part.
- D65. One entry per device. A random device key is made once and saved on the device. Posting again updates that entry and keeps the best total. Ties are ordered by who reached the score first.
- D66. Names: 1 to 20 letters, spaces, hyphens, apostrophes, or periods. The same rule is checked in the browser and in the database.
- D67. All writes go through two database functions, `post_score` and `reset_leaderboard`. Anyone can read the table. Nobody can insert, update, or delete rows directly with the public key. Device keys and the reset code hash sit in a schema the API cannot reach. A full board (500 entries) refuses new names.
- D68. The reset code is stored only as a bcrypt hash in `setup.sql`. The plain code is not in the repo. It is given to the owner in chat. A wrong code waits 1 second before failing, to slow guessing.
- D69. Live updates: Supabase Realtime, plus a poll every 5 seconds in case a venue network blocks the live connection.
- D70. Offline or failed posts: the score was already saved on the device by the quiz. The post is kept as pending and tried again on the next app start and whenever the device comes back online. A post the database refuses (bad name) is not retried.
- D71. `@supabase/supabase-js` added. It loads only on the leaderboard screen or when a score is posted (separate 214 KB chunk). The main bundle did not grow.
- D72. The leaderboard is at `/leaderboard` (a Vercel rewrite) and `#/leaderboard`. It uses a wide layout and hides the small app bar so all 10 rows and the QR code fit on a 1280 x 720 projector. The footer stays.
- D73. The QR code on the leaderboard is `app/public/qr.svg`, written by the same script as the slides, so both always match. The URL under it comes from `app/public/qr.json`.
- D74. The settings are `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Vercel production env, and `app/.env.local` for local builds). With no settings, the post section is hidden and the leaderboard says it is not connected. The anon key is public by design. The rules in `setup.sql` are what protect the data.
- D75. Order of work: the owner asked to be asked for the Supabase URL and key, and also to run /ship at the end. To avoid waiting, everything ships first with the leaderboard not yet connected. After the owner sends the URL and key, they go into Vercel and a redeploy turns the feature on.
- D76. Not covered: a player could post a made-up score with the public key. The reset control is for clearing test or bad entries before the session.

- D77. Checked on the real project before connecting, with the anon key only: reads work, a direct insert is refused (401), the private schema is not reachable (406), a bad name and a wrong reset code are refused by the functions. Realtime delivered an insert after 0.7 s and the delete from the reset. The right reset code cleared the one test entry. The board was left empty.
- D78. Realtime missed one event sent in the first moment after subscribing, then worked. The 5-second poll covers that window.
- D79. Vercel flagged `VITE_SUPABASE_ANON_KEY` as a possible credential. It was added as a public config value on purpose. A Supabase anon key is meant to be in the browser. The access rules in `setup.sql` protect the data. The service role key is not used anywhere.
- D80. The two settings are in Vercel (Production) and in `app/.env.local` for local builds. Neither file with values is committed.

### Redesign after owner feedback (2026-10-04)

- D81. Look: Plus Jakarta Sans (bundled with the app, works offline), a warm sand background, and six section colors (emerald, teal, amber, clay, indigo, plum). White text on each passes 4.5 to 1. Measured lowest text contrast: 5.5 light, 7.9 dark.
- D82. Islamic geometric look: one original eight-point star lattice, drawn as an SVG mask so it takes any color. Used in the home header, tiles, section headers, and the leaderboard. No crescent shapes anywhere, so nothing resembles the Crescent-M mark.
- D83. New logo: a gold eight-point star around a cream leaf on emerald. It replaces the path icon. It is on the home header, the top bar, the favicon, and the installed app icons.
- D84. Home: logo header, Learn and quiz first and full width with the level bar, then Check a product, Check ingredients, Recipes, Meal plan, Read. Tiles have a label only.
- D85. Level bar: four steps (Not started, Beginner, Learner, Advocate). A passed round fills one third. The best score in the next round fills part of the next third. The tile says how many levels are left.
- D86. Snapshot dates: removed from every screen and the footer, as asked. Kept in Settings, About with each dataset's date and count, so the app still discloses the age of the data. This changes the first request's rule "show the snapshot date wherever IFANCA data is shown". The export now writes `meta.json` (dates and counts) so About does not load the 3 MB product file.
- D87. The missing-product message keeps its warning but no longer uses the word "snapshot": "This list is a copy of IFANCA's website from a past date."
- D88. Bottom navigation: six items (Learn, Products, Ingredients, Recipes, Meal plan, Read) on every section screen. Not on home, where the tiles do the same job, and not on the projector leaderboard.
- D89. Top bar: logo and name on the left, avatar button on the right. It opens a Settings sheet with Profile (edit, sign out), Appearance (System, Light, Dark), and About. Text size was not added, because most text sizes are fixed for the phone layout.
- D90. Dark theme: every color is a variable with a dark value. The choice is saved on the device and applied before the first paint to avoid a white flash.
- D91. Cook is now Recipes (`#/recipes`). Old `#/cook` links still open the right screen.
- D92. Meal plan is its own section (`#/plan`): seven day cards, and a day view with the planned recipes, Remove, a search box, and Add buttons. With no search, it lists the newest recipes. "Add to meal plan" on recipe pages still works.
- D93. Sign up: a name (2 to 20 letters, numbers, spaces, hyphens, apostrophes, periods, or underscores) and one of 12 preset avatars. No password and no server account. The profile lives on the device. Uploaded photos were not offered: they would put faces on a projector with no way to moderate them.
- D94. Only the quiz needs a profile. Lessons and every other section stay open.
- D95. Scores post on their own after every round, with the profile's name and avatar. The separate name field and button on the result screen are gone.
- D96. Sign out removes the profile, quiz progress, and the leaderboard device key, so the next person on the same phone gets a new entry. Lessons read and the meal plan stay.
- D97. `supabase/002_profiles.sql` adds the avatar column (preset ids only, checked by pattern), the wider name rule, and a five-argument `post_score`. The first `post_score` stays for older copies. Until the owner runs 002, the app falls back to the old function and shows initials on the leaderboard. A name with numbers or an underscore is refused by the old function until 002 runs.
- D98. Test safety: the feature tests now build without the Supabase settings (a test finishes quiz rounds, which would post to the live board). The smoke test answers one question only.

### Feedback 2 (2026-10-04)

- D99. The home header box became a splash screen. It is plain HTML and CSS in `index.html`, so it paints on the first frame while the app code loads, instead of adding a wait. Animation: the lattice fades in, the two squares of the star draw themselves while turning in from opposite sides, the leaf grows, a glow pulses, then the title and line rise. It fades out after about 2 seconds. A tap closes it at once.
- D100. The splash shows once per app session (a new tab or a fresh launch of the installed app), not on every screen change or reload. It never shows on the projector leaderboard. With reduce motion set on the device it shows still and closes after 0.7 seconds.
- D101. Home now starts with the Learn and Quiz tile. The logo stays in the top bar.
- D102. Title case for section names, screen headings, in-screen headings, and the Learn section groups, with small words (a, and, to, for, of) in lower case. Titles written by IFANCA, buttons, filter chips, and sentences are unchanged.
- D103. Meal Plan day view: "Add a Recipe" is the same list as the Recipes section (search, Main Ingredient chips, "8 or fewer ingredients", count, rows, Show more). Tapping a row opens the full recipe page. The old Add buttons in the list were removed, as the owner asked.
- D104. A recipe opened from a day uses the route `#/recipes/<slug>/for/<Day>`. Its page shows "Back to <Day>", a main "Add to <Day>" button (disabled as "Added to <Day>" once added), and "Choose another day" for the picker. The bottom navigation marks Meal Plan.
- D105. On any recipe page, the link after adding now reads "Back to <Day>" and opens that day, instead of the week view.
- D106. Tests skip the splash through a session flag, except the splash tests, which use fresh browser contexts.

### Feedback 3 (2026-10-04)

- D107. The splash now plays on every app load, including a reload, and again when the top-left logo is tapped. This replaces the once-per-session rule from D100. It still never plays on the projector leaderboard, a tap still skips it, and reduce motion still keeps it still and short.
- D108. `index.html` keeps a clean copy of the splash and exposes `window.thwSplash()`. The top-left logo link calls it and goes home. Moving between screens inside the app does not play it.
- D109. The bottom navigation has Home first, then the six sections, seven items in all. Home goes home without the splash. The navigation now also shows on home, with Home marked, so it looks the same on every screen. This replaces D88, which hid it on home.
- D110. Seven items at 390px: labels are 10px with slightly tighter letter spacing and no side padding, so "Ingredients" fits when marked. Each item is 56px tall.
- D111. Tests skip the splash with the session flag `thw.splash.skip`. Splash tests use fresh browser contexts.

## Deploys

| Date | Commit | URL | Live smoke |
|---|---|---|---|
| 2026-10-04 | 1255a30 (first deploy, before the ship command was committed) | https://the-halal-way.vercel.app | 8 of 8 pass |
| 2026-10-04 | c172bc9 (dry run of the /ship steps, nothing new to commit) | https://the-halal-way.vercel.app, unchanged, QR not regenerated | 8 of 8 pass |
| 2026-10-04 | 1f1890b (hide one recipe, lesson lists, recipe photos, room leaderboard). Leaderboard deployed but not connected until the Supabase settings are added. | https://the-halal-way.vercel.app, unchanged, QR not regenerated | 9 of 9 pass |
| 2026-10-04 | e5804c0 (connect the room leaderboard to Supabase) | https://the-halal-way.vercel.app, unchanged, QR not regenerated | 9 of 9 pass. Live end-to-end run: a phone posted a score, the projector showed it after 0.8 s over realtime, and the reset code cleared it through the UI. The board was left empty. |
| 2026-10-04 | e36da69 (redesign from owner feedback). The first local smoke run failed 2 of 9 on two smoke-test lines not yet updated for the redesign. Nothing was deployed until they were fixed and the run passed. | https://the-halal-way.vercel.app, unchanged, QR not regenerated | 9 of 9 pass. Live leaderboard left empty. Avatars wait for `002_profiles.sql`. |
| 2026-10-04 | 41321ec (splash screen, title case headings, meal plan day uses the recipe list). Nothing new to commit at ship time. | https://the-halal-way.vercel.app, unchanged, QR not regenerated | 9 of 9 pass. Live leaderboard left empty. |
