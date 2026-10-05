# The Halal Way (app)

A phone app built from IFANCA's public content. Installable, works offline after the first visit.

Live: https://the-halal-way.vercel.app

## Sections

| Section | What it does | Spec |
|---|---|---|
| Learn and Quiz | IFANCA's 26 FAQ answers as lessons, a quiz in three levels, and a room leaderboard | `specs/learn-halal/`, `specs/room-leaderboard/` |
| Check | Search 11,642 certified products, and check ingredients by name, pasted list, or photo | `specs/product-check/`, `specs/ingredient-check/` |
| Recipes | 340 recipes from IFANCA's library, with filters | `specs/cook/` |
| Meal Plan | A weekly plan and a combined shopping list | `specs/cook/`, `specs/shopping-list/` |
| Read | 763 articles from IFANCA's library, 761 readable in full in the app | `specs/read/`, `specs/article-reader/` |

## For builders

- Data comes from `public/data/`, exported by `crawl/export_app_data.py` from the cached crawl.
- Run locally: `npm install`, then `npm run dev`.
- Release: type `/ship` in Claude Code (see `.claude/commands/ship.md`).
- Leaderboard settings go in `.env.local` (see `.env.example`).

Demo built from IFANCA's public content. Not an official IFANCA app.
