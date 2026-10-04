"""Pull core WordPress content via the REST API: pages and posts.

Custom post types (products, companies, resources, etc.) are not exposed via
REST on this site (confirmed against /wp-json/wp/v2/taxonomies and /wp-json/
during Stage 1 review), so this script only covers wp/v2/pages and wp/v2/posts.
Everything else goes through sitemaps.py + HTML scraping instead.
"""
from __future__ import annotations

from fetcher import BASE_URL, fetch_json

PER_PAGE = 100


def fetch_all(endpoint: str) -> list[dict]:
    items: list[dict] = []
    page = 1
    while True:
        url = f"{BASE_URL}/wp-json/wp/v2/{endpoint}?per_page={PER_PAGE}&page={page}&_fields=id,link,slug,title,date,modified,content"
        cache_rel = f"wp-json/{endpoint}_page{page}.json"
        batch = fetch_json(url, cache_rel)
        if not batch:
            break
        items.extend(batch)
        if len(batch) < PER_PAGE:
            break
        page += 1
    return items


def main() -> None:
    pages = fetch_all("pages")
    posts = fetch_all("posts")
    print(f"wp/v2/pages: {len(pages)} items")
    print(f"wp/v2/posts: {len(posts)} items")


if __name__ == "__main__":
    main()
