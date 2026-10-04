"""Crawl the certified products catalog via the filter_products AJAX endpoint.

ifanca.org's products listing page has no server-rendered HTML list, it POSTs to
admin-ajax.php (action=filter_products) and renders the JSON client-side. This
script calls that same endpoint directly, 12 products per page, caching every
page under data/raw/ajax/products/ and writing the aggregate to data/products.csv.
"""
from __future__ import annotations

import csv
import html
import time
from pathlib import Path

from fetcher import BASE_URL, REPO_ROOT, fetch_json

AJAX_URL = f"{BASE_URL}/wp/wp-admin/admin-ajax.php"
CRAWL_DATE = time.strftime("%Y-%m-%d")


def fetch_page(paged: int) -> dict:
    data = {
        "action": "filter_products",
        "paged": str(paged),
        "search": "",
        "company-filter": "",
        "top-filter": "",
        "marketplace-filter": "",
        "country-filter": "",
    }
    cache_rel = f"ajax/products/page_{paged:04d}.json"
    return fetch_json(AJAX_URL, cache_rel, method="POST", data=data)


def crawl_all() -> list[dict]:
    first = fetch_page(1)
    total_pages = first["total_pages"]
    print(f"filter_products reports {first['total_posts']} products across {total_pages} pages")

    all_rows: list[dict] = []
    seen_ids: set[str] = set()

    def add_page(payload: dict) -> None:
        for pid, item in payload.get("products", {}).items():
            if pid in seen_ids:
                continue
            seen_ids.add(pid)
            all_rows.append(
                {
                    "id": pid,
                    "title": html.unescape(item.get("title", "")),
                    "url": item.get("url", ""),
                    "sold_in": item.get("sold_in", ""),
                    "company": "; ".join(item.get("company", [])),
                    "marketplace": "; ".join(item.get("marketplace", [])),
                    "category": "; ".join(item.get("category", [])),
                    "crawl_date": CRAWL_DATE,
                }
            )

    add_page(first)
    for paged in range(2, total_pages + 1):
        payload = fetch_page(paged)
        add_page(payload)
        if paged % 50 == 0:
            print(f"  ...page {paged}/{total_pages}, {len(all_rows)} products so far")

    return all_rows


def write_csv(rows: list[dict]) -> Path:
    out_path = REPO_ROOT / "data" / "products.csv"
    fieldnames = ["id", "title", "url", "sold_in", "company", "marketplace", "category", "crawl_date"]
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    return out_path


def main() -> None:
    rows = crawl_all()
    out_path = write_csv(rows)
    print(f"Wrote {len(rows)} products to {out_path}")


if __name__ == "__main__":
    main()
