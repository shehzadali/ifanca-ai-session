# User journeys

A user journey is one real person trying to get one thing done, step by step. We walked three journeys on ifanca.org, saw where each one breaks, and turned the breaks into app features.

The full step-by-step walks, with evidence for every step, are in `analysis/journeys.md`.

## Part 1: Three journeys on ifanca.org

| # | Who | What they want | Steps | Where it breaks |
|---|---|---|---|---|
| 1 | A shopper in a grocery store, on a phone | "Is this product halal certified?" | 8 | Can find a product name, but cannot see proof, cannot spot a fake mark, and gets no explanation when a product is missing. |
| 2 | A parent | "Help me explain halal to my child." | 5 | No "What is halal?" starting point. Nothing written for families or children. |
| 3 | A food company | "Should we get certified with IFANCA?" | 9 | No timeline, no list of peer companies, no page on the training and support IFANCA promises. |

Result key used in the walks: **OK** works, **Partial** works with a gap, **Fail** the visitor cannot finish the step.

## Part 2: From journey to app feature

| Visitor need | From | App feature | Spec folder |
|---|---|---|---|
| "Is this product on IFANCA's list?" | Journey 1, steps 2 to 7 | Check, Products tab | `specs/product-check/` |
| "What does IFANCA say about the ingredients on this label?" | Journey 1, step 8 | Check, Ingredients tab, with a photo of the label | `specs/ingredient-check/` |
| "Start me at the beginning: what is halal?" | Journey 2 | Learn and Quiz | `specs/learn-halal/` |
| "One thing to learn today" | Journey 2 | Did You Know card on Home | `specs/daily-fact/` |
| "Make learning fun in a group" | Session goal | Room Leaderboard | `specs/room-leaderboard/` |
| "What can I cook, and what do I buy?" | IFANCA's recipe library is hard to browse | Recipes, Meal Plan, Shopping List | `specs/cook/`, `specs/shopping-list/` |
| "Let me read IFANCA's articles easily" | IFANCA's article library is hard to browse | Read, with articles inside the app | `specs/read/`, `specs/article-reader/` |
| "Send this to my family" | All of the above | Share button | `specs/share/` |

Journey 3 (companies) was not built into the app. The app is for consumers. The company gaps stay in `analysis/gaps.md` for IFANCA.

Changes made after the owner's reviews have their own specs: `specs/app-redesign/`, `specs/feedback-2/`, `specs/feedback-3/`.

## Part 3: The journey to show in the session

**Journey 1, the shopper.** It is the easiest to picture, and it touches two features.

1. `analysis/journeys.md`: read Journey 1. Point at steps 5 to 7, marked Fail.
2. `specs/product-check/spec.md`: the visitor's goal, the screen, and the numbered checks the feature must pass.
3. `specs/product-check/plan.md`: the small steps to build it, ticked off one by one.
4. `specs/product-check/test-report.md` and its screenshots: the robot tester's results, including the problem it caught on the first run.
5. Then open the app on a phone and search for a product.

For a "wow" moment, show `specs/ingredient-check/` next: the same journey, step 8, where the app reads an ingredient label from a photo.
