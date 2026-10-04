# IFANCA AI Session: Content Crawl and Gap Analysis

## Purpose

Prepare material for a 90-minute AI session for about 10 IFANCA staff (Chicago, halal certification body, not AI proficient).
This project crawls the public ifanca.org website, builds a content inventory, and compares the digital experience against the claims on the About page.
The output feeds two things: a gap visualization shown in the session, and a mobile web app built later from the same corpus.

## Ground rules

- Crawl only public pages on ifanca.org. Do not touch halalportal.org (client login) or any form.
- Check https://ifanca.org/robots.txt first and respect it.
- Rate limit to 1 request per second. Use a descriptive User-Agent that includes a contact email placeholder.
- Cache every raw response in data/raw/ so nothing is fetched twice. Re-runs must read from cache.
- Never invent content. Every claim, page summary, and coverage score must point to a source URL.
- Halal rulings and religious explanations are out of scope for generation in this project. Record what IFANCA says, do not add to it.
- Product and company lists are a dated snapshot for demo use only. Record the crawl date on every dataset.
- Scope is what a website visitor can reach by clicking from the homepage, including content loaded through search, filters, or pagination. Content found only through sitemaps, REST, or theme code is recorded as unreachable, not treated as app content.

## Crawl strategy

1. Try the WordPress REST API first (/wp-json/wp/v2/pages, /posts, and any custom post types listed at /wp-json/). It returns clean content and metadata.
2. Then check XML sitemaps (/wp-sitemap.xml, /sitemap_index.xml, /sitemap.xml).
3. Fall back to the HTML sitemap at /sitemap/ and link discovery within the ifanca.org domain.
4. For the certified products and certified companies pages, inspect how the list loads (static HTML, AJAX, or an API call) before scraping. Prefer the underlying JSON if one exists.
5. For the magazine, record issue titles, dates, and PDF URLs. Do not download PDFs unless asked.

## Folder structure

```
crawl/            scripts (Python, requirements.txt)
data/raw/         cached raw responses
data/pages/       one Markdown file per page, with YAML frontmatter
data/products.csv
data/companies.csv
data/magazine.csv
data/inventory.csv
analysis/claims.json
analysis/coverage.csv
analysis/gaps.md
viz/gap-map.html
notes/process-log.md
```

## Page frontmatter fields

url, title, section, page_type (core page, news, resource, faq, listing, legal), audience (consumer, industry, partner, internal, general), published_date, modified_date, word_count, crawl_date

## Process log

After each stage, append to notes/process-log.md: what was done, the prompt or instruction that drove it, decisions made, and problems hit.
This log becomes a reusable skill later, so write it as steps another person could repeat on a different organization's website.

## Writing style for all human-readable output

- US English spelling
- No em dashes, no semicolons, no contractions
- Plain, calm, professional tone. No marketing language.
- Short sentences. Tables where they help comparison.
