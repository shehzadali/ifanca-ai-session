"""Build data/pages/*.md for core Pages and News posts from cached wp/v2 JSON.

The REST API already returned full rendered content for these two types
(see wp_api.py), so this needs no additional HTTP requests.
"""
from __future__ import annotations

import re
import time

from bs4 import BeautifulSoup

import wp_api
from fetcher import fetch_text, slugify_path
from md_writer import write_page
from page_extract import extract_fields

CRAWL_DATE = time.strftime("%Y-%m-%d")

# Page type / audience are not in the REST payload, assign by slug using what
# the page is actually about. "general" audience/page_type default otherwise.
PAGE_OVERRIDES = {
    "about": {"page_type": "core page", "audience": "general"},
    "contact": {"page_type": "core page", "audience": "general"},
    "careers": {"page_type": "core page", "audience": "internal"},
    "team": {"page_type": "core page", "audience": "internal"},
    "faqs": {"page_type": "listing", "audience": "general"},
    "certified-companies": {"page_type": "listing", "audience": "industry"},
    "halal-certified-products": {"page_type": "listing", "audience": "consumer"},
    "resources": {"page_type": "listing", "audience": "general"},
    "events": {"page_type": "listing", "audience": "general"},
    "sitemap": {"page_type": "listing", "audience": "general"},
    "terms-conditions": {"page_type": "legal", "audience": "general"},
    "privacy-policy": {"page_type": "legal", "audience": "general"},
    "certification-process": {"page_type": "core page", "audience": "industry"},
    "certification-process-indonesia": {"page_type": "core page", "audience": "industry"},
    "accreditations-and-recognitions": {"page_type": "core page", "audience": "partner"},
    "beyond-certification": {"page_type": "core page", "audience": "general"},
    "halal-consumer-magazine": {"page_type": "listing", "audience": "consumer"},
}


def _html_to_text(html_fragment: str) -> str:
    return BeautifulSoup(html_fragment, "lxml").get_text(" ", strip=True)


def build_core_pages() -> int:
    """Core 'page' post type content is built with a flexible-content page
    builder: content.rendered via REST is empty for all but 2 of 19 pages
    (confirmed during Stage 1). REST still gives the authoritative title and
    dates, body text falls back to an HTML fetch + extraction."""
    pages = wp_api.fetch_all("pages")
    count = 0
    for p in pages:
        slug = p.get("slug", "")
        overrides = PAGE_OVERRIDES.get(slug, {"page_type": "core page", "audience": "general"})
        url = p.get("link", "")

        rest_body_html = p.get("content", {}).get("rendered", "")
        if rest_body_html.strip():
            body_text = _html_to_text(rest_body_html)
        else:
            html_text = fetch_text(url, f"html/{slugify_path(url)}")
            body_text = extract_fields(html_text)["body_text"]

        write_page(
            url=url,
            title=BeautifulSoup(p.get("title", {}).get("rendered", ""), "lxml").get_text(strip=True),
            section="core",
            page_type=overrides["page_type"],
            audience=overrides["audience"],
            published_date=(p.get("date") or "")[:10],
            modified_date=(p.get("modified") or "")[:10],
            word_count=len(body_text.split()),
            crawl_date=CRAWL_DATE,
            body=body_text,
        )
        count += 1
    return count


def build_news_posts() -> int:
    posts = wp_api.fetch_all("posts")
    count = 0
    for p in posts:
        body_html = p.get("content", {}).get("rendered", "")
        body_text = _html_to_text(body_html)
        write_page(
            url=p.get("link", ""),
            title=BeautifulSoup(p.get("title", {}).get("rendered", ""), "lxml").get_text(strip=True),
            section="news",
            page_type="news",
            audience="general",
            published_date=(p.get("date") or "")[:10],
            modified_date=(p.get("modified") or "")[:10],
            word_count=len(body_text.split()),
            crawl_date=CRAWL_DATE,
            body=body_text,
        )
        count += 1
    return count


def main() -> None:
    n_pages = build_core_pages()
    n_posts = build_news_posts()
    print(f"Wrote {n_pages} core pages and {n_posts} news posts to data/pages/")


if __name__ == "__main__":
    main()
