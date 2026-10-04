"""Build data/magazine.csv: issue title, date, URL, and PDF URL (no PDF download).

magazines-sitemap.xml gives the 75 issue page URLs for title/date. The PDF link
itself is not in the static issue page HTML, it's rendered client-side from two
nonce-protected admin-ajax actions used by the magazine chooser widget on
/halal-consumer-magazine/:
  - get_all_magazine (select_year=<year>) -> list of {data-post_id, data-title}
  - get_magazine_info (m_id=<post_id>, nonce=<sage nonce>) -> HTML containing the
    real uploads/*.pdf link
This script reproduces that flow directly rather than downloading any PDF.
"""
from __future__ import annotations

import csv
import re
import time
from pathlib import Path

from fetcher import BASE_URL, REPO_ROOT, fetch_text
from page_extract import extract_fields
from sitemaps import build_master_list

AJAX_URL = f"{BASE_URL}/wp/wp-admin/admin-ajax.php"
MAGAZINE_HUB_URL = f"{BASE_URL}/halal-consumer-magazine/"
CRAWL_DATE = time.strftime("%Y-%m-%d")


def issue_urls() -> list[str]:
    rows = build_master_list()
    urls = [r["url"] for r in rows if r["sitemap"] == "magazines-sitemap"]
    return [u for u in urls if u.rstrip("/") != "https://ifanca.org/magazines"]


def get_nonce() -> str:
    html_text = fetch_text(MAGAZINE_HUB_URL, "html/halal-consumer-magazine.html")
    m = re.search(r'"nonce":"([a-f0-9]+)"', html_text)
    return m.group(1) if m else ""


def post_ids_by_title(years: set[str]) -> dict[str, str]:
    mapping: dict[str, str] = {}
    for year in sorted(years):
        html_text = fetch_text(
            AJAX_URL,
            f"ajax/magazines/year_{year}.html",
            method="POST",
            data={"action": "get_all_magazine", "select_year": year, "m_id": ""},
        )
        for m in re.finditer(r'data-post_id="(\d+)" data-title="([^"]+)"', html_text):
            mapping[m.group(2)] = m.group(1)
    return mapping


def pdf_url_for(post_id: str, nonce: str) -> str:
    html_text = fetch_text(
        AJAX_URL,
        f"ajax/magazines/info_{post_id}.html",
        method="POST",
        data={"action": "get_magazine_info", "m_id": post_id, "nonce": nonce},
    )
    m = re.search(r'href="([^"]*\.pdf)"', html_text, re.I)
    return m.group(1) if m else ""


def build_magazine_csv() -> Path:
    urls = issue_urls()

    base_rows = []
    for url in urls:
        html_text = fetch_text(url, f"html/{url.replace(BASE_URL, '').strip('/').replace('/', '__')}.html")
        fields = extract_fields(html_text)
        base_rows.append({"issue_title": fields["title"], "issue_date": fields["published_date"], "url": url})

    years = {r["issue_date"][:4] for r in base_rows if r["issue_date"]}
    id_map = post_ids_by_title(years)
    nonce = get_nonce()

    rows = []
    unmatched = 0
    for r in base_rows:
        post_id = id_map.get(r["issue_title"], "")
        pdf_url = pdf_url_for(post_id, nonce) if post_id else ""
        if not pdf_url:
            unmatched += 1
        rows.append({**r, "pdf_url": pdf_url, "crawl_date": CRAWL_DATE})

    out_path = REPO_ROOT / "data" / "magazine.csv"
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["issue_title", "issue_date", "url", "pdf_url", "crawl_date"])
        writer.writeheader()
        writer.writerows(rows)

    if unmatched:
        print(f"Note: {unmatched}/{len(rows)} issues had no PDF link found (title match or AJAX response gap).")
    return out_path


def main() -> None:
    path = build_magazine_csv()
    print(f"Wrote magazine.csv to {path}")


if __name__ == "__main__":
    main()
