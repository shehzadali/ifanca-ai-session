"""Build data/pages/*.md for every Resource article.

resources-sitemap.xml + resources-sitemap2.xml already give the complete,
accurate URL list (1,116 entries), matching the filter_resources AJAX total,
so this skips the AJAX listing and just fetches each resource page directly
for its body content.
"""
from __future__ import annotations

import time

from fetcher import fetch_text, slugify_path
from md_writer import write_page
from page_extract import extract_fields
from sitemaps import build_master_list

CRAWL_DATE = time.strftime("%Y-%m-%d")


def resource_urls() -> list[str]:
    rows = build_master_list()
    urls = [
        r["url"]
        for r in rows
        if r["sitemap"] in ("resources-sitemap", "resources-sitemap2")
    ]
    # drop the /resources/ listing index itself, handled separately as a core page
    return [u for u in urls if u.rstrip("/") != "https://ifanca.org/resources"]


def build_resources() -> int:
    count = 0
    urls = resource_urls()
    print(f"Resources to fetch: {len(urls)}")
    for i, url in enumerate(urls, 1):
        html_text = fetch_text(url, f"html/{slugify_path(url)}")
        fields = extract_fields(html_text)
        write_page(
            url=url,
            title=fields["title"],
            section="resource",
            page_type="resource",
            audience="consumer",
            published_date=fields["published_date"],
            modified_date=fields["modified_date"],
            word_count=fields["word_count"],
            crawl_date=CRAWL_DATE,
            body=fields["body_text"],
        )
        count += 1
        if i % 100 == 0:
            print(f"  ...{i}/{len(urls)} resources fetched")
    return count


def main() -> None:
    n = build_resources()
    print(f"Wrote {n} resource pages to data/pages/")


if __name__ == "__main__":
    main()
