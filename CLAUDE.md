# IFANCA AI Session: from website to app

## Purpose

Material for an AI session with IFANCA (Chicago, halal certification body). The project shows how one builder uses an AI assistant to go from an organization's public website to a working app.

It has three parts:
1. **Understand:** crawl ifanca.org, build a content inventory, and compare what IFANCA promises with what a visitor can find.
2. **Build:** "The Halal Way", a phone app (installable, works offline) built from the same content. Live at https://the-halal-way.vercel.app.
3. **Teach:** a presenter's guide that walks through every step with the real files. Start at `training/README.md`.

## Ground rules

- Crawl only public pages on ifanca.org. Do not touch halalportal.org (client login) or any form.
- Check https://ifanca.org/robots.txt first and respect it.
- Rate limit to 1 request per second. Use a descriptive User-Agent that includes a contact email placeholder.
- Cache every raw response in data/raw/ so nothing is fetched twice. Re-runs must read from cache.
- Never invent content. Every claim, page summary, and coverage score must point to a source URL.
- Halal rulings and religious explanations are out of scope for generation in this project. Record what IFANCA says, do not add to it.
- Product and company lists are a dated snapshot for demo use only. Record the crawl date on every dataset.
- Scope is what a website visitor can reach by clicking from the homepage, including content loaded through search, filters, or pagination. Content found only through sitemaps, REST, or theme code is recorded as unreachable, not treated as app content.

## App rules (every screen)

- No halal ruling of the app's own. Quote IFANCA's text word for word with a source link.
- Never use the words "not halal", except in the fixed message for missing items: "Not in IFANCA's published list. This does not mean it is not certified or not halal."
- IFANCA text is never changed: FAQ answers, recipes, and articles are shown as published. Formatting may change, words may not.
- The footer stays on every screen: "Demo built from IFANCA's public content." and "Not an official IFANCA app."
- Data dates are shown in Settings, About (the owner asked to remove them from each screen).
- No Crescent-M mark and no IFANCA logo. The logo and patterns are original.
- Mobile first: 390px wide, tap targets at least 44px, works in light and dark mode.

## How work is done

Every feature goes through the same four project skills, in order, with a commit after each plan step:

1. `journey-to-spec`: a visitor's journey becomes `specs/<feature>/spec.md` (goal, screens, acceptance criteria, safety notes).
2. `spec-to-plan`: the spec becomes `specs/<feature>/plan.md` (small steps and test cases).
3. `implement-feature`: build one step at a time, one commit per step.
4. `test-feature`: Playwright at 390px, one check per criterion, screenshots, and `specs/<feature>/test-report.md`.

The understand stage has its own skills: `site-crawl` and `mission-opportunities`.

Release with the `/ship` slash command (`.claude/commands/ship.md`): build, smoke test, commit, deploy to Vercel production, check the QR code, smoke test the live site. It stops at the first failure.

## Logs

- `notes/process-log.md`: the understand stages, written as steps another person could repeat on a different organization's website.
- `notes/build-log.md`: every decision made while building, numbered (D1, D2, ...), with the reason. A status table at the top and a deploys table at the end. Keep it current.

## Testing safety

- Feature tests build the app without the Supabase settings (`VITE_SUPABASE_URL=` and `VITE_SUPABASE_ANON_KEY=` set empty), because some tests finish quiz rounds and would post to the live leaderboard.
- The smoke test answers only one quiz question. It never posts a score.
- Tests skip the splash screen with the session flag `thw.splash.skip`.

## Folder structure

```
CLAUDE.md                 this file
training/                 presenter's guide, glossary, prompts, screenshots (start here)
crawl/                    crawl, analysis, and export scripts (Python)
data/raw/                 cached raw responses (not in git)
data/pages/               one Markdown file per page, with YAML frontmatter
data/*.csv                inventory, products, companies, magazine, reachability
analysis/                 claims.json, coverage.csv, journeys.md, gaps.md, mission.md, user-journeys.md
viz/opportunity-map.html  picture of IFANCA's mission and the opportunities online (built by crawl/build_opportunity_map.py)
app/                      the app (Vite, React, TypeScript, Tailwind, PWA)
app/public/data/          the app's data, exported by crawl/export_app_data.py
app/tests/smoke.mjs       smoke test used by /ship
specs/<feature>/          spec, plan, test, test report, screenshots for each feature
supabase/                 leaderboard database setup (run in the Supabase SQL editor)
slides/                   QR code for the live app
notes/                    process log and build log
.claude/skills/           the six project skills
.claude/commands/ship.md  the /ship command
```

## Page frontmatter fields

url, title, section, page_type (core page, news, resource, faq, listing, legal), audience (consumer, industry, partner, internal, general), published_date, modified_date, word_count, crawl_date

## Pushing to GitHub

The repo is https://github.com/shehzadali/ifanca-ai-session. On the builder's Mac, FortiClient damages compressed git uploads, so push with compression off:

```
git -c core.compression=0 -c pack.compression=0 -c pack.window=0 push
```

## Writing style for all human-readable output

- US English spelling
- No em dashes, no semicolons, no contractions
- Plain, calm, professional tone. No marketing language.
- Short sentences. Tables where they help comparison.
