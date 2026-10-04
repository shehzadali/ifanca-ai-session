# Process log

## Stage 1: Crawl and inventory (2026-10-03 to 2026-10-04)

**Driving instruction:** CLAUDE.md's Stage 1 scope ("crawl and inventory only"), plus the user's two-part request: (1) check robots.txt and `/wp-json/` and report how the certified products and companies lists load, (2) propose a crawl plan before writing anything, then build it after approval.

This section is written as repeatable steps so the same approach can be pointed at a different organization's WordPress site.

### Step 1: Reconnaissance before writing any code

1. Fetch `/robots.txt`. Note every `Disallow`/`Allow` rule and every `Sitemap:` line, but don't trust robots.txt's sitemap list as complete, fetch the real `/sitemap_index.xml` too and diff it (this site's robots.txt omitted several sitemaps the real index had, including 9 of 12 products sitemap shards and the real companies sitemap).
2. Fetch `/wp-json/` and read its `namespaces` and `routes`. Then specifically call `/wp-json/wp/v2/taxonomies` to see which taxonomies actually have a `rest_base` (most WordPress sites disable REST for custom post types and taxonomies by default, you cannot assume `wp/v2/<your-custom-type>` exists just because the type exists).
3. For any listing page (here: certified products, certified companies), fetch the rendered HTML and check whether the actual list items are present in the static markup. If the count of real content links is near zero despite a large page size, the list is client-rendered. Search the HTML for a `<form id="...">` with hidden `action`/pagination inputs, and search the main JS bundle for `FormData`, `admin-ajax.php`, and `action":"` patterns to find the real AJAX contract (endpoint, action name, field names, whether a nonce is required). Test that endpoint directly with curl/requests before writing a scraper against the rendered page.
4. Don't assume one listing page is the only source of truth for an entity. Check the sitemap index for multiple post types/taxonomies that sound related (here: a `companies` post type, a `product_companies` taxonomy, and a static informational page all used the word "companies" and disagreed with each other) and verify each one's actual template/content before deciding which is canonical.

### Step 2: Problem hit — chosen crawler identity was itself blocked

Python's `urllib.robotparser` matches user-agent tokens by substring (`if agent in useragent`, both lowercased), not whole-word. A naive crawler name can accidentally contain a short token from a site's bot blocklist and get treated as that blocked bot. Caught this by writing `check_robots.py` to assert every target path is allowed *before* crawling, which failed everything. Root cause: the name `IFANCA-AI-Session-Crawler` contains "Session", which contains the two-letter blocklisted token `es`. Fix: extract every `User-agent:` token from the live robots.txt, then pick a crawler name verified to contain none of them as a substring, before settling on a final User-Agent string. Repeatable step for any new site: always do this substring check programmatically against that site's actual robots.txt, don't assume a sensible-sounding name is safe.

### Step 3: Build order

Built one script per content source under `crawl/`, all sharing `fetcher.py` (1 req/sec throttle, disk cache under `data/raw/`, so reruns never refetch):

1. `check_robots.py` — gate, confirms every target path is allowed.
2. `sitemaps.py` — reads the full sitemap index once, used by every other script as the URL source of truth instead of re-deriving URLs.
3. `wp_api.py` + `pages_core.py` — REST for Pages/Posts. **Problem hit:** REST's `content.rendered` was empty for 17 of 19 core Pages (this theme builds page bodies with an ACF flexible-content page builder, not the standard block editor, so REST's content field is blank even though the page clearly has content on the live site). Posts (news) were unaffected, standard editor content came through fine. Fix: use REST for title/dates/slug (authoritative), fall back to an HTML fetch + extraction for body text whenever `content.rendered` is blank. Repeatable step: never assume REST content is populated just because the endpoint responds, check a sample for actual length first.
4. `products.py` — calls the `filter_products` admin-ajax action directly (971 pages x 12 products, confirmed the page size is hardcoded and ignores `per_page` overrides) instead of scraping the Vue-rendered listing.
5. `resources.py`, `magazines.py`, `companies.py`, `faqs.py` — custom post types with no REST exposure, sitemap gives the URL list, each page is fetched once and run through a shared `page_extract.py` (title, Yoast/schema.org dates, word count, any PDF link in the body).
6. **Problem hit, magazines:** the issue pages' static HTML has no PDF link at all, the real link is injected client-side by a second nonce-protected admin-ajax flow (`get_all_magazine` by year to map issue title -> post ID, then `get_magazine_info` with that ID and a nonce scraped from the magazine hub page's inline script). Reproduced that two-call flow directly rather than leaving `pdf_url` blank. Repeatable step: if a value is visibly missing from the first scrape despite being visible in the browser, assume it is injected by a further AJAX call and look for the handler, don't just record it as unavailable.
7. **Problem hit, FAQ API:** the theme exposes a clean `GET /wp-json/sage-endpoint/v1/faq` JSON endpoint, but its `posts` dict keys are positional indices (`0`-`9`) reused on every page, not stable IDs, and merging pages by dict key silently drops all but the last page's worth of entries. Also, entries carry no URL of their own. Decision: scraped the 26 individual FAQ sitemap URLs directly instead (same pattern as resources), trading the convenience of a clean API for a guaranteed-correct source URL on every record, per the ground rule that every record must point to a source URL.
8. `build_inventory.py` — merges all of the above into `data/inventory.csv`.

### Decisions made (checked with the user mid-task)

- **Products:** crawl the full catalog (11,642 products, 971 AJAX pages) rather than capping a sample, since the AJAX approach made the full count mechanical rather than expensive. Confirmed count matches both the AJAX `total_posts` field and the 12-shard product sitemap total.
- **Companies:** keep the three disagreeing surfaces distinct rather than merging into one roster: 464 real Company profile pages (`company_profile`) and 149 `product_companies` taxonomy terms (`product_filter_taxonomy`), each tagged by `source` in `companies.csv`. The third surface, `/certified-companies/`, is a static informational page with no live directory behind it, recorded as a `listing`-type page in `data/pages/`, not as a company record. This mismatch between three "companies" surfaces is itself a candidate finding for the Stage 2 gap analysis, not just a crawl footnote.
- `companies.csv` has a `product_count` column left intentionally empty. Getting a real per-company product count would mean one more `filter_products` AJAX call per term (149 more requests) and the exact filter parameter name/format was not verified. Left as a known gap rather than guessed.

### Problem hit: the crawl machine went to sleep mid-run

The `companies.py` run was interrupted when the laptop was put to sleep, it resumed cleanly for a while after wake (the OS let the already-open connection continue) then crashed on a `ReadTimeout` on request ~101 once a connection genuinely went stale. Because every fetch is cached to disk before the next one starts, rerunning the exact same script after a crash cost nothing: it skipped everything already cached and only fetched the remainder. Added a 3-attempt retry with backoff to `fetcher.py` afterward so a single transient timeout does not kill a long-running crawl again.

### Final counts, by source dataset and page/content type

| source_dataset | page_type | count |
|---|---|---|
| pages | core page | 10 |
| pages | legal | 2 |
| pages | listing | 7 |
| pages | news | 172 |
| pages | faq | 26 |
| pages | resource | 1,115 |
| products | product | 11,642 |
| companies | listing (464 profiles + 149 taxonomy terms) | 613 |
| magazine | resource (issue) | 75 |
| **Total rows in data/inventory.csv** | | **13,662** |

### What was not fetched, and why

- **Events (4 URLs), Certificates (0 URLs), Teams (2 URLs), Programs (4 URLs):** sitemap-confirmed but not crawled into their own dataset. Certificates has zero live entries (the `filter_certificates` AJAX/form exists in the theme JS but the content type is unused). The other three are thin enough (2-4 URLs) that they read as stale or vestigial rather than active content, flagged here rather than built into a dataset no one asked for.
- **Taxonomy/filter-facet sitemaps** (product_categories, product_marketplaces, product_countries, company_categories, company_countries, resource_topics, resource_types, event_types, team_positions, program_type, category, post_tag, author): these are filter dimensions, not standalone content pages. Product-side facets are already captured inline in `products.csv` (`category`, `marketplace`, `sold_in` columns). Company-side facets (`company_categories`, `company_countries`) were not extracted per company profile, a possible Stage 2 enrichment if the gap analysis needs it.
- **The `/companies/` CPT archive index page itself:** confirmed to render only a single link (broken/unfinished template), not crawled as content, noted here as a candidate Stage 2 finding rather than a dataset row.
- **Magazine PDFs:** URLs recorded for all 75 issues, files themselves not downloaded, per the ground rule.

### Reusable takeaways for pointing this at a different organization's site

1. Always verify your own crawler's User-Agent against robots.txt's actual token list programmatically, don't trust a sensible-sounding name.
2. Treat every "list page" as possibly client-rendered. Check real link counts in static HTML before writing a scraper, and look for the admin-ajax/REST contract behind it, it is usually cheaper and more complete than scraping rendered pages.
3. Don't assume `content.rendered` via REST is populated. Spot check length first, page-builder themes often leave it blank.
4. When a value seems to be missing from a page, check whether it's injected by a second API call before recording it as unavailable.
5. Cache every raw response before processing it, so an interrupted long crawl (sleep, network blip, crash) costs minutes to resume, not hours to redo.
6. When one entity (e.g. "companies") seems to have multiple surfaces on a site, check whether they actually agree before picking one as canonical, the disagreement itself can be a useful finding.

## Stage 1b: Visitor reachability map (2026-10-04)

**Driving instruction:** Before Stage 2, narrow scope to what a website visitor can browse. Start at the homepage, follow every clickable link (menu, footer, in-page links, buttons), include content loaded through search, filters, or pagination, stay on ifanca.org, and exclude content found only through sitemaps, REST, or theme code. Use the cache. Fetch only reachable pages that are not cached.

Script: `crawl/reachability.py`. Outputs: `data/visitor-inventory.csv`, `data/unreachable.csv`, `data/dead-paths.csv`, `data/resources-breakdown.csv`, `data/resources-listing.csv`, `data/resources-consumer-education.csv`.

### Steps another person can repeat

1. Check what is already cached. Here the homepage itself and the HTML sitemap page (`/sitemap/`) were not cached, because Stage 1 took URLs from XML sitemaps. Fetch those first.
2. Read the header and footer once. They repeat on every page. Note that menus can use single-quoted `href` attributes, so use an HTML parser, not a regex.
3. For each listing page, find how its items load. Look for an inline config object (here `var ARCHIVE = {...}` with an `apiUrl`), a `<form>` with a hidden `action` field (admin-ajax), and the item template (`<script type="text/html" id="tmpl-...">`). Read the template to see whether items link anywhere. Replay the same request the page makes and walk every page of results.
4. Check the filter value format in the JS before replaying filters. Here the resource filters submit the option text ("Recipe"), not the option `value` attribute (362). Sending the ID returned zero results with no error.
5. Test the site search. Open the header search with an empty query and read the result count. Then run a few probe queries, one per content type, to see which types search exposes.
6. Run a breadth-first walk from the homepage over cached HTML. Label each first-found link by region (header = menu, footer = footer, else in-page link). Add listing items as children of their listing page (pagination or filter). Add search last, so content with a browse path keeps its browse label.
7. Record any reachable link that fails to load as a dead link, and cache the failure so reruns do not request it again.
8. Compare the reached set with the sitemap URLs. Anything left over is either "site search only" or "none".

### Decisions

- **Search counts as a visitor path**, per the scope rule in CLAUDE.md. An empty header search lists 13,520 results. That matches the sum of all public post types in the sitemaps (11,642 products, 464 companies, 1,115 resources, 172 news, 75 magazine issues, 26 FAQs, 18 pages, plus a few events, programs, and team). Probe queries confirmed each type appears. So company profiles and product detail pages are labeled "site search only" in `unreachable.csv`, not "none". They have no browse path. This differs from the expectation that the 464 company profiles are unreachable. The distinction matters for the gap analysis.
- Products, resources, news, FAQs, and the magazine are recorded once each as listing pages with an item count. No row per item.
- Click depth counts link clicks only. Filter, pagination, and picker interactions inside a listing are not counted as clicks.
- `unreachable.csv` adds a `visitor_path` column (`site search only` or `none`) so the two cases stay distinct.
- The 10 consumer education titles were picked by title only, as candidates. Bodies were not reviewed. No halal guidance was added.

### Problems hit

- First run crashed on a 404 from a magazine issue link (`/resources/a-special-focus-on-womens-health-2/`). Fixed by catching fetch failures, logging them as dead paths, and caching them in `data/raw/_failed_urls.json`.
- First resource filter walk returned 0 for every type and topic (wrong value format, see step 4). Deleted those cached responses and reran with option text.
- Nine in-page links pointed to old resource slugs not in the listing (for example `e-numbers-for-food-additives-in-the-europe`). They load, so they are not dead, but they are duplicates or redirects of listed items. They are not counted as extra resources.
- `/author/` is linked from the `/programs/` archive with an empty link. WordPress guesses a redirect and loads an unrelated news post. Recorded as a broken archive path.

### Results

| Measure | Count |
|---|---|
| Browse-reachable page rows in visitor-inventory.csv | 27 (plus 1 search row) |
| Items reachable through listings | 11,642 products, 1,115 resources, 172 news, 75 magazine issues, 26 FAQs, 3 events, 3 programs |
| Site search results | 13,520 |
| Dead or broken paths | 9 |
| New live requests this stage | 259 (homepage, /sitemap/, 2 theme JS files, 8 search pages, listing walks, 17 uncached reachable pages). See `data/raw/_fetch_log.csv`. |

## Stage 2: Claims and coverage (2026-10-04)

**Driving instruction:** Work from the visitor inventory, the unreachable list, and the cached pages. Do not crawl. Classify the resources into themes, review the 10 consumer education picks, extract claims from the homepage, About, and Beyond Certification, score each claim against what a visitor can browse, walk three journeys, and write a ranked gap report.

Scripts: `crawl/themes.py`, `crawl/claims.py`. Outputs: `data/resources-themes.csv`, `data/resources-consumer-education.csv` (updated), `analysis/claims.json`, `analysis/coverage.csv`, `analysis/journeys.md`, `analysis/gaps.md`. No live requests were made.

### Steps another person can repeat

1. **Theme the content library with transparent rules, not a black box.** Use the listing's own type first (here every Recipe is a recipe). Then match keywords in the title. Only then fall back to the opening text, with a short list of strong keywords. Record the matched keyword and where it matched on every row, so any label can be checked.
2. **Audit the rules on a random sample before trusting the counts.** Draw 40 rows, read them, and adjust. Here the first pass let generic words in body text (flavor, industry, health) decide themes. Magazine editorials matched whatever they mentioned in passing. Fixes: editorials and puzzles are themed by title only, generic words are ignored in body text, and the body pass checks themes in a fixed order.
3. **Read the full article before calling it consumer education.** Picks made from titles need a check. Here 1 of 10 was wrong (an industry supply chain story). It was replaced and the reason was recorded. Manual corrections go into an override table in the script, so reruns keep them.
4. **Extract claims verbatim and check them by script.** Copy each claim as an exact substring of the page text. The script fails if any claim is not found word for word. One claim failed: the About page repeats the homepage Crescent-M line with different wording and case, so it became its own claim instead of a duplicate.
5. **Score claims with written definitions.** strong: a visitor can browse to current content that directly backs it. weak: support is partial, dated, buried, broken, or contradicted. none: nothing backs it. hidden: backing content exists only through search or with no path. Give one reason and the supporting URLs for every score.
6. **Walk journeys as a specific person with a specific goal.** Record every step, where it happens, and whether it works. Note what was not tested (here, live search results and form submission).
7. **Rank gaps by mission impact and keep two lists.** Content that is missing, and content that exists but cannot be found. Tie every gap to claim IDs and URLs.

### Decisions

- A claim may carry more than one pillar when the page states it that way (for example the mission sentence). Per-pillar tallies count such a claim once in each pillar.
- Claims repeated word for word on other pages are recorded once, with an `also_found_on` list.
- Menu labels and button text were included as claims only when they make a promise on the page body (Explore Halal Certified Products, Explore Programs, Programs & Partnerships).
- No claim scored hidden. Search-only content exists, but company profiles hold only a name, FAQ and magazine content also shows on browsable pages, and product detail pages were never fetched. Scoring them as backing a claim would go beyond the evidence.
- Halal rulings were recorded as IFANCA states them. No religious explanation was written. The missing children's explainer is recorded as a gap for IFANCA.

### Problems hit

- The theme rules needed three passes. The first put 140 items in other and mislabeled many from body text. The second over-corrected and put 401 items in other. The final version has 318 in other: 144 magazine editorials, publisher notes, and puzzles, plus 174 articles (mostly single-food features such as honey or harissa, and fitness pieces). These are recorded as other rather than forced into a theme.
- In a 40-row audit of the second pass, about 2 labels were wrong and about 6 articles were left in other that belong in health and nutrition. Treat theme counts as approximate, plus or minus a few percent per theme.
- The resources and certification pages give three different counts of halal consumers (1.57, 1.8, and 1.9 billion). This was recorded as a finding, not corrected.

### Results

| Measure | Count |
|---|---|
| Claims | 42 (9 strong, 31 weak, 2 none, 0 hidden) |
| Resource themes | recipes 352, other 318, health and nutrition 224, community and events 78, industry and certification 69, ingredients 48, halal basics 26 |
| Consumer education picks | 9 confirmed, 1 corrected and replaced |
| Journeys | 3 walked, all fail at one or more steps |
