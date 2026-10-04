"""Write one Markdown file per page under data/pages/, with YAML frontmatter.

Frontmatter fields per CLAUDE.md: url, title, section, page_type, audience,
published_date, modified_date, word_count, crawl_date.
"""
from __future__ import annotations

import re
from pathlib import Path

import yaml

from fetcher import BASE_URL, REPO_ROOT

PAGES_DIR = REPO_ROOT / "data" / "pages"


def _slug_for(url: str) -> str:
    rel = url.replace(BASE_URL, "").strip("/")
    return rel.replace("/", "__") or "index"


def write_page(
    *,
    url: str,
    title: str,
    section: str,
    page_type: str,
    audience: str,
    published_date: str,
    modified_date: str,
    word_count: int,
    crawl_date: str,
    body: str = "",
) -> Path:
    frontmatter = {
        "url": url,
        "title": title,
        "section": section,
        "page_type": page_type,
        "audience": audience,
        "published_date": published_date,
        "modified_date": modified_date,
        "word_count": word_count,
        "crawl_date": crawl_date,
    }
    text = "---\n" + yaml.safe_dump(frontmatter, sort_keys=False, allow_unicode=True) + "---\n\n" + body.strip() + "\n"

    path = PAGES_DIR / f"{_slug_for(url)}.md"
    path.write_text(text, encoding="utf-8")
    return path
