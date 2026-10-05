---
name: site-crawl
description: Politely crawl an organization's public website into a cached, source-linked content inventory. Use when starting a project from someone's website, before any analysis. Written from the Stage 1 process log of the IFANCA project so the method can be reused on another site.
---

# Site crawl

Collect what a website says, politely, and keep a copy of everything with its source link. Do not analyze yet.

## Rules

- Public pages only. No logins, no forms.
- Read `robots.txt` first and obey it. Check that your crawler's name does not accidentally contain a blocked name (a check, not a guess).
- One request per second. A User-Agent that names the project and a contact email.
- Save every response to `data/raw/` before using it. A rerun reads the saved copy and never asks the site twice.
- Every record keeps its source URL and the date it was copied.

## Steps

1. **Look before you build.**
   - Read `robots.txt` and the real sitemap index. Compare them, because robots.txt often lists only some sitemaps.
   - If the site is WordPress, read `/wp-json/` to see which content types it shares as clean data.
   - For each list page (products, companies), check whether the items are in the page itself or loaded later by the browser. If they load later, find the request the page makes and use that instead of scraping the screen.
2. **Propose a crawl plan and get approval.** List the content types, where each comes from, how many pages, and how long it will take at one request per second.
3. **Build one small script per content type**, all sharing one polite fetcher with the cache.
4. **Merge everything into one inventory**: one row per page or item, with type, audience, dates, word count, and source URL.
5. **Map what a visitor can actually reach.** Start at the homepage and follow every link, menu, filter, search, and page of results. Anything found only through sitemaps or code is recorded as unreachable, not as content.
6. **Write the process log** as steps another person could repeat.

## Outputs

- `data/raw/`: the saved copies.
- `data/pages/`: one Markdown file per page.
- `data/inventory.csv`: everything, one row each.
- `data/visitor-inventory.csv`, `data/unreachable.csv`, `data/dead-paths.csv`: what a visitor can and cannot reach.
- `notes/process-log.md`: what was done, decisions, and problems hit.

## Lessons from the IFANCA crawl

- A list page that looks full may be empty underneath, filled in later by the browser. Find the real data source.
- A clean data feed can still be missing the page text. Check a sample before trusting it.
- When something visible is missing from the copy, it is often loaded by a second request. Look for it before calling it unavailable.
- When one thing (like "companies") appears in several places that disagree, record the disagreement. It is a finding.

## Writing style

US English. No em dashes, no semicolons, no contractions. Short sentences.
