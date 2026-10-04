"""Read /sitemap_index.xml and every child sitemap, build a master URL list.

Writes data/raw/sitemaps/<name>.xml for each sitemap fetched, and returns/prints
a (url, sitemap_name, lastmod) table that other scripts can filter by content type.
"""
from __future__ import annotations

import re
from pathlib import Path

from fetcher import BASE_URL, fetch_text

INDEX_URL = f"{BASE_URL}/sitemap_index.xml"

# sitemap filename -> (content_type, section) used later when building the inventory
CONTENT_TYPE_MAP = {
    "post-sitemap": ("post", "news"),
    "page-sitemap": ("core page", "general"),
    "events-sitemap": ("event", "news"),
    "resources-sitemap": ("resource", "resource"),
    "resources-sitemap2": ("resource", "resource"),
    "magazines-sitemap": ("magazine issue", "resource"),
    "teams-sitemap": ("team profile", "internal"),
    "faqs-sitemap": ("faq", "faq"),
    "programs-sitemap": ("program", "resource"),
    "companies-sitemap": ("company profile", "partner"),
    "certificates-sitemap": ("certificate", "resource"),
}
for i in range(1, 13):
    CONTENT_TYPE_MAP[f"products-sitemap{'' if i == 1 else i}"] = ("product", "listing")


def _sitemap_name(url: str) -> str:
    return Path(url).stem


def fetch_sitemap_index() -> list[str]:
    text = fetch_text(INDEX_URL, "sitemaps/sitemap_index.xml")
    return re.findall(r"<loc>([^<]+)</loc>", text)


def fetch_sitemap_urls(sitemap_url: str) -> list[tuple[str, str]]:
    name = _sitemap_name(sitemap_url)
    text = fetch_text(sitemap_url, f"sitemaps/{name}.xml")
    locs = re.findall(r"<loc>([^<]+)</loc>", text)
    lastmods = re.findall(r"<lastmod>([^<]+)</lastmod>", text)
    if len(lastmods) != len(locs):
        lastmods = [""] * len(locs)
    return list(zip(locs, lastmods))


def build_master_list() -> list[dict]:
    rows = []
    for sitemap_url in fetch_sitemap_index():
        name = _sitemap_name(sitemap_url)
        content_type, section = CONTENT_TYPE_MAP.get(name, ("unknown", "unknown"))
        for url, lastmod in fetch_sitemap_urls(sitemap_url):
            rows.append(
                {
                    "url": url,
                    "sitemap": name,
                    "content_type": content_type,
                    "section": section,
                    "lastmod": lastmod,
                }
            )
    return rows


def main() -> None:
    rows = build_master_list()
    print(f"Total URLs across all sitemaps: {len(rows)}")
    counts: dict[str, int] = {}
    for r in rows:
        counts[r["sitemap"]] = counts.get(r["sitemap"], 0) + 1
    for name, n in sorted(counts.items()):
        print(f"  {name:30} {n}")


if __name__ == "__main__":
    main()
