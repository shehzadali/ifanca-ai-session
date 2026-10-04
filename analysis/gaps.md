# Gaps between IFANCA's claims and the visitor experience

Crawl date: 2026-10-04. Sources: `analysis/claims.json` (42 claims from the homepage, About, and Beyond Certification pages), `analysis/coverage.csv`, `analysis/journeys.md`, `data/visitor-inventory.csv`, `data/unreachable.csv`, `data/dead-paths.csv`, and `data/resources-themes.csv`.

Gaps are ranked by impact on the mission: promote halal through certification, education, and institutions. Impact weighs how central the claim is, how many visitors it touches, and whether the visitor can work around it.

## Coverage at a glance

| Score | Claims |
|---|---|
| strong | 9 |
| weak | 31 |
| none | 2 |
| hidden | 0 |

No claim scored hidden. Search-only content does exist (11,642 product pages, 464 company profiles, 75 magazine issue pages, 26 single FAQ pages, 1 team profile). But the company profiles contain only a name, the FAQ and magazine content also shows on browsable pages, and the product pages were not fetched, so none of it can be shown to back a claim.

| Pillar | Claims | strong | weak | none |
|---|---|---|---|---|
| certification | 26 | 7 | 18 | 1 |
| education | 15 | 1 | 13 | 1 |
| institutions | 14 | 1 | 13 | 0 |

A claim can belong to more than one pillar.

## Top 5 gaps

| Rank | Gap | Kind | Claims |
|---|---|---|---|
| 1 | A consumer cannot verify that a product or company is certified | Missing | C03, C19, C30, C42 |
| 2 | No starting point to learn what halal means, and nothing for families or children | Missing | C23, C31 |
| 3 | The institutions pillar is hidden behind the footer Sitemap page, and the homepage Programs button is dead | Cannot find | C14, C15, C17, C38, C40 |
| 4 | The Certified Companies page lists only 471 companies in China | Missing | C10, C30 |
| 5 | Consumer education is not connected to the product list and is buried in an unsorted library | Cannot find | C23, C29, C31 |

## Part 1: Content that is missing

### 1. No way to verify certification (highest impact)

The Crescent-M promise is the center of the homepage and About page: "our trademark Crescent-M logo means one thing: “This is halal.”" and "assures consumers the product is halal without a doubt!"

Evidence:
- Product cards show name, company, category, "Sold in", and marketplace. No certificate, date, or logo. https://ifanca.org/halal-certified-products/
- The theme has a certificate lookup template ("View Certificate PDF", "De-certified"), but the certificates content type has 0 entries (Stage 1).
- No page shows the mark or explains how to spot a fake. The news post "Fraudulent Halal Certificates Discovered" is not linked from the product list.
- A product that is missing from the list gets no explanation.

### 2. No beginner or family path to halal

Claims: "We are a resource to everyone looking to learn about halal." and "We invite everyone to learn about halal".

Evidence:
- About 26 of 1,115 resources are halal basics by theme count (`data/resources-themes.csv`). Most date from 1998 to 2012.
- The only short explainer is the FAQ answer "What is halal?" (251 words, written for adults). https://ifanca.org/faqs/
- Titles that mention kids or children cover cooking and nutrition, not what halal means.
- The homepage has no "What is halal?" entry. "Explore Halal" opens the full library.

This project does not write religious explanations. The gap is recorded for IFANCA to fill.

### 3. Incomplete certified company directory

Evidence:
- https://ifanca.org/certified-companies/ is a static table of 471 rows. Every company is in China.
- The 149 companies behind the product list (for example Abbott, General Mills, NSE Products) are not on it. The two lists share no names.
- The 464 company profiles hold only a name and are reachable only by search.

A shopper or a prospective client reads this page as the full client list.

### 4. Missing information for companies considering certification

Claims: "Our process is simple, cost effective and efficient, and easily implemented.", "Halal education & training for our client partners", "assist R&D teams with scientific and religious guidance".

Evidence:
- No timeline anywhere on the site.
- Fee ranges exist only inside an FAQ answer, not on the process page.
- No page describes training or R&D support. Only 2012 news items mention talks and a workshop. https://ifanca.org/news/

### 5. Numbers and dates disagree across pages

Evidence:
- Halal consumers: "over 1.8 billion" (https://ifanca.org/about/), "over 1.9 billion" (https://ifanca.org/certification-process/), "approximately 1.57 billion" (Halal Explained, a 2025 resource).
- Founding: the homepage and About say "Since 1982". The "25th Year Anniversary" resource and a President's Message say founded in 1980 and registered in 1982.

### 6. Thin institutions content

Claims: partnerships for food and health security, empowering institutions, university sponsorships and grants, programs and events.

Evidence:
- Three program pages (Texas A&M, ACLU Illinois, UNICEF) of 31 to 89 words.
- No grants or sponsorship page. Scholarships and UNICEF appear only as news posts.
- https://ifanca.org/events/ shows only placeholder items with lorem ipsum text.
- https://ifanca.org/team/ lists one person, though the About page refers to "Our leaders and experts".

### 7. Magazine cadence

Claim: "producing a quarterly Halal Consumer magazine".

Evidence: the magazine picker lists 2 issues for 2025 (Spring 2025, dated September, and Winter 2025) and 2 for 2026 so far. https://ifanca.org/halal-consumer-magazine/

### 8. No list of outside articles or research

Claims: "writing articles for various publications around the world" and "contributing to research papers and findings". No page lists either. The closest content is the 2003 conference proceedings in the resources library and a 2006 news item on a research center.

## Part 2: Content that exists but visitors cannot find

### 1. Institutions work sits behind the footer Sitemap page

Evidence:
- Beyond Certification, Team, and Events are not in the header menu. The only click path is footer, then Sitemap, then the page (click depth 2).
- The homepage "Explore Programs" button links to "#".
- Program pages are at click depth 3. The program archive https://ifanca.org/programs/ shows 1 of 3 programs.

The vision paragraph appears on three pages, but the work behind it is the hardest content on the site to reach.

### 2. Consumer education is buried and not connected to products

Evidence:
- The best shopper material (Halal Shopper's Guide to Ingredients, 2011, the Quick Reference Guide, 2012, and E-Numbers, 2009) sits in a 93-page list sorted by date.
- The topic filter has 2 topics. 979 of 1,115 resources have no topic.
- The product list does not link to any of it.

### 3. Product and company detail pages are search only

Evidence:
- 11,642 product pages. Cards do not link to them. They appear only in site search results.
- 464 company profiles appear only in site search and hold only a name.
- An empty site search lists 13,520 results, mostly these pages, which crowds out articles and FAQs.

### 4. Homepage category tiles do not filter

All five tiles (Beverages, Cosmetics & Personal Care, Food, Nutritional & Dietary Supplements, Pharmaceuticals) open the unfiltered product list.

### 5. Single FAQ and magazine issue pages are search only

Low impact. The same content shows on the FAQ page and through the magazine picker. These pages cannot be reached by browsing.

## Dead and broken paths (from Stage 1)

| Source | Link | Problem |
|---|---|---|
| https://ifanca.org/ | Explore Programs | Links to "#", goes nowhere |
| https://ifanca.org/ | Five product category tiles | Open the unfiltered product list |
| https://ifanca.org/halal-consumer-magazine/ | Article link in an issue | /resources/a-special-focus-on-womens-health-2/ returns 404 |
| https://ifanca.org/events/ | Event 1, Event 2, Event 4 | Placeholder items with lorem ipsum text |
| https://ifanca.org/team/ | (page) | One person and a stray semicolon |
| https://ifanca.org/programs/ | Empty link | Loads an unrelated news post (Authors Wanted) |
| Program pages | Back to All | Archive shows 1 of 3 programs |
| https://ifanca.org/companies/ | (archive) | Renders a single link, no directory |
| https://ifanca.org/halal-certified-products/ | Product cards | 11,642 cards with no link to a product page |
