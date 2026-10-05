---
name: mission-opportunities
description: Read an organization's mission in its own words, see which parts a visitor can easily reach online today, walk user journeys, and turn what is not online yet into opportunities for a new digital experience. Use after site-crawl, before designing any product. Written from the Stage 2 process log of the IFANCA project so the method can be reused on another site.
---

# Mission opportunities

Turn a crawled website into three things: what the organization sets out to do, what a visitor can easily reach online today, and the opportunities for a new digital experience. Do not crawl again. Work only from the saved copy.

## Rules

- Quote, do not paraphrase. Every promise is copied word for word, and a script checks it against the page.
- Every rating has one written note and the links that support it.
- Do not add opinions about the organization's field. Record what it says.
- Frame findings as opportunities. The goal is to see where a new experience can help, not to grade the organization.

## Steps

1. **Collect the mission in its own words.** Read the homepage, About, and any mission or program pages. Copy every promise as an exact quote with its page. Save to `analysis/claims.json`.
2. **Sort by pillar.** Use the pillars the organization names in its own mission statement. A promise can belong to more than one.
3. **See what is online today** for each promise, from what a visitor can browse:
   - online and easy to find (strong),
   - online, with room to grow (weak): partial, older, or hard to reach,
   - new opportunity (none): nothing online yet,
   - search only (hidden): online, but reachable only through search.
   Save to `analysis/coverage.csv` with a note and supporting links.
4. **Describe the content library** with simple, visible rules (the site's own type first, then title keywords, then opening text). Check 40 random rows by hand and fix the rules.
5. **Walk three user journeys** as specific people with specific goals. Record every step: what they do, where, and how it goes (OK, Partial, Fail), with evidence. Save to `analysis/journeys.md`.
6. **List the opportunities** by how much they would help the mission. Keep two lists: content to create, and content that exists but could be easier to find. Save to `analysis/gaps.md`.
7. **Make it easy to present.** Write a one-page mission summary (`analysis/mission.md`), a journey list (`analysis/user-journeys.md`), and a picture (`viz/opportunity-map.html`, built by `crawl/build_opportunity_map.py`).
8. Add the stage to `notes/process-log.md`.

## What it found for IFANCA

42 promises: 9 online and easy to find, 31 online with room to grow, 2 new opportunities. Certification is the strongest pillar online. Education and institutions have the most room to grow, which is where a new consumer experience can add the most.

## Writing style

US English. No em dashes, no semicolons, no contractions. Short sentences.
