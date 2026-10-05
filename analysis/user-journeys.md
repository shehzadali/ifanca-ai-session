# User journeys

A user journey is one real person trying to get one thing done, step by step. We walked three journeys on ifanca.org and noted, at each step, where a new digital experience could help. Those opportunities became the app's features.

The full step-by-step walks, with evidence for every step, are in `analysis/journeys.md`.

## Three journeys

**1. A consumer in a grocery store, on a phone**
- Wants to know: "Is this product halal certified?"
- Today: the consumer can find the product name in IFANCA's list.
- Opportunity: product search that fits in a pocket, a clear message when a product is not on the list, and IFANCA's guidance on the ingredients on the label.

**2. A parent**
- Wants to know: "Help me explain halal to my child."
- Today: IFANCA's FAQ answers explain the basics, written for adults.
- Opportunity: a simple starting point, "What is halal?", and a fun way for a family to learn.

**3. A food company**
- Wants to know: "Should we get certified with IFANCA?"
- Today: the certification process, fees, and recognitions are online.
- Opportunity: a future experience for businesses, with timelines, peer companies, and the training IFANCA offers. Not part of this consumer app.

## From journey to app feature

- **"Is this product on IFANCA's list?"** (Journey 1): Check, Products tab. Spec: `specs/product-check/`
- **"What does IFANCA say about the ingredients on this label?"** (Journey 1): Check, Ingredients tab, with a photo of the label. Spec: `specs/ingredient-check/`
- **"Start me at the beginning: what is halal?"** (Journey 2): Learn and Quiz. Spec: `specs/learn-halal/`
- **"One thing to learn today"** (Journey 2): Did You Know card on Home. Spec: `specs/daily-fact/`
- **"Make learning fun in a group"** (the session itself): Room Leaderboard. Spec: `specs/room-leaderboard/`
- **"What can I cook, and what do I buy?"** (IFANCA's recipe library): Recipes, Meal Plan, Shopping List. Specs: `specs/cook/`, `specs/shopping-list/`
- **"Let me read IFANCA's articles easily"** (IFANCA's article library): Read, with articles inside the app. Specs: `specs/read/`, `specs/article-reader/`
- **"Send this to my family"** (all of the above): Share button. Spec: `specs/share/`

Changes made after the owner's reviews have their own specs: `specs/app-redesign/`, `specs/feedback-2/`, `specs/feedback-3/`.

## The journey to show in the session

**Journey 1, the consumer in the grocery store.** It is the easiest to picture, and it touches two features: product search and the ingredient check. Its spec, plan, and test report are in `specs/product-check/`.
