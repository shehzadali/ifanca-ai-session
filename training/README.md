# How one builder made "The Halal Way" with AI

A presenter's guide. Each chapter says what to open, what to point at, and the idea to teach. The audience does not need to read code. Nothing in this guide shows code. It shows the instructions, rules, recipes, and results.

**The one-line story:** one builder took IFANCA's public website, had an AI assistant read it, find where visitors get stuck, and build a phone app that fixes those problems, in two days, by writing plain-English instructions and checking every result.

- Live app: https://the-halal-way.vercel.app (QR code: `slides/qr.png`)
- Room leaderboard for the projector: https://the-halal-way.vercel.app/leaderboard
- Project on GitHub: https://github.com/shehzadali/ifanca-ai-session
- Plain-language terms: `training/glossary.md`
- Every instruction the builder typed: `training/prompts.md`
- Screenshots: `training/screens/`

## The whole journey on one page

```text
 1. Rulebook        CLAUDE.md                          the house rules
 2. Collect         crawl ifanca.org                   13,662 items saved
 3. Understand      IFANCA's promises vs. the website  42 promises, 31 only partly kept
 4. Walk            three visitors' journeys           all three get stuck
 5. Teach           skills: recipe cards for the AI    6 skills
 6. Specify         one feature, one spec              what "done" means
 7. Plan            small steps                        4 steps for product search
 8. Build           one save point per step            86 save points in total
 9. Test            a robot uses the app               161 checks, all passing
10. Ship            /ship                              live in one command
11. Listen          owner feedback, 6 rounds           same loop, every time
```

## Before the session

- [ ] Open this repo in your editor or on GitHub, with this guide on screen.
- [ ] Open `viz/gap-map.html` in a browser tab.
- [ ] Open the live app on your phone. Install it (Add to Home Screen) so the splash plays on open.
- [ ] Open the leaderboard on the projector screen. Check it is empty. If not, use Reset with the reset code.
- [ ] Have `slides/qr.png` ready so the room can join.

Timings add up to about 60 minutes. Chapters marked **short path** make a 30-minute version.

---

## 1. The rulebook (3 min, short path)

**Teach: CLAUDE.md.** Before any work, the builder wrote a page of house rules. The assistant reads it at the start of every session, so the rules never need repeating.

**Open:** `CLAUDE.md`

**Point at:**
- "Ground rules": crawl politely, respect robots.txt, never invent content, every claim points to a source, record the date on every dataset.
- "Halal rulings ... are out of scope." The AI records what IFANCA says. It never adds its own opinion.

**Say:** "Working with AI starts with rules, not requests. These rules stopped the AI from ever stating a halal ruling of its own, on every screen it built."

---

## 2. Collect: reading the website (5 min)

**Teach: crawl, robots.txt, cache.** A crawl visits every page and saves a copy. A polite crawler asks permission (robots.txt), goes slowly (one page per second), and never asks for the same page twice (cache).

**Open, in order:**
1. `training/prompts.md`, "Stage 1". The builder asked for a plan before any crawling.
2. `.claude/skills/site-crawl/SKILL.md`, the method as a reusable recipe card.
3. `data/pages/`. Open any one file. One page of the website, cleaned up, with its address and date at the top.
4. `data/inventory.csv`, opened in a spreadsheet app. 13,662 rows: 11,642 products, 1,115 library items, 172 news posts, and more.

**Story to tell:** the first crawler name, "IFANCA-AI-Session-Crawler", was blocked by IFANCA's own robots.txt, because "Session" contains a short blocked name. The AI caught it with an automatic check before visiting a single page. (`notes/process-log.md`, Stage 1, Step 2.)

**Note for the room:** the crawl and analysis skills were written from the process log after those stages, so the method can be reused on any other organization's website.

---

## 3. Understand: what IFANCA promises (7 min, short path)

**Teach: claims and evidence.** The AI copied every promise IFANCA makes on its main pages, word for word, and a script checked each one against the page. Then it checked whether a visitor can find content that backs each promise.

**Open, in order:**
1. `training/prompts.md`, "Stage 2".
2. `.claude/skills/mission-gap-analysis/SKILL.md`.
3. `analysis/mission.md`: the mission in IFANCA's own words, the three pillars, and what the ratings mean.
4. `viz/gap-map.html` in the browser. Hover over the red square C27 to read the promise and why nothing backs it.

**Point at:** certification is mostly green (easy to find). Education and institutions are almost all yellow (promised, but hard to find).

**Say:** "The AI did not summarize. It quoted, and it showed its evidence for every rating. That is what makes the result trustworthy."

---

## 4. Walk in a visitor's shoes (5 min, short path)

**Teach: user journey.** One real person, one goal, step by step, marking where they get stuck.

**Open, in order:**
1. `analysis/user-journeys.md`, part 1: three people, three goals, where each breaks.
2. `analysis/journeys.md`, Journey 1. Scroll to steps 5 to 7, all "Fail": a shopper cannot confirm certification and gets no explanation when a product is missing.
3. `analysis/user-journeys.md`, part 2: how each problem became an app feature.

**Say:** "We did not start from 'what features should the app have'. We started from 'where do real people get stuck'. Every feature traces back to a step marked Fail."

---

## 5. Teach the AI your way of working (5 min)

**Teach: skill.** A skill is a recipe card the AI follows for one kind of task. Write it once, reuse it for every feature.

**Open:** `.claude/skills/`. Six folders. Open the four that build features, in order, and read only the first lines of each:
1. `journey-to-spec/SKILL.md`: turn a journey into a spec. Note the "Safety notes (always include)" section.
2. `spec-to-plan/SKILL.md`: turn the spec into small steps.
3. `implement-feature/SKILL.md`: build one step at a time, save after each.
4. `test-feature/SKILL.md`: test every check at phone size, with screenshots, and report honestly.

**Say:** "This is how a builder stays in control. The AI always follows the same four steps, in the same order, with the same safety rules."

---

## 6 to 9. One journey, start to finish: "Is this product certified?" (15 min, short path)

Follow Journey 1 through the four skills. Every file is in `specs/product-check/`.

### 6. The spec (4 min)

**Teach: spec and acceptance criteria.** Before building, write down what "done" means, as checks anyone can test.

**Open:** `specs/product-check/spec.md`

**Point at:**
- "User goal": one sentence, in the visitor's words, naming Journey 1.
- "Acceptance criteria": numbered checks. Read number 7 aloud: the fixed message for a missing product.
- "Safety notes": the guardrails, copied into every spec.

### 7. The plan (3 min)

**Teach: plan.** Break the work into small steps that can each be checked.

**Open:** `specs/product-check/plan.md`

**Point at:** "Steps": four ticked boxes. "Test cases": one per acceptance criterion, so nothing is forgotten.

### 8. The build (3 min)

**Teach: commit (save point) and build log.**

**Open:** the commit history on GitHub: https://github.com/shehzadali/ifanca-ai-session/commits/main (or run `git log --oneline --grep product-check` in a terminal).

```text
96e4f81 product-check: spec and plan
8492252 product-check: step 1 routing and shared screen parts
e3b29db product-check: step 2 search, category filter, results
606a9c4 product-check: step 3 empty state and layout check
b85fa3e product-check: step 4 larger snapshot source link
573192d product-check: test report
```

Then open `notes/build-log.md` and read decisions D10 to D15. The AI decided small things on its own and wrote down why, so the builder can review them later.

**Say:** "One save point per step. If anything goes wrong, we go back one step, not back to the start."

### 9. The test (5 min)

**Teach: automated test and test report.** A program uses the app like a person: taps, types, reads. It checks every acceptance criterion and takes a screenshot of each.

**Open:** `specs/product-check/test-report.md`, then two screenshots in `specs/product-check/screenshots/`: `ac-4.png` (the Cheese filter) and `ac-7.png` (the missing-product message).

**Story to tell:** the first test run failed twice. One failure was a real problem: a link was too small to tap easily on a phone. The AI fixed it as a new plan step (step 4 above). The other failure was a mistake in the test itself, and the report says so honestly.

**Then the wow moment, same journey, step 8:** show `training/screens/07-today-ingredient-photo.png` and `07b-today-ingredient-result.png`. The app reads an ingredient label from a photo, on the phone, and shows what IFANCA has published about each ingredient, quoting every source, even when IFANCA's own sources disagree.

---

## 10. Ship (5 min, short path)

**Teach: slash command, deploy, smoke test.**

**Open:** `.claude/commands/ship.md`

**Point at the seven steps in plain words:** build it, run the robot check on the whole app, save, publish, check the QR code, check the live site, write it in the log.

**Then:** `notes/build-log.md`, the "Deploys" table at the end. Nine releases.

**Story to tell:** twice, `/ship` stopped itself because the robot check failed, and nothing broken reached the live app. (Deploys table, rows for the redesign and for round 6.) That is the point of putting the steps into one command: the safety checks cannot be skipped.

**Show:** `slides/qr.png`. The address never changes, so this QR code works after every update.

---

## 11. Listen and iterate (8 min)

**Teach: the loop.** The first version was not the final one. The owner reviewed it, wrote feedback in plain English, and the same skills ran again.

**Open:** `training/prompts.md`, "Round 3", the owner's first review: "It almost looks like a corporate manual than an interactive consumer app."

**Show the screenshots side by side, in `training/screens/`:**
1. `01-first-scaffold-home.png`: the empty starting point.
2. `02-first-build-product-search.png`: the first working version.
3. `03-after-redesign-home.png`: after the first feedback round.
4. `04-today-splash.png` and `05-today-home.png`: today.
5. `09-today-quiz-answer.png`, `10-today-meal-plan-day.png`, `11-today-shopping-list.png`, `12-today-article.png`: some of what was added along the way.

**Say:** "Six rounds of feedback, each one a short message. The builder's job was to look, judge, and say what to change. The AI's job was to change it safely and prove it still works."

---

## 12. Play together (5 min)

- Put `slides/qr.png` on screen. Everyone opens the app on their phone.
- They sign up with a name and an avatar, and play one quiz round.
- Switch to the leaderboard on the projector and watch the names appear live. (A sample is in `training/screens/13-leaderboard-projector-sample-data.png`.)

---

## 13. Build something live (optional, 10 min)

**Favorite recipes** was left out on purpose. Build it in front of the room:
1. Type a one-sentence request that names the journey-to-spec skill.
2. Read the spec it writes. Point at the acceptance criteria and the safety notes.
3. Let it plan, build, and test. Show the test report.
4. Type `/ship`.

---

## Where everything is

| What | File |
|---|---|
| House rules | `CLAUDE.md` |
| Every instruction typed | `training/prompts.md` |
| Plain-language terms | `training/glossary.md` |
| Crawl method | `.claude/skills/site-crawl/SKILL.md`, `notes/process-log.md` Stage 1 |
| Crawl results | `data/inventory.csv`, `data/pages/` |
| Mission summary | `analysis/mission.md` |
| Promises and ratings | `analysis/claims.json`, `analysis/coverage.csv`, `viz/gap-map.html` |
| Journeys | `analysis/user-journeys.md`, `analysis/journeys.md` |
| Ranked gaps | `analysis/gaps.md` |
| Workflow skills | `.claude/skills/` |
| Specs, plans, test reports | `specs/<feature>/` |
| Decisions the AI made | `notes/build-log.md` |
| Release command | `.claude/commands/ship.md` |
| Screenshots over time | `training/screens/` |
