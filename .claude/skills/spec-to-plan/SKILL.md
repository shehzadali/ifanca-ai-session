---
name: spec-to-plan
description: Turn specs/<feature>/spec.md into specs/<feature>/plan.md for The Halal Way app. Use after a spec is agreed and before implementation.
---

# Spec to plan

Write one plan for one spec. Do not write code.

## Inputs

- `specs/<feature>/spec.md`. Stop and ask if it is missing.
- The current code in `app/src/`. Read it so the plan reuses existing components and routes.
- The data files in `app/public/data/`.

## Steps

1. Write `specs/<feature>/plan.md` with these sections:
   - **Files**: each file to add or change, with one line on why.
   - **Components**: name, props, and what it renders. Reuse before adding.
   - **Data**: which JSON file, how it loads, and any filtering or indexing. Keep large files (products.json) out of the first page load.
   - **Steps**: ordered and small. Each step leaves the app building and running. Each step names the acceptance criteria it moves forward.
   - **Test cases**: one or more per acceptance criterion, numbered to match the spec. Each says what to tap, type, or check at 390px, and the expected result.
2. Check that every acceptance criterion has at least one test case. List any gaps.
3. Stack is fixed: Vite, React, TypeScript, Tailwind, vite-plugin-pwa. Do not add a dependency unless the plan says why.
4. Show the user the step list and ask before moving on.

## Writing style

US English. No em dashes, no semicolons, no contractions. Short sentences.
