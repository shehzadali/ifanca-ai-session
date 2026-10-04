"""Merge data/pages/*.md frontmatter, products.csv, companies.csv, and
magazine.csv into one master data/inventory.csv: one row per crawled URL.
"""
from __future__ import annotations

import csv
from pathlib import Path

import yaml

from fetcher import REPO_ROOT

FIELDNAMES = ["url", "title", "section", "page_type", "audience", "word_count", "crawl_date", "source_dataset"]


def rows_from_pages() -> list[dict]:
    rows = []
    for md_path in sorted((REPO_ROOT / "data" / "pages").glob("*.md")):
        text = md_path.read_text(encoding="utf-8")
        _, fm_text, _ = text.split("---", 2)
        fm = yaml.safe_load(fm_text)
        rows.append(
            {
                "url": fm.get("url", ""),
                "title": fm.get("title", ""),
                "section": fm.get("section", ""),
                "page_type": fm.get("page_type", ""),
                "audience": fm.get("audience", ""),
                "word_count": fm.get("word_count", ""),
                "crawl_date": fm.get("crawl_date", ""),
                "source_dataset": "pages",
            }
        )
    return rows


def rows_from_csv(filename: str, url_field: str, title_field: str, page_type: str, section: str, source_dataset: str) -> list[dict]:
    path = REPO_ROOT / "data" / filename
    if not path.exists():
        return []
    rows = []
    with path.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            rows.append(
                {
                    "url": row.get(url_field, ""),
                    "title": row.get(title_field, ""),
                    "section": section,
                    "page_type": page_type,
                    "audience": "",
                    "word_count": "",
                    "crawl_date": row.get("crawl_date", ""),
                    "source_dataset": source_dataset,
                }
            )
    return rows


def main() -> None:
    rows = rows_from_pages()
    rows += rows_from_csv("products.csv", "url", "title", "product", "listing", "products")
    rows += rows_from_csv("companies.csv", "url", "name", "listing", "partner", "companies")
    rows += rows_from_csv("magazine.csv", "url", "issue_title", "resource", "resource", "magazine")

    out_path = REPO_ROOT / "data" / "inventory.csv"
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {out_path}")

    counts: dict[str, int] = {}
    for r in rows:
        key = (r["source_dataset"], r["page_type"])
        counts[key] = counts.get(key, 0) + 1
    for (dataset, ptype), n in sorted(counts.items()):
        print(f"  {dataset:12} {ptype:12} {n}")


if __name__ == "__main__":
    main()
