---
name: journey-to-spec
description: Turn a user journey or feature idea for The Halal Way demo app into specs/<feature>/spec.md. Use when the user describes a journey, a gap, or a feature idea and wants a spec before any code.
---

# Journey to spec

Write one spec for one feature. Do not write code.

## Inputs

- The journey or idea from the user.
- `analysis/journeys.md` and `analysis/gaps.md` for the visitor problem it solves.
- `app/public/data/*.json` for what data exists. Read the `count` and a few `items`.

## Steps

1. Pick a short kebab-case feature name, for example `product-check`.
2. Confirm the data needed exists in `app/public/data/`. If it does not, say so in the spec under Data needed and mark it as a blocker.
3. Write `specs/<feature>/spec.md` with exactly these sections:
   - **User goal**: one sentence, as the visitor would say it. Name the journey or gap it comes from.
   - **Screens**: each screen with its purpose and the elements on it. Mobile first at 390px.
   - **Acceptance criteria**: numbered, each one testable in a browser. Use "Given, when, then".
   - **Data needed**: the JSON file and fields, with record counts.
   - **Out of scope**: what this feature will not do.
   - **Safety notes**: see below.
4. Show the user the acceptance criteria and ask for changes before moving on.

## Safety notes (always include)

- The app shows only what IFANCA published. It never states a halal ruling of its own.
- Any halal status shown must quote IFANCA's source text and link the source URL.
- An item that is not in the data has no status. Say "Not in IFANCA's published list", never "halal" or "not halal".
- Product data is a dated demo snapshot. Show the crawl date.
- The app is not an official IFANCA app.

## Writing style

US English. No em dashes, no semicolons, no contractions. Short sentences. Plain tone.
