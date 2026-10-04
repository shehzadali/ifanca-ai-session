"""Fetch robots.txt, cache it, and confirm every path this crawl touches is allowed.

Run this first. Exits non-zero if any target path is disallowed for our User-Agent.
"""
from __future__ import annotations

import sys
import urllib.robotparser as robotparser

from fetcher import BASE_URL, USER_AGENT, fetch_text

# Representative paths for every content type this crawl will touch.
TARGET_PATHS = [
    "/",
    "/wp-json/",
    "/wp-json/wp/v2/pages",
    "/wp-json/wp/v2/posts",
    "/wp-json/sage-endpoint/v1/faq",
    "/sitemap_index.xml",
    "/page-sitemap.xml",
    "/products-sitemap.xml",
    "/companies-sitemap.xml",
    "/resources-sitemap.xml",
    "/magazines-sitemap.xml",
    "/halal-certified-products/",
    "/certified-companies/",
    "/companies/some-company/",
    "/product-companies/some-company/",
    "/resources/some-resource/",
    "/magazines/spring-2022/",
    "/wp/wp-admin/admin-ajax.php",
]


def main() -> int:
    robots_url = f"{BASE_URL}/robots.txt"
    text = fetch_text(robots_url, "robots.txt")

    rp = robotparser.RobotFileParser()
    rp.parse(text.splitlines())

    all_ok = True
    for path in TARGET_PATHS:
        url = BASE_URL + path
        allowed = rp.can_fetch(USER_AGENT, url)
        status = "OK" if allowed else "BLOCKED"
        if not allowed:
            all_ok = False
        print(f"{status:7} {path}")

    if all_ok:
        print("\nAll target paths are allowed under robots.txt.")
        return 0
    print("\nOne or more target paths are blocked. Stop and review before crawling.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
