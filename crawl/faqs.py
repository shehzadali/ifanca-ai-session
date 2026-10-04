"""Build data/pages/*.md for every FAQ.

faqs-sitemap.xml gives 26 individual FAQ URLs, each scraped directly for its
question/answer body, same pattern as resources.py. (The theme also exposes a
clean GET /wp-json/sage-endpoint/v1/faq JSON API, confirmed during Stage 1
review, but its entries carry no URL of their own, only a positional index
per page, so matching them back to canonical URLs would mean guessing by
slugified question text. Scraping the sitemap's own URLs directly is more
reliable and keeps every record traceable to its source URL.)

Ground rule: halal rulings and religious explanations are out of scope to
generate, this only records what IFANCA already published verbatim.
"""
from __future__ import annotations

import time

from fetcher import fetch_text, slugify_path
from md_writer import write_page
from page_extract import extract_fields
from sitemaps import build_master_list

CRAWL_DATE = time.strftime("%Y-%m-%d")


def faq_urls() -> list[str]:
    rows = build_master_list()
    urls = [r["url"] for r in rows if r["sitemap"] == "faqs-sitemap"]
    return [u for u in urls if u.rstrip("/") != "https://ifanca.org/faqs"]


def build_faqs() -> int:
    urls = faq_urls()
    print(f"FAQs to fetch: {len(urls)}")
    count = 0
    for url in urls:
        html_text = fetch_text(url, f"html/{slugify_path(url)}")
        fields = extract_fields(html_text)
        write_page(
            url=url,
            title=fields["title"],
            section="faq",
            page_type="faq",
            audience="general",
            published_date=fields["published_date"],
            modified_date=fields["modified_date"],
            word_count=fields["word_count"],
            crawl_date=CRAWL_DATE,
            body=fields["body_text"],
        )
        count += 1
    return count


def main() -> None:
    n = build_faqs()
    print(f"Wrote {n} FAQ pages to data/pages/")


if __name__ == "__main__":
    main()
