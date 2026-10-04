"""Shared HTML extraction helpers: title, Yoast published/modified dates, word count."""
from __future__ import annotations

import re

from bs4 import BeautifulSoup


def extract_fields(html_text: str) -> dict:
    soup = BeautifulSoup(html_text, "lxml")

    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else ""
    title = re.sub(r"\s*-\s*IFANCA\s*$", "", title)

    def meta(prop: str) -> str:
        tag = soup.find("meta", attrs={"property": prop})
        return tag["content"] if tag and tag.has_attr("content") else ""

    published_date = meta("article:published_time")
    modified_date = meta("article:modified_time")

    if not published_date:
        m = re.search(r'"datePublished":"([^"]+)"', html_text)
        published_date = m.group(1) if m else ""
    if not modified_date:
        m = re.search(r'"dateModified":"([^"]+)"', html_text)
        modified_date = m.group(1) if m else ""

    main = soup.find("main") or soup.find("article") or soup.body
    body_text = main.get_text(" ", strip=True) if main else soup.get_text(" ", strip=True)
    word_count = len(body_text.split())

    pdf_link_tag = soup.find("a", href=re.compile(r"\.pdf($|\?)", re.I))
    pdf_url = pdf_link_tag["href"] if pdf_link_tag else ""

    return {
        "title": title,
        "published_date": published_date[:10] if published_date else "",
        "modified_date": modified_date[:10] if modified_date else "",
        "word_count": word_count,
        "pdf_url": pdf_url,
        "body_text": body_text,
    }
