"""Build data/companies.csv from the two distinct company surfaces on the site
(decision: keep sources distinct rather than merging, see process-log):

1. company_profile: the 464 real Company post type pages (companies-sitemap.xml).
   This is the only structured, complete company roster on the site, though it
   is not linked from working on-site navigation (see notes/process-log.md).
2. product_filter_taxonomy: the 149 product_companies taxonomy terms, each one
   just a pre-filtered view of the products list for that company name, with
   no standalone profile content of its own.

/certified-companies/ itself is recorded separately as a core "listing" page
in data/pages/ (via pages_core.py), since it's informational, not a record.
"""
from __future__ import annotations

import csv
import re
import time
from pathlib import Path

from fetcher import fetch_text, slugify_path
from page_extract import extract_fields
from sitemaps import build_master_list

CRAWL_DATE = time.strftime("%Y-%m-%d")


def _rows_for_sitemap(sitemap_name: str, index_url: str) -> list[str]:
    rows = build_master_list()
    urls = [r["url"] for r in rows if r["sitemap"] == sitemap_name]
    return [u for u in urls if u.rstrip("/") != index_url]


def build_company_profiles() -> list[dict]:
    urls = _rows_for_sitemap("companies-sitemap", "https://ifanca.org/companies")
    print(f"Company profiles to fetch: {len(urls)}")
    rows = []
    for i, url in enumerate(urls, 1):
        html_text = fetch_text(url, f"html/{slugify_path(url)}")
        fields = extract_fields(html_text)
        rows.append(
            {
                "name": fields["title"],
                "slug": url.rstrip("/").rsplit("/", 1)[-1],
                "url": url,
                "source": "company_profile",
                "product_count": "",
                "crawl_date": CRAWL_DATE,
            }
        )
        if i % 100 == 0:
            print(f"  ...{i}/{len(urls)} company profiles fetched")
    return rows


def build_product_filter_terms() -> list[dict]:
    urls = _rows_for_sitemap("product_companies-sitemap", "https://ifanca.org/product-companies")
    print(f"Product-filter company terms to fetch: {len(urls)}")
    rows = []
    for i, url in enumerate(urls, 1):
        html_text = fetch_text(url, f"html/{slugify_path(url)}")
        fields = extract_fields(html_text)
        # The taxonomy archive template always appends " Archives" to the
        # term name in <title> (e.g. "Z.A.S. International Archives"), it's
        # site chrome, not part of the company name, strip it the same way
        # extract_fields already strips IFANCA's own "- IFANCA" suffix.
        name = re.sub(r"\s+Archives$", "", fields["title"])
        rows.append(
            {
                "name": name,
                "slug": url.rstrip("/").rsplit("/", 1)[-1],
                "url": url,
                "source": "product_filter_taxonomy",
                "product_count": "",
                "crawl_date": CRAWL_DATE,
            }
        )
        if i % 50 == 0:
            print(f"  ...{i}/{len(urls)} product-filter terms fetched")
    return rows


def main() -> None:
    from fetcher import REPO_ROOT

    rows = build_company_profiles() + build_product_filter_terms()
    out_path = REPO_ROOT / "data" / "companies.csv"
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["name", "slug", "url", "source", "product_count", "crawl_date"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {out_path}")


if __name__ == "__main__":
    main()
