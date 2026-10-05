"""Export app data for "The Halal Way" demo PWA into app/public/data/.

Reads only the local cache and the CSVs built in earlier stages. Makes no live
requests. Every record carries its source URL. Every file carries the crawl
date and a demo snapshot note.

Ground rule: halal rulings are out of scope to generate. ingredients.json
records only ingredients that IFANCA names in its FAQs and its two most recent
shopper guides, with IFANCA's own wording. The script fails if any quoted
source text is not found word for word in the cached source.
"""
from __future__ import annotations

import csv
import datetime as dt
import html
import json
import re
from pathlib import Path

from bs4 import BeautifulSoup

from fetcher import RAW_DIR, REPO_ROOT, slugify_path

DATA_DIR = REPO_ROOT / "data"
OUT_DIR = REPO_ROOT / "app" / "public" / "data"

NOTE = (
    "Demo snapshot of public ifanca.org content, for a training session only. "
    "Not an official IFANCA dataset. Content may be out of date. "
    "Check ifanca.org for current information."
)

INGREDIENT_GUIDE_URL = "https://ifanca.org/resources/halal-shoppers-guide-to-ingredients/"
QUICK_REFERENCE_URL = "https://ifanca.org/resources/halal-shoppers-quick-reference-guide-to-products/"

# Status values allowed in ingredients.json.
HALAL, HARAM, MASHBOOH, DEPENDS = "halal", "haram", "mashbooh", "depends on source"


# ---------- shared helpers ----------

def clean(text: str) -> str:
    """Collapse whitespace and drop zero-width characters, nothing else."""
    text = html.unescape(text).replace("​", "").replace("\xa0", " ")
    return re.sub(r"\s+", " ", text).strip()


def cached_html(url: str) -> BeautifulSoup | None:
    path = RAW_DIR / "html" / slugify_path(url)
    if not path.exists():
        return None
    return BeautifulSoup(path.read_text(encoding="utf-8"), "lxml")


def file_date(path: Path) -> str:
    return dt.date.fromtimestamp(path.stat().st_mtime).isoformat()


def iso_date(listing_date: str) -> str:
    """'June 30, 2026' -> '2026-06-30'. Returns the input if it does not parse."""
    try:
        return dt.datetime.strptime(listing_date.strip(), "%B %d, %Y").date().isoformat()
    except ValueError:
        return listing_date


def first_words(text: str, n: int = 40) -> str:
    words = text.split()
    return " ".join(words[:n]) + (" ..." if len(words) > n else "")


def write(name: str, crawl_date: str, source: str, items: list[dict], extra: dict | None = None) -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    payload = {"crawl_date": crawl_date, "note": NOTE, "source": source, "count": len(items)}
    payload.update(extra or {})
    payload["items"] = items
    (OUT_DIR / name).write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    return len(items)


def load_exclusions() -> dict[str, set[str]]:
    """URLs to leave out of each app dataset, from crawl/app_exclusions.csv. Each row records a reason."""
    path = Path(__file__).with_name("app_exclusions.csv")
    out: dict[str, set[str]] = {}
    if path.exists():
        with path.open(newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if not row["reason"].strip():
                    raise SystemExit(f"app_exclusions.csv: no reason given for {row['url']}")
                out.setdefault(row["dataset"], set()).add(row["url"])
    return out


EXCLUDED = load_exclusions()


def read_csv(name: str) -> list[dict]:
    with (DATA_DIR / name).open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


# ---------- products ----------

def export_products() -> int:
    rows = read_csv("products.csv")
    items = [
        {
            "name": r["title"],
            "company": r["company"],
            "category": r["category"],
            "sold_in": r["sold_in"],
            "marketplace": r["marketplace"],
            "url": r["url"],
        }
        for r in rows
    ]
    return write(
        "products.json",
        max(r["crawl_date"] for r in rows),
        "https://ifanca.org/halal-certified-products/",
        items,
    )


# ---------- recipes ----------

def _structured_recipe(soup: BeautifulSoup) -> tuple[list[str], list[str]]:
    """Current theme layout: section#recipe with .ingredients li and .indiv-step blocks."""
    section = soup.find("section", id="recipe")
    if not section:
        return [], []
    ing_box = section.find("div", class_="ingredients")
    ingredients = [clean(li.get_text(" ")) for li in ing_box.find_all("li")] if ing_box else []
    steps = []
    for step in section.find_all("div", class_="indiv-step"):
        heading = step.find("h3")
        if heading:
            heading.extract()
        text = clean(step.get_text(" "))
        if text:
            steps.append(text)
    return [i for i in ingredients if i], steps


_ING_HEAD = re.compile(r"ingredients", re.I)
_STEP_HEAD = re.compile(r"^(instructions|directions|method|preparation)\b", re.I)


def _freetext_recipe(soup: BeautifulSoup) -> tuple[list[str], list[str]]:
    """Older posts: headings named Ingredients and Instructions/Directions inside section#wysiwyg."""
    section = soup.find("section", id="wysiwyg")
    if not section:
        return [], []
    ingredients: list[str] = []
    steps: list[str] = []
    mode = None
    for el in section.find_all(["h2", "h3", "h4", "p", "li"]):
        text = clean(el.get_text(" "))
        if not text:
            continue
        is_bold_p = el.name == "p" and el.find(["strong", "b"]) and len(text) < 40
        if el.name in ("h2", "h3", "h4") or is_bold_p:
            if _STEP_HEAD.search(text):
                mode = "steps"
                continue
            if _ING_HEAD.search(text):
                mode = "ingredients"
                continue
            if el.name == "h2":
                mode = None
                continue
            # A minor heading inside a list (for example "Fruit", "Topping") is a
            # sub-section label. Keep it as a line, as the structured layout does.
        if el.name == "p" and el.find_parent("li"):
            continue
        if mode == "ingredients":
            ingredients.append(text)
        elif mode == "steps":
            steps.append(text)
    return ingredients, steps


def _image(soup: BeautifulSoup) -> str:
    tag = soup.find("meta", attrs={"property": "og:image"})
    return tag["content"] if tag and tag.has_attr("content") else ""


def export_recipes() -> tuple[int, list[str]]:
    rows = [r for r in read_csv("resources-themes.csv") if r["type"] == "Recipe"]
    items, skipped, excluded = [], [], []
    for r in rows:
        if r["url"] in EXCLUDED.get("recipes.json", set()):
            excluded.append(r["url"])
            continue
        soup = cached_html(r["url"])
        if soup is None:
            skipped.append(f"{r['url']} (not cached)")
            continue
        ingredients, steps = _structured_recipe(soup)
        layout = "structured"
        if not ingredients or not steps:
            ingredients, steps = _freetext_recipe(soup)
            layout = "free text"
        if not ingredients or not steps:
            skipped.append(f"{r['url']} (no ingredients or steps found)")
            continue
        items.append(
            {
                "title": r["title"],
                "url": r["url"],
                "date": iso_date(r["date"]),
                "ingredients": ingredients,
                "steps": steps,
                "image_url": _image(soup),
                "parsed_from": layout,
            }
        )
    write(
        "recipes.json",
        max(r["crawl_date"] for r in rows),
        "https://ifanca.org/resources/ (type: Recipe)",
        items,
        {"recipes_in_listing": len(rows), "recipes_skipped": len(skipped), "recipes_excluded": len(excluded)},
    )
    return len(items), skipped + [f"{u} (excluded, see crawl/app_exclusions.csv)" for u in excluded]


# ---------- articles ----------

def _body_text(soup: BeautifulSoup) -> str:
    section = soup.find("section", id="wysiwyg")
    return clean(section.get_text(" ")) if section else ""


def export_articles() -> int:
    rows = [r for r in read_csv("resources-themes.csv") if r["type"] != "Recipe"]
    items = []
    for r in rows:
        soup = cached_html(r["url"])
        body = _body_text(soup) if soup else ""
        items.append(
            {
                "title": r["title"],
                "url": r["url"],
                "type": r["type"],
                "theme": r["theme"],
                "date": iso_date(r["date"]),
                "first_40_words": first_words(body or r["opening_text"]),
            }
        )
    return write(
        "articles.json",
        max(r["crawl_date"] for r in rows),
        "https://ifanca.org/resources/ (all types except Recipe)",
        items,
        {"theme_note": "Themes come from keyword rules in crawl/themes.py and are approximate."},
    )


# ---------- article bodies ----------

INLINE = {"span", "strong", "em", "b", "i", "a", "u", "sup", "sub", "small", "font", "mark", "code", "abbr", "cite", "s"}
SKIP = {"script", "style", "noscript", "iframe", "svg", "form", "button", "input", "select", "textarea"}
HEADING = {"h1": "h2", "h2": "h2", "h3": "h3", "h4": "h4", "h5": "h5", "h6": "h5"}


def _inline_text(el) -> str:
    """Text as a browser shows it: tags add no spaces, <br> is a line break. Empty lines are dropped."""
    from bs4 import NavigableString, Comment

    parts: list[str] = []
    for d in el.descendants:
        if isinstance(d, Comment):
            continue
        if isinstance(d, NavigableString):
            if not any(p.name in SKIP for p in d.parents if p is not el):
                parts.append(str(d))
        elif d.name == "br":
            parts.append("\n")
    lines = [clean(line) for line in "".join(parts).split("\n")]
    return "\n".join(line for line in lines if line)


def _article_image(img, page_url: str) -> dict | None:
    from urllib.parse import urljoin

    src = img.get("src") or img.get("data-src") or img.get("data-lazy-src") or ""
    if not src or src.startswith("data:"):
        return None
    return {"type": "img", "src": urljoin(page_url, src), "alt": clean(img.get("alt", ""))}


def article_blocks(section, page_url: str) -> list[dict]:
    """Paragraphs, headings, lists, tables, quotes, and images of an article body, in order."""
    from bs4 import NavigableString, Comment

    blocks: list[dict] = []
    pending: list[str] = []

    def flush():
        text = "\n".join(line for line in (clean(x) for x in "".join(pending).split("\n")) if line)
        if text:
            blocks.append({"type": "p", "text": text})
        pending.clear()

    def walk(node):
        for child in node.children:
            if isinstance(child, Comment):
                continue
            if isinstance(child, NavigableString):
                pending.append(str(child))
                continue
            name = child.name
            if name in SKIP:
                continue
            if name == "br":
                pending.append("\n")
            elif name in INLINE and not child.find(["p", "div", "img", "ul", "ol", "table", "h1", "h2", "h3", "h4", "h5", "h6", "figure", "blockquote"]):
                pending.append(_inline_text(child).replace("\n", "\n"))
            elif name in HEADING:
                flush()
                text = _inline_text(child)
                if text:
                    blocks.append({"type": HEADING[name], "text": text})
            elif name in ("ul", "ol"):
                flush()
                items = [t for t in (_inline_text(li) for li in child.find_all("li", recursive=False)) if t]
                if items:
                    blocks.append({"type": name, "items": items})
            elif name == "table":
                flush()
                rows = [[_inline_text(c) for c in tr.find_all(["td", "th"], recursive=False)] for tr in child.find_all("tr")]
                rows = [r for r in rows if any(r)]
                if rows:
                    blocks.append({"type": "table", "rows": rows})
            elif name == "blockquote":
                flush()
                text = _inline_text(child)
                if text:
                    blocks.append({"type": "quote", "text": text})
            elif name == "figure":
                flush()
                for img in child.find_all("img"):
                    b = _article_image(img, page_url)
                    if b:
                        blocks.append(b)
                cap = child.find("figcaption")
                if cap and _inline_text(cap):
                    blocks.append({"type": "caption", "text": _inline_text(cap)})
            elif name == "img":
                flush()
                b = _article_image(child, page_url)
                if b:
                    blocks.append(b)
            elif name == "hr":
                flush()
                blocks.append({"type": "hr"})
            elif name == "p" and not child.find(["img", "ul", "ol", "table", "div", "figure"]):
                flush()
                text = _inline_text(child)
                if text:
                    blocks.append({"type": "p", "text": text})
            else:
                flush()
                walk(child)
                flush()

    walk(section)
    flush()
    return blocks


def _block_words(blocks: list[dict]) -> str:
    out = []
    for b in blocks:
        if b["type"] in ("p", "h2", "h3", "h4", "h5", "quote", "caption"):
            out.append(b["text"])
        elif b["type"] in ("ul", "ol"):
            out.extend(b["items"])
        elif b["type"] == "table":
            out.extend(c for r in b["rows"] for c in r)
    return re.sub(r"\s+", "", "".join(out))


def _section_words(section) -> str:
    from bs4 import NavigableString, Comment

    parts = [
        str(d) for d in section.descendants
        if isinstance(d, NavigableString) and not isinstance(d, Comment) and not any(p.name in SKIP for p in d.parents)
    ]
    return re.sub(r"\s+", "", clean("".join(parts)))


def export_article_bodies() -> int:
    """One file per article: app/public/data/articles/<slug>.json. Stops if any article's text differs from its page."""
    out_dir = OUT_DIR / "articles"
    out_dir.mkdir(exist_ok=True)
    rows = [r for r in read_csv("resources-themes.csv") if r["type"] != "Recipe"]
    written = 0
    for r in rows:
        soup = cached_html(r["url"])
        section = soup.find("section", id="wysiwyg") if soup else None
        if section is None:
            continue
        blocks = article_blocks(section, r["url"])
        if _block_words(blocks) != _section_words(section):
            raise SystemExit(f"article text does not match the page: {r['url']}")
        slug = r["url"].rstrip("/").split("/")[-1]
        payload = {
            "url": r["url"],
            "title": r["title"],
            "type": r["type"],
            "date": iso_date(r["date"]),
            "crawl_date": r["crawl_date"],
            "note": NOTE,
            "blocks": blocks,
        }
        (out_dir / f"{slug}.json").write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        written += 1
    print(f"articles checked: {written}")
    return written


# ---------- FAQs ----------

def _flat(fragment: str) -> str:
    """Answer HTML to plain text. Tags become spaces. Used for the answer and for each block."""
    fragment = re.sub(r"</(li|p)>|<br\s*/?>", "\n", fragment)
    return clean(re.sub(r"<[^>]+>", " ", fragment))


def _blocks(answer_html: str) -> list[dict]:
    """Paragraph and list structure of an answer, from the cached HTML. Formatting only.

    Lists come from <ul> and <ol>. Other text is split into paragraphs at <p> tags and blank lines,
    which is how WordPress stores paragraphs. The words are the same as in "answer".
    """
    blocks: list[dict] = []
    for part in re.split(r"(<(?:ul|ol)\b[^>]*>.*?</(?:ul|ol)>)", answer_html, flags=re.S):
        m = re.match(r"<(ul|ol)\b", part)
        if m:
            items = [_flat(li) for li in re.findall(r"<li\b[^>]*>(.*?)</li>", part, flags=re.S)]
            blocks.append({"type": m.group(1), "items": [i for i in items if i]})
            continue
        for para in re.split(r"</?p\b[^>]*>|\n\s*\n", part):
            text = _flat(para)
            if text:
                blocks.append({"type": "p", "text": text})
    return blocks


def _block_text(blocks: list[dict]) -> str:
    return " ".join(b["text"] if b["type"] == "p" else " ".join(b["items"]) for b in blocks)


def load_faqs() -> tuple[list[dict], str]:
    faqs, dates = [], []
    for path in sorted((RAW_DIR / "faq").glob("page_*.json")):
        dates.append(file_date(path))
        for post in json.loads(path.read_text(encoding="utf-8"))["posts"].values():
            answer = _flat(post["answer"])
            blocks = _blocks(post["answer"])
            if _block_text(blocks) != answer:
                raise SystemExit(f"FAQ blocks do not match the answer text: {post['tocopylink']}")
            faqs.append(
                {
                    "question": clean(post["question"]),
                    "answer": answer,
                    "blocks": blocks,
                    "url": post["tocopylink"],
                }
            )
    return faqs, max(dates)


def export_faqs() -> int:
    faqs, crawl_date = load_faqs()
    return write("faqs.json", crawl_date, "https://ifanca.org/faqs/", faqs)


# ---------- ingredients ----------

# FAQ statements, quoted word for word. Status follows the quoted sentence.
# Each tuple: (ingredient name, status, FAQ url, exact quote).
FAQ = "https://ifanca.org/faqs/"
FAQ_STATEMENTS = [
    ("Mono and diglycerides", DEPENDS, FAQ + "are-mono-and-diglycerides-halal/",
     "Mono and diglycerides can be derived from animal or vegetable sources. When derived from vegetable sources, they are halal. When derived from animal sources, they are questionable."),
    ("Yellow No. 5", DEPENDS, FAQ + "is-yellow-no-5-halal/",
     "Yellow No. 5 and all other numbered dyes (colors) are made from petrochemicals. In their pure form, they are halal. However, when used in food products they may be mixed with other doubtful or haram ingredients, such as gelatin."),
    ("Chocolate liquor", HALAL, FAQ + "is-chocolate-liquor-haram/",
     "It does not contain any alcohol, so it is not haram."),
    ("Lecithin", DEPENDS, FAQ + "is-lecithin-halal/",
     "If the lecithin is derived from plants, egg yolks or halal animals slaughtered according to Islamic law, it is Halal. Otherwise it is not."),
    ("Cheese", MASHBOOH, FAQ + "isnt-all-cheese-halal/",
     "Today, most cheeses in the North American markets are questionable."),
    ("Pepsin", HARAM, FAQ + "isnt-all-cheese-halal/",
     "The enzyme derived from pigs is called pepsin and is haram."),
    ("Lipase", DEPENDS, FAQ + "isnt-all-cheese-halal/",
     "Another enzyme derived from pigs or small cattle is lipase. (Lipase can also be made by microorganisms, which is halal.)"),
    ("Microbial enzymes", HALAL, FAQ + "isnt-all-cheese-halal/",
     "Microbial enzymes are not derived from meat and are halal."),
    ("Rennet", DEPENDS, FAQ + "what-is-the-source-of-rennet/",
     "If the calf is slaughtered according to Islamic requirements, the rennet is halal. Otherwise, it is not."),
    ("Chymosin (produced using biotechnology)", HALAL, FAQ + "what-is-the-source-of-rennet/",
     "Chymosin produced using biotechnology is halal."),
    ("Gelatin", DEPENDS, FAQ + "may-we-eat-gelatin/",
     "If the word gelatin appears on a label without reference to its source, it is generally derived from pig skins and cattle bones, so it must be avoided. It is possible to produce halal gelatin by using the bones and hides of halal slaughtered cattle."),
    ("Gelatin", DEPENDS, FAQ + "are-kosher-products-halal/",
     "For Muslims, if gelatin is prepared from swine it is haram. Even if gelatin is prepared from cows that are not zabiha, many scholars consider it haram."),
    ("Alcoholic drinks and intoxicants", HARAM, FAQ + "are-kosher-products-halal/",
     "Islam prohibits all intoxicants, including alcohols, liquors and wines"),
    ("Gelatin", MASHBOOH, FAQ + "what-is-halal/",
     "Foods containing ingredients such as gelatin, enzymes, emulsifiers, and flavors are questionable (mashbooh), because the origin of these ingredients or components there of, may be haram"),
    ("Enzymes", MASHBOOH, FAQ + "what-is-halal/",
     "Foods containing ingredients such as gelatin, enzymes, emulsifiers, and flavors are questionable (mashbooh), because the origin of these ingredients or components there of, may be haram"),
    ("Emulsifiers", MASHBOOH, FAQ + "what-is-halal/",
     "Foods containing ingredients such as gelatin, enzymes, emulsifiers, and flavors are questionable (mashbooh), because the origin of these ingredients or components there of, may be haram"),
    ("Artificial and natural flavors", MASHBOOH, FAQ + "what-is-halal/",
     "Foods containing ingredients such as gelatin, enzymes, emulsifiers, and flavors are questionable (mashbooh), because the origin of these ingredients or components there of, may be haram"),
    ("Pork", HARAM, FAQ + "what-is-halal/",
     "All foods are considered halal except the following sources: Swine/Pork and its by-products"),
    ("Alcoholic drinks and intoxicants", HARAM, FAQ + "what-is-halal/",
     "Alcoholic drinks and intoxicants"),
    ("Blood and blood by-products", HARAM, FAQ + "what-is-halal/",
     "Blood and blood by-products"),
]

# Group the different spellings IFANCA uses for the same ingredient. Spelling
# variants only. Different substances (for example E-471 and mono and
# diglycerides) are never merged, because that would add knowledge.
ALIASES = {
    "mono & diglycerides": "Mono and diglycerides",
    "mono/diglycerides": "Mono and diglycerides",
    "artificial & natural flavorings": "Artificial and natural flavors",
    "artificial/natural flavors": "Artificial and natural flavors",
    "natural & artificial flavors": "Artificial and natural flavors",
    "natural flavors": "Artificial and natural flavors",
    "artificial flavors": "Artificial and natural flavors",
    "flavors": "Artificial and natural flavors",
    "flavorings": "Artificial and natural flavors",
    "artificial & natural colorings": "Artificial and natural colorings",
}


def canonical(name: str) -> str:
    return ALIASES.get(name.lower(), name[:1].upper() + name[1:])


def _guide_lines(url: str) -> tuple[list[str], str]:
    soup = cached_html(url)
    if soup is None:
        raise SystemExit(f"Ingredient source not cached: {url}")
    lines = [clean(x) for x in soup.find("section", id="wysiwyg").get_text("\n").split("\n")]
    title = soup.find("h1").get_text(strip=True)
    return [x for x in lines if x], title


def guide_statements() -> list[dict]:
    """Halal Shopper's Guide to Ingredients (2011): two labeled lists."""
    lines, title = _guide_lines(INGREDIENT_GUIDE_URL)
    sections = [
        ("Haram/Avoid", HARAM, "Investigate Further (Some Questionable Ingredients)"),
        ("Investigate Further (Some Questionable Ingredients)", MASHBOOH, "Concerns About Eating Out"),
    ]
    out = []
    for heading, status, end in sections:
        start = lines.index(heading) + 1
        stop = lines.index(end)
        for item in lines[start:stop]:
            out.append({
                "name": canonical(item), "status": status, "ifanca_label": heading,
                "source_text": item, "context": f'Listed under "{heading}"',
                "url": INGREDIENT_GUIDE_URL, "source_title": title, "source_date": "2011-09-21",
            })
    return out


def quick_reference_statements() -> list[dict]:
    """Halal Shopper's Quick Reference Guide to Products (2012): product rows of mashbooh examples."""
    lines, title = _guide_lines(QUICK_REFERENCE_URL)
    label = "Examples of Mashbooh* (Doubtful) Ingredients"
    assert label in lines, "Quick reference label not found"
    start = lines.index("Call and confirm with the manufacturer.") + 1
    stop = next(i for i, x in enumerate(lines) if x.startswith("Post this on your fridge"))
    rows = lines[start:stop]
    out = []
    for product, row in zip(rows[0::2], rows[1::2]):
        # "Vitamin A, B2, C, D" is one listing, not four ingredients named "B2", "C", "D".
        names = [n.strip() for n in row.split(",")]
        if "Vitamin A" in names:
            i = names.index("Vitamin A")
            names = names[:i] + [", ".join(names[i:])]
        # The Candy row prints "Whey Natural & Artificial Flavors" with no comma.
        names = [p for n in names for p in (["Whey", "Natural & Artificial Flavors"]
                                            if n == "Whey Natural & Artificial Flavors" else [n])]
        for name in names:
            out.append({
                "name": canonical(name), "status": MASHBOOH, "ifanca_label": label,
                "source_text": row, "context": f'Listed for "{product}" under "{label}"',
                "url": QUICK_REFERENCE_URL, "source_title": title, "source_date": "2012-04-25",
            })
    return out


def faq_statements() -> list[dict]:
    faqs, _ = load_faqs()
    by_url = {f["url"]: f for f in faqs}
    out = []
    for name, status, url, quote in FAQ_STATEMENTS:
        faq = by_url[url]
        if quote not in faq["answer"]:
            raise SystemExit(f"Quote not found word for word in {url}: {quote[:60]}")
        out.append({
            "name": name, "status": status, "ifanca_label": "",
            "source_text": quote, "context": f'FAQ: "{faq["question"]}"',
            "url": url, "source_title": faq["question"], "source_date": "",
        })
    return out


def export_ingredients() -> int:
    statements = faq_statements() + guide_statements() + quick_reference_statements()
    for s in statements:
        assert s["status"] in (HALAL, HARAM, MASHBOOH, DEPENDS), s
    # Group case-insensitively. The display name is the first spelling seen (FAQs come first).
    grouped: dict[str, list[dict]] = {}
    display: dict[str, str] = {}
    for s in statements:
        key = s["name"].lower()
        display.setdefault(key, s["name"])
        grouped.setdefault(key, []).append({k: v for k, v in s.items() if k != "name"})
    items = []
    for key in sorted(grouped):
        name, stmts = display[key], grouped[key]
        statuses = sorted({s["status"] for s in stmts})
        items.append({
            "name": name,
            # Only set a single status when every IFANCA source agrees. Otherwise
            # the app must show each statement, because choosing one would be a ruling.
            "status": statuses[0] if len(statuses) == 1 else None,
            "sources_disagree": len(statuses) > 1,
            "statuses": statuses,
            "statements": stmts,
        })
    _, faq_date = load_faqs()
    return write(
        "ingredients.json",
        faq_date,
        "IFANCA FAQs, Halal Shopper's Guide to Ingredients (2011), Halal Shopper's Quick Reference Guide to Products (2012)",
        items,
        {
            "status_values": [HALAL, HARAM, MASHBOOH, DEPENDS],
            "scope_note": (
                "Only ingredients IFANCA names in these sources. Status is IFANCA's stated status. "
                "'Investigate Further' and 'Examples of Mashbooh (Doubtful) Ingredients' are recorded as mashbooh, "
                "following IFANCA's FAQ definition of mashbooh as doubtful or questionable. "
                "An ingredient that is not in this file has no recorded status. It is not halal by default."
            ),
            "statement_count": len(statements),
        },
    )


def write_meta() -> None:
    """A small index of the data files (crawl date and count), so the app can show dates without loading them."""
    files = {}
    for name in ("products.json", "ingredients.json", "faqs.json", "recipes.json", "articles.json"):
        data = json.loads((OUT_DIR / name).read_text(encoding="utf-8"))
        files[name] = {"crawl_date": data["crawl_date"], "count": data["count"], "source": data["source"]}
    payload = {"note": NOTE, "files": files}
    (OUT_DIR / "meta.json").write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")


def main() -> None:
    counts = {"products.json": export_products()}
    n_recipes, skipped = export_recipes()
    counts["recipes.json"] = n_recipes
    counts["articles.json"] = export_articles()
    counts["articles/*.json"] = export_article_bodies()
    counts["faqs.json"] = export_faqs()
    counts["ingredients.json"] = export_ingredients()
    write_meta()
    for name, n in counts.items():
        print(f"{name:18} {n:>6}")
    print(f"recipes skipped: {len(skipped)}")
    for s in skipped:
        print("  ", s)


if __name__ == "__main__":
    main()
