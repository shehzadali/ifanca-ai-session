# Glossary

Plain words for the ideas in this session, in the order they come up.

## The builder and the assistant

**Builder.** The person who decides what to make, writes the instructions, and checks the result. In this project, one person.

**Claude Code.** An AI assistant that works inside a project folder. It can read files, write files, run programs, and test its own work. The builder talks to it in plain English.

**Prompt (instruction).** What the builder types. A good prompt says what to make, the rules to follow, and what "done" looks like. See `training/prompts.md`.

**CLAUDE.md.** The project rulebook. A page of standing instructions the assistant reads at the start of every session, so the rules never need repeating. Like the house rules pinned to a new team member's desk.

## Collecting and understanding

**Website crawl.** Visiting every page of a website with a program and saving a copy of each, like photocopying every page of a binder.

**robots.txt.** A small file every website can publish to say which pages automated visitors may read. A polite crawler reads it first and obeys it.

**Cache.** The saved copies. Once a page is saved, the crawler never asks the website for it again.

**Claim (promise).** A sentence where an organization says what it does, copied word for word with the page it came from.

**Coverage.** Whether a consumer can easily reach content about a promise online today: online and easy to find, online with room to grow, or a new opportunity.

**Opportunity.** A part of the mission where a new digital experience could help: content to create, or content that exists and could be easier to find.

**User journey.** One real person trying to get one thing done, step by step, noting what works today and where a new experience could help. See `analysis/user-journeys.md`.

## Building with the assistant

**Skill.** A saved recipe card the assistant follows for one kind of task, written once and reused every time. This project has six: crawl a site, analyze the mission, turn a journey into a spec, turn a spec into a plan, build from the plan, and test. They live in `.claude/skills/`.

**Slash command.** A shortcut the builder types, starting with "/", that runs a fixed list of steps. `/ship` builds the app, tests it, saves it, and publishes it. It lives in `.claude/commands/ship.md`.

**Spec (specification).** A short page that says what one feature must do, before anything is built. It names the visitor's goal, the screens, and the checks the feature must pass. Like an architect's brief.

**Acceptance criteria.** The numbered checks inside a spec. Each one is written so a person, or a robot, can test it: "Given this, when the user does that, then this happens."

**Plan.** The spec broken into small steps, each small enough to build and check on its own. Like a recipe's numbered steps.

**Commit.** A saved checkpoint of the project, with a short note about what changed. The builder can always go back to any commit.

**Build log.** The diary of decisions the assistant made on its own, with the reason for each (`notes/build-log.md`). It lets the builder review choices after the fact, and lets the assistant pick up where it left off.

## Checking and publishing

**Test.** A program that uses the app like a person would (taps, types, reads the screen) and reports pass or fail for each acceptance criterion. It also takes screenshots.

**Test report.** The results table for one feature, with screenshots and notes on anything that failed and how it was fixed. In each `specs/<feature>/` folder.

**Smoke test.** A quick check of the whole app before and after publishing, to catch anything badly broken. Named after switching on a new machine and seeing if smoke comes out.

**Deploy / ship.** Publishing a new version of the app to the internet. In this project, typing `/ship` does it safely.

**Production URL.** The app's permanent public address: https://the-halal-way.vercel.app. It stays the same after every update, so the QR code never changes.

**PWA (installable web app).** A website that can be added to a phone's home screen and works offline, like an app from an app store.

**Offline.** Working without an internet connection. This app saves its data on the phone after the first visit.

## Safety

**Guardrail.** A rule the assistant must follow on every screen. In this project: never state a halal ruling, quote IFANCA word for word with a source link, show a fixed message for anything missing, and say the app is not official.

**Source link.** A link from every piece of IFANCA content back to the exact page it came from, so anyone can check it.
