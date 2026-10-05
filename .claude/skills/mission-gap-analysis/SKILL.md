---
name: mission-gap-analysis
description: Compare what an organization promises on its website with what a visitor can actually find, then walk user journeys and rank the gaps. Use after site-crawl, before designing any product. Written from the Stage 2 process log of the IFANCA project so the method can be reused on another site.
---

# Mission and gap analysis

Turn a crawled website into three things: what the organization promises, how well the website keeps each promise, and where real visitors get stuck. Do not crawl again. Work only from the saved copy.

## Rules

- Quote, do not paraphrase. Every promise is copied word for word, and a script checks it against the page.
- Every rating has one written reason and the links that support it.
- Do not add opinions about the organization's field. Record what it says.

## Steps

1. **Collect the promises.** Read the homepage, About, and any mission or program pages. Copy every promise as an exact quote with its page. Save to `analysis/claims.json`.
2. **Sort by pillar.** Use the pillars the organization names in its own mission statement. A promise can belong to more than one.
3. **Rate each promise** against what a visitor can browse:
   - strong: current content backs it and is easy to reach,
   - weak: partial, old, buried, broken, or contradicted,
   - none: nothing backs it,
   - hidden: backing content exists but only through search or no path.
   Save to `analysis/coverage.csv` with the reason and supporting links.
4. **Theme the content library** with simple, visible rules (the site's own type first, then title keywords, then opening text). Check 40 random rows by hand and fix the rules.
5. **Walk three user journeys** as specific people with specific goals. Record every step: what they do, where, and whether it works (OK, Partial, Fail), with evidence. Save to `analysis/journeys.md`.
6. **Rank the gaps** by how much they hurt the mission. Keep two lists: content that is missing, and content that exists but cannot be found. Save to `analysis/gaps.md`.
7. **Make it easy to present.** Write a one-page mission summary (`analysis/mission.md`), a journey list (`analysis/user-journeys.md`), and a picture of the ratings (`viz/gap-map.html`, built by `crawl/build_gap_map.py`).
8. Add the stage to `notes/process-log.md`.

## What it found for IFANCA

42 promises: 9 strong, 31 weak, 2 none. Certification is easy to find. Education and institutions are mostly promised but hard to find. All three journeys broke at one or more steps.

## Writing style

US English. No em dashes, no semicolons, no contractions. Short sentences.
