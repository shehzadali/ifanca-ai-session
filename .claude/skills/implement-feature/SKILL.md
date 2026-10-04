---
name: implement-feature
description: Implement specs/<feature>/plan.md in The Halal Way app one step at a time, committing after each step. Use after a plan is agreed.
---

# Implement feature

## Inputs

- `specs/<feature>/plan.md` and `specs/<feature>/spec.md`. Stop and ask if either is missing.

## For each step in the plan, in order

1. Make only the changes that step lists.
2. Run `npm run build` in `app/`. Fix errors before going on.
3. Check the change in the running app (`npm run dev`) at 390px width.
4. Commit with the message `<feature>: step <n> <short description>`. Stage only the files this step touched.
5. Tick the step in plan.md (`- [x]`) in the same commit.

If a step cannot be done as planned, stop. Explain the problem and propose a plan change. Do not improvise a different design.

## Rules

- Never hardcode a halal status in code. Status comes only from `app/public/data/ingredients.json` and is shown with its source text and URL.
- Never write new halal guidance, rulings, or religious text in the UI.
- Keep the footer: "Demo built from IFANCA's public content. Not an official IFANCA app."
- Mobile first. Tap targets at least 44px. Text readable at 390px.
- UI text follows the project writing style: US English, no em dashes, no semicolons, no contractions.

## Finish

Report the commits made and which acceptance criteria are now covered. Suggest running the test-feature skill.
