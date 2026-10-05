# The instructions, in order

What the builder typed at each stage, and what came out. This is the most important file for the session: it shows that the builder writes plain English and checks the result, and the AI does the building.

Stages 1 to 3 happened in earlier sessions. Their instructions are summarized from `notes/process-log.md`. From Stage 4 on, the instructions are quoted as typed, typos included. Two long items are shortened where marked with "...". One message that contained a private key is left out.

---

## Stage 0: The rulebook

**What the builder wrote:** `CLAUDE.md`, a page of standing rules the AI reads at the start of every session. Purpose, ground rules (crawl politely, never invent content, record the date on every dataset), folder layout, and writing style.

**Why it matters:** the rules apply to every later instruction without repeating them.

---

## Stage 1: Crawl the website (summary)

> Check robots.txt and `/wp-json/` and report how the certified products and companies lists load. Propose a crawl plan before writing anything, then build it after approval.

**Then:** "Narrow scope to what a website visitor can browse. Start at the homepage, follow every clickable link, include search, filters, and pagination. Use the cache."

**What came out:** 13,662 items in `data/inventory.csv`, one Markdown file per page in `data/pages/`, and a map of what a visitor can and cannot reach (`data/visitor-inventory.csv`, `data/unreachable.csv`). Method: `.claude/skills/site-crawl/SKILL.md`.

---

## Stage 2: Understand the mission and find the gaps (summary)

> Work from the visitor inventory and the cached pages. Do not crawl. Classify the resources into themes, extract claims from the homepage, About, and Beyond Certification, score each claim against what a visitor can browse, walk three journeys, and write a ranked gap report.

**What came out:** 42 promises (`analysis/claims.json`), ratings (`analysis/coverage.csv`), three journeys (`analysis/journeys.md`), and the ranked gaps (`analysis/gaps.md`). Presenter versions: `analysis/mission.md`, `analysis/user-journeys.md`, `viz/gap-map.html`. Method: `.claude/skills/mission-gap-analysis/SKILL.md`.

---

## Stage 3: Teach the AI the workflow, and set up the app (summary)

> Create four project skills for a spec, plan, build, and test loop. Write a script that turns the cached content into data files for a mobile app called "The Halal Way". Set up the app with a home screen of five tiles and a footer that says it is not an official IFANCA app. Stop after the setup.

**What came out:** the four skills in `.claude/skills/`, the app data in `app/public/data/`, and an empty app (`training/screens/01-first-scaffold-home.png`).

---

## Stage 4: Build and deploy the whole app

The builder's longest instruction. It names the features, the safety rules for every screen, and how to deploy. Then the AI works without stopping.

```text
Build and deploy "The Halal Way" end to end without waiting for my approval at any point. I will review the result and iterate later. Read CLAUDE.md, analysis/journeys.md, analysis/gaps.md, and the existing app/ scaffold first.

How to work:
- Decide on your own when something is unclear, and record every decision in notes/build-log.md.
- Build the features in the order below. For each one, run the journey-to-spec, spec-to-plan, implement-feature, and test-feature skills in sequence, then commit. Do not stop between them.
- If a feature takes too long, ship a smaller version and note what was cut.
- If something blocks you, note it in the build log and continue with the next feature.
- Keep notes/build-log.md current so you can continue if your context gets compacted.

Rules that apply to every screen:
- No halal ruling of the app's own. Quote IFANCA's text with a source link.
- Never use the words "not halal". Missing items show "Not in IFANCA's published list. This does not mean it is not certified or not halal."
- Show the snapshot date wherever IFANCA data is shown.
- Keep the footer: "Demo built from IFANCA's public content. Not an official IFANCA app."
- Do not use the Crescent-M mark or the IFANCA logo. Use an original, simple icon.

Feature 1, product-check: search the 11,642 certified products by name, company, or category, with category filters that apply correctly. Results show name, company, category, and where sold. Search must feel instant on a phone.

Feature 2, ingredient-check: three ways in. Search one ingredient, paste the ingredient list from a label, or take a photo and read the text on the device with Tesseract.js. After a photo, let the user correct the recognized text before checking. Match against ingredients.json and show IFANCA's statements with quotes and links. Where IFANCA's sources disagree (gelatin, lecithin, mono and diglycerides), show every statement side by side. Never give a verdict on the product as a whole.

Feature 3, learn-halal: the 26 FAQs as short lessons, starting with "What is halal?", with IFANCA's answers word for word. Add a quiz built from app/public/data/quiz.json, with 15 to 20 questions, each derived only from a FAQ answer and linked to that FAQ. Levels: Beginner, Learner, Advocate, saved on the device. Rename the home tile to "Learn and quiz".

Feature 4, cook: browse recipes with search and simple filters, open a recipe to see ingredients and steps, and build a weekly meal plan by assigning recipes to days, saved on the device. Call it a meal plan, never a diet plan. No nutrition or health claims. Recipe text unchanged. Every recipe shows its source link and date. Update the Cook tile subtitle to mention the meal plan.

Feature 5, read: browse articles by theme with search, newest first, with type, date, a short preview, and a link to the full article. Show the original date clearly.

PWA:
- Web app manifest with name "The Halal Way", original icons in all required sizes, theme color matching the current design.
- Service worker with registerType autoUpdate, so installed copies pick up new deployments on next open.
- The app works offline once loaded.
- Add a noindex meta tag and a robots.txt that disallows all crawlers.

Deployment:
- Create a project slash command at .claude/commands/ship.md. It must: run the production build, run a Playwright smoke test of all five features at 390px, stop if anything fails, commit, deploy app/ to Vercel production with "vercel deploy --prod --yes", and regenerate the QR code if the production URL changed. It takes an optional description of the change for the commit message.
- Create the Vercel project named "the-halal-way" and deploy to production. Use the production URL, not a preview URL, so the address stays the same across every redeploy.
- Generate slides/qr.png (1000px) and slides/qr.svg for the production URL.
- After deploying, run the smoke test against the live URL.

When everything is done, give me a summary with: the live URL, what shipped per feature, what was cut, the decisions from the build log, and a reminder to review quiz.json. Nothing else.
```

**What came out:** five features, each with a spec, plan, commits, and a test report in `specs/`. The `/ship` command. The live app at https://the-halal-way.vercel.app.

---

## Round 2: Fixes and the room leaderboard

```text
Make these changes without waiting for my approval. Record decisions in notes/build-log.md.

1. Hide the Lemon Tiramisu recipe from the app. Add an exclusion list in the data export so it stays hidden on future exports, and note the reason in the build log.

2. Restore the bulleted list in the "What is halal?" lesson using the list structure from the cached HTML. Change formatting only, never the words. Check the other 25 lessons for the same problem and fix them the same way.

3. Show recipe photos when the device is online, loaded from their ifanca.org URLs. When offline or when an image fails, show a plain placeholder. Do not cache the photos.

4. Add a room leaderboard using the journey-to-spec, spec-to-plan, implement-feature, and test-feature skills without stopping:
   - After finishing the quiz, a player can enter a first name and post their score.
   - A /leaderboard screen for a projector: large text, top 10, updates live, shows the QR code so late joiners can scan it.
   - A "Reset" control on the leaderboard screen, protected by a simple code I can type, so I can clear test entries before the session.
   - Use Supabase. Write the SQL for the table and access rules to supabase/setup.sql and tell me to run it in the Supabase SQL editor, then ask me for the project URL and anon key.
   - If the network fails, the quiz still works and the score stays on the device.

When done, run /ship with the message "hide one recipe, lesson lists, recipe photos, room leaderboard". Then give me the leaderboard URL, the reset code, and a short summary.
```

**What came out:** `specs/room-leaderboard/`, `supabase/setup.sql`, and fixes logged as D57 to D80 in `notes/build-log.md`.

---

## Round 3: "It looks like a corporate manual"

The owner's first review of the live app.

```text
here is my feedback on the app experience:

- The app is almost black and white, and the fonts are also not modern. It almost looks like a corporate manual than an interactive consumer app
- There is no app logo on the home srceen
- The design should have islamic geometric aesthetics
- remove the second tag line from all the options on the homescreen. for example "find what IFANCA has", "See what IFANCA says", etc
- Remove content snapshot from "ifanca, october 2, 2026" or similar from everywhere
- Rename "Cook" as recepies
- Add "Meal Plan" on the home screen. The section should show day of weeks, when I tap to a day of week, I see an option to search any receipie and add to that day of week.
- Learn and
- Learn and quiz should be the top option instead of Check a product. The app should have offline storage. And on that same section it shows my current level as a horizontal bar so that I can know how far I am from the top level.
- When I am inside a section, the other options should show in the bottom navigation bar, so that I don't have to go all the way back to see them again.
- Top right section should show my avater and common mobile app settings like light/dark mode etc
- When I go to quiz it ask me to login or signup, login or signup only requires username, and avater for picture. Without name and avater leaderboard has no meaning.
```

**What came out:** `specs/app-redesign/`. Compare `training/screens/02-first-build-product-search.png` with `training/screens/03-after-redesign-home.png`.

---

## Rounds 4 and 5: Polish

```text
here is my feedback: - On the homepage, the top "the halal way" box above Learn and quiz does nothing. It should be a splash screen which some nice animation
- The headings of the sections should be capitalized for example "Learn and quiz" should be "Learn and Quiz"
- In mean plan when I click on the a day, I see only receipie name, and add button, when I click on the receipe, nothing happens, this is not a good user experience, from "search recipes to add" box, it should be what I see under recipes section, because when I am inside a receipe details, I already have option to add to meal plan.
```

```text
the splash screen should appear every time I load the app or go to the home page by clicking the top left section. Add home option in the botton navigation, taping on home should not display the splash screen
```

**What came out:** `specs/feedback-2/` and `specs/feedback-3/`.

---

## Round 6: Fixes and four new features

```text
Fixes:
1. Reduce the bottom navigation to 5 tabs: Home, Learn, Check, Recipes, Read. Check has two tabs inside: Products and Ingredients. Meal Plan moves inside Recipes as a tab. Update home tiles and routes to match. Old routes must still work.
2. Product search: before the user types, show category chips (Beverages, Food, Cosmetics and Personal Care, Nutritional and Dietary Supplements, Pharmaceuticals) instead of the full list. Sort consumer categories before ingredient and base material entries.
3. Ingredient search: pressing Enter opens the top match.
4. Home: add one line under the title explaining the app, and a short subtitle on each tile.
5. Recipe photos: show a light shimmer placeholder while loading.
6. Leaderboard: larger rows and QR for a projector, a player count, ties broken by earliest submission, a short highlight when a new score arrives, and block duplicate names.

New features, each through journey-to-spec, spec-to-plan, implement-feature, and test-feature without stopping:
7. Shopping list: build one combined ingredient list from the current meal plan. Tapping an ingredient opens IFANCA's guidance if it exists in ingredients.json. Saved on the device.
8. "Did you know" card on Home: one FAQ fact per day, quoted word for word, linking to its lesson.
9. Share button on recipes and lessons using the Web Share API, with copy link as fallback.
10. Read: make articles a full in-app experience. Render the article body from the cached page, with headings, paragraphs, and lists kept. ...
11. Back navigation: move "All recipes" and every similar back link out of the colored header box and place it above the box, on every detail screen, so it is easy to spot.
12. Footer: put "Not an official IFANCA app." on its own line, below "Demo built from IFANCA's public content."
13. Recipes: add a "Vegetarian" filter. Derive it from the ingredient list only. ...

Do not build "favorite recipes". I will build it live in the session.

When done, reset the leaderboard, run /ship with "nav cleanup, product chips, shopping list, daily fact, share", and give me a short summary.
```

(Items 10 and 13 are shortened here. How they were built is recorded in the build log, decisions D124 to D133.)

**What came out:** `specs/shopping-list/`, `specs/daily-fact/`, `specs/share/`, `specs/article-reader/`, and decisions D112 to D133.

---

## Round 7: Small changes, quick turns

```text
create sections/boxes for meal plan and shopping list on the home page. on the bottom navigation, only mealplan should be there, with shopping list inside as tab
```

```text
remove "Check products and ingredients, learn" text from the homepage, "IFANCA's answers to common questions, in a suggested order. Each lesso" from learn and quiz page, "Articles from IFANCA's resource library, newest first. Themes are approximate." from read, "Recipes from IFANCA's resource library, newest first." from Recipes screen
```

**What came out:** today's app (`training/screens/05-today-home.png`). Both shipped with `/ship`.

---

## Left for the session

**Favorite recipes** was held back on purpose, to build live in front of the room with the same four skills.
