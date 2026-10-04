"""Build a visitor reachability map of ifanca.org from the Stage 1 cache.

Starts at the homepage and follows what a visitor can click: header menu,
footer, in-page links, and items a page loads through its own filters,
pagination, or the header site search. Content known only from XML sitemaps,
REST, or theme code is recorded as unreachable.

Reads from data/raw/ first. Only fetches (via fetcher.py, 1 req/sec, cached)
when a reachable page or listing view is not cached yet.

Writes:
  data/visitor-inventory.csv
  data/unreachable.csv
  data/dead-paths.csv
  data/resources-breakdown.csv
  data/resources-listing.csv
"""
from __future__ import annotations

import csv
import glob
import json
import re
from collections import Counter, deque
from pathlib import Path
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup

from fetcher import BASE_URL, RAW_DIR, REPO_ROOT, fetch_json, fetch_text, slugify_path
from page_extract import extract_fields

DATA_DIR = REPO_ROOT / "data"
AJAX_URL = f"{BASE_URL}/wp/wp-admin/admin-ajax.php"
NEWS_API = f"{BASE_URL}/wp-json/sage-endpoint/v1/news-events"
CRAWL_DATE = "2026-10-04"
HOME = f"{BASE_URL}/"
# Pages that failed to load (404 etc.), kept so reruns do not request them again.
FAILED_PATH = RAW_DIR / "_failed_urls.json"
# Links that load a different, unrelated page (WordPress guesses a redirect).
REDIRECTED = {f"{BASE_URL}/author/"}
# CPT archive URLs listed in sitemaps next to the items themselves.
ARCHIVES = {f"{BASE_URL}/{p}/" for p in ("products", "companies", "magazines", "faqs", "teams", "events", "programs")}

# Broken paths seen by reading the cached pages, each tied to a source URL.
OBSERVED_DEAD = [
    {"source_url": f"{BASE_URL}/", "link_text": "Beverages, Cosmetics & Personal Care, Food, Nutritional & Dietary Supplements, Pharmaceuticals",
     "target": f"{BASE_URL}/halal-certified-products/", "issue": "category tiles open the unfiltered product list, the category is not applied"},
    {"source_url": f"{BASE_URL}/events/", "link_text": "Event 1, Event 2, Event 4",
     "target": f"{BASE_URL}/events/", "issue": "listing shows only placeholder items with lorem ipsum text"},
    {"source_url": f"{BASE_URL}/team/", "link_text": "",
     "target": f"{BASE_URL}/team/", "issue": "page lists one person and a stray semicolon, no other staff or board"},
    {"source_url": f"{BASE_URL}/programs/", "link_text": "(empty link)",
     "target": f"{BASE_URL}/author/", "issue": "broken archive: empty link loads an unrelated news post (Authors Wanted)"},
    {"source_url": f"{BASE_URL}/programs/texas-am-university/", "link_text": "Back to All",
     "target": f"{BASE_URL}/programs/", "issue": "broken archive: shows 1 of 3 programs"},
    {"source_url": "(none, sitemap only)", "link_text": "",
     "target": f"{BASE_URL}/companies/", "issue": "broken archive: company archive renders a single link, no directory (Stage 1 finding)"},
    {"source_url": f"{BASE_URL}/halal-certified-products/", "link_text": "product cards",
     "target": "", "issue": "11,642 product cards have no link to their product pages"},
]
SEARCH = f"{BASE_URL}/?s"

# Listing pages whose items are counted on one row, not one row per item.
LISTING_PATHS = {
    "/halal-certified-products/",
    "/resources/",
    "/news/",
    "/faqs/",
    "/halal-consumer-magazine/",
    "/events/",
    "/beyond-certification/",
}


# ---------------------------------------------------------------- helpers

def normalize(href: str, base: str) -> str | None:
    """Absolute, https, no www, no query or fragment, trailing slash on paths."""
    absolute = urljoin(base, href.strip())
    p = urlparse(absolute)
    host = p.netloc.lower().removeprefix("www.")
    if host != "ifanca.org" or p.scheme not in ("http", "https"):
        return None
    path = p.path or "/"
    if not path.endswith("/") and "." not in path.rsplit("/", 1)[-1]:
        path += "/"
    return f"https://ifanca.org{path}"


def is_asset(url: str) -> bool:
    path = urlparse(url).path
    return path.startswith(("/app/", "/wp/", "/wp-json/", "/wp-content/")) or "." in path.rsplit("/", 1)[-1]


def path_of(url: str) -> str:
    return urlparse(url).path


def load_inventory() -> dict[str, dict]:
    with (DATA_DIR / "inventory.csv").open(encoding="utf-8") as f:
        return {r["url"]: r for r in csv.DictReader(f)}


def load_sitemap_urls() -> dict[str, str]:
    """url -> sitemap name, for every child sitemap cached in Stage 1."""
    out: dict[str, str] = {}
    for path in sorted((RAW_DIR / "sitemaps").glob("*.xml")):
        if path.stem == "sitemap_index":
            continue
        for loc in re.findall(r"<loc>([^<]+)</loc>", path.read_text(encoding="utf-8")):
            out.setdefault(loc, path.stem)
    return out


def load_rest_posts() -> dict[str, str]:
    """News post url -> rendered content, from the cached REST responses."""
    out = {}
    for path in sorted((RAW_DIR / "wp-json").glob("posts_page*.json")):
        for post in json.loads(path.read_text(encoding="utf-8")):
            out[post["link"]] = post["content"]["rendered"]
    return out


def cached_html(url: str) -> str | None:
    path = RAW_DIR / "html" / slugify_path(url)
    return path.read_text(encoding="utf-8") if path.exists() else None


# ---------------------------------------------------------------- listings

def walk_news() -> dict:
    """Same POST the /news/ Vue component sends: {apiUrl}/{paged} with postType."""
    news_html = cached_html(f"{BASE_URL}/news/")
    archive = json.loads(re.search(r"var ARCHIVE = (\{.*?\});", news_html).group(1))
    omit = [str(i) for i in archive["postIdsToOmit"]]
    banner = [
        a["href"] for a in BeautifulSoup(news_html, "lxml").select(".banner.news-events a[href]")
    ]
    urls, page, max_pages, total = [], 1, 1, 0
    while page <= max_pages:
        d = fetch_json(
            f"{NEWS_API}/{page}", f"ajax/news/page_{page:04d}.json", method="POST",
            data={"postType": "post", "postsNotIn[]": omit},
        )
        max_pages, total = d["maxPages"], d["total"]
        urls += [p["permalink"] for p in d["posts"]]
        page += 1
    return {"banner": banner, "items": banner + urls, "total": total + len(banner)}


def walk_resources(filter_field: str = "", value: str = "") -> dict:
    """Same POST the /resources/ filter form sends (action=filter_resources)."""
    # The filter comboboxes submit the option text, not the option value attribute.
    tag = f"{filter_field}_{re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')}" if filter_field else "all"
    items, page, total_pages, total = [], 1, 1, 0
    while page <= total_pages:
        data = {"action": "filter_resources", "paged": str(page),
                "resource_types": "", "resource_topics": "", "search": ""}
        if filter_field:
            data[filter_field] = value
        cache = "ajax/resources/page_0001.json" if tag == "all" and page == 1 else f"ajax/resources/{tag}/page_{page:04d}.json"
        d = fetch_json(AJAX_URL, cache, method="POST", data=data)
        total_pages, total = d["total_pages"] or 0, d["total_posts"]
        soup = BeautifulSoup(d.get("html") or "", "lxml")
        for card in soup.select(".content-indiv"):
            a = card.find("a", href=True)
            tag_el = card.select_one(".tag")
            date_el = card.select_one(".date")
            items.append({
                "url": a["href"],
                "title": a.get_text(" ", strip=True),
                "type_label": tag_el.get_text(strip=True) if tag_el else "",
                "date": date_el.get_text(strip=True) if date_el else "",
            })
        page += 1
    return {"items": items, "total": total}


def resource_filters() -> dict[str, list[tuple[str, str]]]:
    soup = BeautifulSoup(cached_html(f"{BASE_URL}/resources/"), "lxml")
    form = soup.find("form", id="resource-list-form")
    out = {}
    for field, box in (("resource_types", "filter-1"), ("resource_topics", "filter-2")):
        out[field] = [(o["value"], o.get_text(strip=True)) for o in form.select(f".listbox.{box} .option")]
    return out


def walk_programs() -> dict:
    """Same POST the /beyond-certification/ programs grid sends (action=list_programs)."""
    d = fetch_json(AJAX_URL, "ajax/programs/page_0001.json", method="POST",
                   data={"action": "list_programs", "paged": "1", "program_type": ""})
    programs = d.get("programs") or []
    if isinstance(programs, dict):
        programs = list(programs.values())
    return {"items": [p.get("link", "") for p in programs], "titles": [p.get("title", "") for p in programs],
            "total": d.get("total_posts", len(programs)), "raw_keys": list(d.keys())}


def magazine_listing() -> dict:
    issues, links, pdfs = 0, set(), set()
    years_empty = []
    for path in sorted((RAW_DIR / "ajax" / "magazines").glob("year_*.html")):
        n = len(re.findall(r"data-post_id=", path.read_text(encoding="utf-8")))
        issues += n
        if n == 0:
            years_empty.append(path.stem.split("_")[1])
    for path in (RAW_DIR / "ajax" / "magazines").glob("info_*.html"):
        for href in re.findall(r'href="([^"]+)"', path.read_text(encoding="utf-8")):
            href = href.replace("&amp;", "&")
            if href.lower().endswith(".pdf"):
                pdfs.add(href)
            else:
                n = normalize(href, BASE_URL)
                if n:
                    links.add(n)
    return {"issues": issues, "resource_links": links, "pdfs": pdfs, "years_empty": years_empty}


def faq_listing() -> int:
    total = 0
    for path in (RAW_DIR / "faq").glob("page_*.json"):
        total += len(json.loads(path.read_text(encoding="utf-8"))["posts"])
    return total


def search_listing() -> int:
    html = cached_html(SEARCH) or fetch_text(SEARCH, "html/_search__search_empty.html")
    m = re.search(r"([\d,]+)\s+Results", BeautifulSoup(html, "lxml").get_text(" "))
    return int(m.group(1).replace(",", ""))


# ---------------------------------------------------------------- link graph

def page_links(url: str, html: str) -> list[tuple[str, str, str]]:
    """(raw href, link text, region) for every <a> on the page."""
    soup = BeautifulSoup(html, "lxml")
    for t in soup.select("script, style, noscript, head"):
        t.decompose()
    out = []
    for a in soup.find_all("a"):
        href = a.get("href")
        if href is None:
            continue
        if a.find_parent("header", class_="header"):
            region = "menu"
        elif a.find_parent("footer", class_="footer"):
            region = "footer"
        else:
            region = "in-page link"
        out.append((href, a.get_text(" ", strip=True)[:80], region))
    return out


def main() -> None:
    inventory = load_inventory()
    sitemap = load_sitemap_urls()
    rest_posts = load_rest_posts()

    # Listing views, each loaded the way the page's own JS loads it.
    news = walk_news()
    resources_all = walk_resources()
    filters = resource_filters()
    res_by_type = {label: walk_resources("resource_types", label) for _, label in filters["resource_types"]}
    res_by_topic = {label: walk_resources("resource_topics", label) for _, label in filters["resource_topics"]}
    programs = walk_programs()
    magazine = magazine_listing()
    faq_count = faq_listing()
    search_total = search_listing()
    products_total = json.loads((RAW_DIR / "ajax/products/page_0001.json").read_text())["total_posts"]

    listing_children = {
        f"{BASE_URL}/news/": ("pagination", news["items"]),
        f"{BASE_URL}/resources/": ("filter or search", [r["url"] for r in resources_all["items"]]),
        f"{BASE_URL}/beyond-certification/": ("filter or search", [u for u in programs["items"] if u]),
        f"{BASE_URL}/halal-consumer-magazine/": ("filter or search", sorted(magazine["resource_links"])),
    }

    # Breadth-first walk from the homepage. Search is added after, so content
    # that also has a browse path keeps its browse label.
    depth: dict[str, int] = {HOME: 0}
    how: dict[str, str] = {HOME: "start"}
    parent: dict[str, str] = {HOME: ""}
    dead: list[dict] = []
    queue = deque([HOME])
    fetched_new = []
    link_text: dict[str, str] = {}
    failed: dict[str, str] = json.loads(FAILED_PATH.read_text()) if FAILED_PATH.exists() else {}

    while queue:
        url = queue.popleft()
        if url == SEARCH or path_of(url) == "/" and url != HOME:
            continue
        html = cached_html(url)
        if html is None and url in rest_posts:
            html = rest_posts[url]
        if html is None:
            if url in failed:
                status = failed[url]
            else:
                try:
                    html = fetch_text(url, "html/" + slugify_path(url))
                    fetched_new.append(url)
                    status = ""
                except Exception as exc:  # noqa: BLE001 - any failure is a dead path
                    status = str(exc)[:120]
                    failed[url] = status
                    FAILED_PATH.write_text(json.dumps(failed, indent=1), encoding="utf-8")
            if html is None:
                src = parent[url]
                dead.append({"source_url": src, "link_text": link_text.get(url, ""), "target": url,
                             "issue": f"dead link: {status}"})
                continue
        for href, text, region in page_links(url, html):
            if href.strip() in ("#", ""):
                dead.append({"source_url": url, "link_text": text, "target": href, "issue": "link to # (goes nowhere)"})
                continue
            if href.startswith(("mailto:", "tel:", "#")):
                continue
            if "?s" in href and "ifanca.org" in href:
                target = SEARCH
            else:
                target = normalize(href, url)
            if not target or is_asset(target):
                continue
            if target not in depth:
                depth[target] = depth[url] + 1
                how[target] = region
                parent[target] = url
                link_text[target] = text
                queue.append(target)
        for child in listing_children.get(url, ("", []))[1]:
            child = normalize(child, BASE_URL)
            if child and child not in depth:
                depth[child] = depth[url] + 1
                how[child] = listing_children[url][0]
                parent[child] = url
                queue.append(child)

    # A URL that failed to load is a dead path, not a reachable page.
    browse_reached = set(depth) - set(failed)

    write_outputs(
        inventory, sitemap, rest_posts, depth, how, parent, browse_reached, dead,
        news, resources_all, res_by_type, res_by_topic, programs, magazine,
        faq_count, search_total, products_total, fetched_new,
    )


# ---------------------------------------------------------------- outputs

def classify_sitemap(name: str) -> str:
    base = re.sub(r"\d+$", "", name.replace("-sitemap", ""))
    return {
        "post": "news post", "page": "core page", "resources": "resource", "products": "product detail page",
        "companies": "company profile page", "faqs": "faq", "magazines": "magazine issue page",
        "events": "event", "programs": "program", "teams": "team profile",
    }.get(base, f"taxonomy archive: {base}")


def write_outputs(inventory, sitemap, rest_posts, depth, how, parent, browse_reached, dead,
                  news, resources_all, res_by_type, res_by_topic, programs, magazine,
                  faq_count, search_total, products_total, fetched_new) -> None:
    # ---- visitor-inventory.csv
    item_prefixes = ("/resources/", "/products/", "/companies/", "/faqs/", "/magazines/")
    news_items = {normalize(u, BASE_URL) for u in news["items"]}
    listing_counts = {
        "/halal-certified-products/": (products_total, "filter or search", "Product cards load by AJAX filter and pagination. Cards have no link to a product page."),
        "/resources/": (resources_all["total"], "filter or search", "Resource cards load by AJAX filter, search, and pagination."),
        "/news/": (news["total"], "pagination", f"{len(news['banner'])} posts in the banner, the rest load by a Load More list."),
        "/faqs/": (faq_count, "filter or search", "Questions and answers load inline by category. No link to single FAQ pages."),
        "/halal-consumer-magazine/": (magazine["issues"], "filter or search", f"Issues load by year and issue pickers. Each issue shows article links and a PDF link ({len(magazine['pdfs'])} PDFs)."),
        "/events/": (3, "in-page link", "Three items titled Event 1, Event 2, Event 4 with placeholder text."),
        "/beyond-certification/": (len([u for u in programs["items"] if u]), "filter or search", "Programs grid loads by AJAX."),
    }
    rows = []
    for url in sorted(browse_reached, key=lambda u: (depth[u], u)):
        p = path_of(url)
        if url in news_items or url == SEARCH or url in REDIRECTED or (p.startswith(item_prefixes) and p not in LISTING_PATHS):
            continue
        html = cached_html(url) or ""
        fields = extract_fields(html) if html else {"title": "", "word_count": ""}
        inv = inventory.get(url, {})
        page_type = inv.get("page_type") or ("core page" if url == HOME else "")
        audience = inv.get("audience") or "general"
        count, note = "", ""
        if p in listing_counts:
            count, _, note = listing_counts[p]
            page_type = "listing"
        if p.startswith("/events/") and p != "/events/":
            page_type, audience, note = "news", "general", "Placeholder text (lorem ipsum)."
        if p.startswith("/programs/"):
            page_type, audience = "resource", "general"
        if p == "/programs/":
            page_type, note = "listing", "Program archive. Reached by Back to All on a program page. Shows 1 of 3 programs."
        if p == "/sitemap/":
            page_type, note = "listing", "HTML sitemap linked in the footer. Only path to Team, Events, and Beyond Certification."
        rows.append({
            "url": url, "title": inv.get("title") or fields["title"], "page_type": page_type,
            "audience": audience, "reached_via": how[url], "click_depth": depth[url],
            "word_count": fields["word_count"], "items_reachable": count,
            "via_page": parent[url], "notes": note, "crawl_date": CRAWL_DATE,
        })
    rows.append({
        "url": SEARCH, "title": "Site search results", "page_type": "listing", "audience": "general",
        "reached_via": "menu", "click_depth": 1, "word_count": "", "items_reachable": search_total,
        "via_page": HOME,
        "notes": "Header search icon. An empty search pages through every public post: products, company profiles, resources, news, FAQs, magazine issues, events, programs, team.",
        "crawl_date": CRAWL_DATE,
    })
    write_csv(DATA_DIR / "visitor-inventory.csv", rows)

    # ---- unreachable.csv
    by_type: Counter = Counter()
    for url, name in sitemap.items():
        if normalize(url, BASE_URL) in browse_reached:
            continue
        by_type["post type archive" if url in ARCHIVES else classify_sitemap(name)] += 1
    searchable = {"product detail page", "company profile page", "faq", "magazine issue page",
                  "event", "program", "team profile", "resource", "news post", "core page"}
    notes = {
        "product detail page": "Listing cards show product data but do not link to these pages. Found only by site search.",
        "company profile page": "No menu, listing, or in-page link points here. Found only by typing a company name into site search.",
        "faq": "Same questions show inline on /faqs/. The single FAQ URLs are found only by site search.",
        "magazine issue page": "Issue content shows on /halal-consumer-magazine/ through the pickers. The issue URLs are found only by site search.",
        "team profile": "The /team/ page lists the person but does not link to the profile.",
        "program": "Beyond Certification programs grid did not link here.",
        "post type archive": "Archive index URLs (products, companies, magazines, faqs, teams). No visitor link points here.",
    }
    un_rows = []
    for ctype, n in by_type.most_common():
        un_rows.append({
            "content_type": ctype, "count": n,
            "how_found": "XML sitemap (Stage 1 crawl)",
            "visitor_path": "site search only" if ctype in searchable else "none",
            "note": notes.get(ctype, "Filter value or archive URL. No visitor link points here." if ctype.startswith("taxonomy") else "Present in sitemap, no visitor link found."),
        })
    write_csv(DATA_DIR / "unreachable.csv", un_rows)

    # ---- dead-paths.csv
    seen, dead_rows = set(), []
    for d in dead + OBSERVED_DEAD:
        key = (d["source_url"], d["target"], d["link_text"])
        if key not in seen:
            seen.add(key)
            dead_rows.append(d)
    write_csv(DATA_DIR / "dead-paths.csv", dead_rows, ["source_url", "link_text", "target", "issue"])

    # ---- resources breakdown
    br = [{"dimension": "all", "value": "All resources", "count": resources_all["total"]}]
    br += [{"dimension": "type", "value": k, "count": v["total"]} for k, v in sorted(res_by_type.items(), key=lambda kv: -kv[1]["total"])]
    typed = {r["url"] for v in res_by_type.values() for r in v["items"]}
    br.append({"dimension": "type", "value": "(no type)", "count": len({r["url"] for r in resources_all["items"]} - typed)})
    br += [{"dimension": "topic", "value": k, "count": v["total"]} for k, v in sorted(res_by_topic.items(), key=lambda kv: -kv[1]["total"])]
    topical = {r["url"] for v in res_by_topic.values() for r in v["items"]}
    br.append({"dimension": "topic", "value": "(no topic)", "count": len({r["url"] for r in resources_all["items"]} - topical)})
    write_csv(DATA_DIR / "resources-breakdown.csv", br)

    # Full resource list with type and topic, for picking consumer education titles.
    type_of = {r["url"]: t for t, v in res_by_type.items() for r in v["items"]}
    topic_of: dict[str, list[str]] = {}
    for t, v in res_by_topic.items():
        for r in v["items"]:
            topic_of.setdefault(r["url"], []).append(t)
    res_rows = [{"url": r["url"], "title": r["title"], "type": type_of.get(r["url"], ""),
                 "topic": "; ".join(topic_of.get(r["url"], [])), "date": r["date"], "crawl_date": CRAWL_DATE}
                for r in resources_all["items"]]
    write_csv(DATA_DIR / "resources-listing.csv", res_rows)

    print(f"browse-reachable URLs: {len(browse_reached)}  newly fetched pages: {len(fetched_new)} {fetched_new}")
    print(f"news total {news['total']}  resources {resources_all['total']} (walked {len(resources_all['items'])})")
    print(f"programs: {programs}")
    print(f"magazine issues {magazine['issues']}  pdfs {len(magazine['pdfs'])}  empty years {magazine['years_empty']}")
    print(f"faq {faq_count}  search {search_total}  products {products_total}")
    print(f"dead paths: {len(dead_rows)}")


def write_csv(path: Path, rows: list[dict], fieldnames: list[str] | None = None) -> None:
    fieldnames = fieldnames or (list(rows[0].keys()) if rows else [])
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)


if __name__ == "__main__":
    main()
