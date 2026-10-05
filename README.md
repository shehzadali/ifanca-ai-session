# From a website to an app, with AI

How one builder used an AI assistant (Claude Code) to read IFANCA's public website, find where visitors get stuck, and build a phone app that helps them.

- **Live app:** https://the-halal-way.vercel.app
- **Presenter's guide:** [training/README.md](training/README.md), start here
- **Plain-language terms:** [training/glossary.md](training/glossary.md)
- **Every instruction the builder typed:** [training/prompts.md](training/prompts.md)

## What is in this repo

| Stage | What it is | Where |
|---|---|---|
| Rules | The house rules the AI follows | [CLAUDE.md](CLAUDE.md) |
| Collect | A polite copy of ifanca.org | [crawl/](crawl/), [data/](data/) |
| Understand | IFANCA's promises, rated against what visitors can find | [analysis/mission.md](analysis/mission.md), [viz/gap-map.html](viz/gap-map.html) |
| Journeys | Three visitors, where they get stuck, and the features that help | [analysis/user-journeys.md](analysis/user-journeys.md) |
| Workflow | Recipe cards (skills) the AI follows, and the /ship command | [.claude/](.claude/) |
| Features | Spec, plan, test report, and screenshots for each feature | [specs/](specs/) |
| App | The phone app | [app/](app/) |
| Logs | Every step and every decision | [notes/](notes/) |

## Disclaimer

Demo built from IFANCA's public content. Not an official IFANCA app. Content was copied from ifanca.org on 2026-10-03 and 2026-10-04 and may be out of date.
