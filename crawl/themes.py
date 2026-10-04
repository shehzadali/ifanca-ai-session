"""Classify the 1,115 reachable resources into themes from title and opening text.

Inputs: data/resources-listing.csv (visitor listing, type and topic) and the
Stage 1 page files in data/pages/resources__*.md (body text).
Output: data/resources-themes.csv. Each row records the keyword that decided
the theme and whether it came from the title or the opening text, so every
label can be checked by hand.
"""
from __future__ import annotations

import csv
import re
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "data"
OPENING_WORDS = 60

# Checked in this order. First match wins.
RULES: list[tuple[str, list[str]]] = [
    ("ingredients", [
        r"gelatin", r"enzyme", r"e-numbers?", r"additive", r"ingredient", r"vanilla", r"alcohol",
        r"vinegar", r"glycerin", r"flavou?r(ing|s)?\b", r"emulsifier", r"whey", r"rennet", r"capsule",
        r"food labels?", r"clean label", r"nutritional labels", r"sell by", r"use by", r"\bgmo\b", r"l-cysteine", r"collagen",
        r"carmine", r"shellac", r"processing aids", r"root beer", r"cooking wine", r"lard", r"animal fat",
    ]),
    ("halal basics", [
        r"what is halal", r"zabiha", r"halal vs", r"\bharam\b", r"why should muslims eat halal",
        r"halal explained", r"dietary laws", r"islamic perspective", r"halal revisited",
        r"meaning of halal", r"halal and haram", r"slaughter", r"is it halal", r"islamic dietary",
        r"\bdhabiha\b", r"zabee?ha", r"mashbooh", r"halal as a way of life", r"eating out", r"restaurant",
        r"traveling", r"vacationing", r"halal customers",
    ]),
    ("industry and certification", [
        r"certif", r"industry", r"export", r"\bmarkets?\b", r"manufactur", r"supplier", r"standard",
        r"accredit", r"regulat", r"\blaws?\b", r"\btrade\b", r"business", r"entrepren", r"\bmre\b",
        r"audit", r"economy", r"foodservice", r"retail", r"companies", r"company news", r"brand",
        r"traceability", r"supply chain", r"government",
    ]),
    ("community and events", [
        r"conference", r"banquet", r"award", r"\bevents?\b", r"iftar", r"sponsor", r"happenings",
        r"campus", r"universit", r"student", r"webinar", r"workshop", r"partnership", r"unicef",
        r"polio", r"donat", r"charit", r"communit", r"school", r"hospital", r"educat", r"cultur",
        r"scholarship", r"food pantry", r"\bhajj\b",
        r"meals on wheels", r"humanitarian", r"refugee", r"relief", r"volunteer", r"mosque", r"ramadan",
        r"\beid\b", r"hajj", r"celebrat",
    ]),
    ("health and nutrition", [
        r"health", r"nutrition", r"\bdiet", r"vitamin", r"obes", r"diabet", r"exercise", r"fasting",
        r"sleep", r"\bheart\b", r"eczema", r"stress", r"weight", r"wellness", r"food safety", r"immun",
        r"cancer", r"allerg", r"fitness", r"protein", r"calori", r"sugar", r"cholesterol", r"blood",
        r"mental", r"skin", r"bone", r"pregnan", r"breastfeed", r"organic", r"probiotic", r"fiber",
        # Food and wellness features from the magazine.
        r"\bfit\b", r"e\.? ?coli", r"bacteria", r"germs?", r"vegetable", r"fruit", r"grain", r"wheat",
        r"olive", r"\bfigs?\b", r"garlic", r"millet", r"flour", r"spice", r"herb", r"\bteas?\b", r"coffee",
        r"water", r"hydrat", r"breakfast", r"lunch", r"snack", r"\bmeals?\b", r"eating", r"\bfoods?\b",
        r"cook", r"kitchen", r"\bsleep", r"walk", r"yoga", r"therapy", r"medic", r"disease", r"\bkids?\b",
    ]),
]


# Corrections after reading the full article (Stage 2 review of the
# consumer education list). url -> (theme, reason).
OVERRIDES = {
    "https://ifanca.org/resources/gelatin-traceability-from-slaughterhouse-to-capsule/": (
        "industry and certification", "read in full: tells how IFANCA built a halal gelatin supply chain"),
    "https://ifanca.org/resources/does-water-need-to-be-halal-certified/": (
        "ingredients", "read in full: explains processing materials in bottled water for shoppers"),
    "https://ifanca.org/resources/halal-shoppers-quick-reference-guide-to-products/": (
        "ingredients", "read in full: lists doubtful ingredients by product type"),
}


def opening_text(body: str, title: str) -> str:
    """Body text after the page chrome ('Back to All <title> ... Copied!')."""
    text = body.split("Copied!", 1)[1] if "Copied!" in body else body
    return " ".join(text.split()[:OPENING_WORDS])


# Body text mentions many subjects in passing, so the opening-text fallback
# uses only strong, specific signals. Checked in this order.
OPENING_RULES: list[tuple[str, list[str]]] = [
    ("halal basics", [r"what is halal", r"zabee?ha", r"\bharam\b", r"islamic dietary", r"mashbooh"]),
    ("ingredients", [r"gelatin", r"enzyme", r"e-numbers?", r"additives?", r"emulsifier", r"rennet",
                     r"l-cysteine", r"glycerin", r"ingredients? (list|label)"]),
    ("health and nutrition", [r"nutrition", r"vitamin", r"diabet", r"obes", r"cholesterol", r"exercise",
                              r"calori", r"blood pressure", r"immune", r"mental health", r"physical activity"]),
    ("industry and certification", [r"halal certif", r"certified compan", r"halal industry", r"export",
                                    r"manufacturer"]),
    ("community and events", [r"conference", r"banquet", r"scholarship", r"food pantry", r"volunteer",
                              r"iftar", r"fundrais"]),
]
# Magazine editorials and puzzles cover many subjects, so only the title counts.
TITLE_ONLY_TYPES = {"Editorial", "Publisher's Note", "Quarterly", "Puzzle"}


def classify(title: str, opening: str, rtype: str) -> tuple[str, str, str]:
    """Return (theme, matched keyword, where it matched)."""
    if rtype == "Recipe":
        return "recipes", "type=Recipe", "listing type"
    for rules, text, where in ((RULES, title, "title"), (OPENING_RULES, opening, "opening text")):
        if where == "opening text" and rtype == "Spotlight":
            # Spotlights with no clear title signal profile a certified company.
            return "industry and certification", "type=Spotlight (company profile)", "listing type"
        if where == "opening text" and rtype in TITLE_ONLY_TYPES:
            break
        for theme, patterns in rules:
            for pat in patterns:
                m = re.search(pat, text, re.I)
                if m:
                    return theme, m.group(0).lower(), where
    return "other", "", "no match"


def load_bodies() -> dict[str, str]:
    bodies = {}
    for path in (DATA_DIR / "pages").glob("resources__*.md"):
        raw = path.read_text(encoding="utf-8")
        _, front, body = raw.split("---", 2)
        meta = yaml.safe_load(front)
        bodies[meta["url"]] = body.strip()
    return bodies


def main() -> None:
    bodies = load_bodies()
    with (DATA_DIR / "resources-listing.csv").open(encoding="utf-8") as f:
        listing = list(csv.DictReader(f))
    rows = []
    for r in listing:
        opening = opening_text(bodies.get(r["url"], ""), r["title"])
        theme, keyword, where = classify(r["title"], opening, r["type"])
        if r["url"] in OVERRIDES:
            theme, keyword = OVERRIDES[r["url"]]
            where = "manual review"
        rows.append({
            "url": r["url"], "title": r["title"], "type": r["type"], "topic": r["topic"],
            "date": r["date"], "theme": theme, "matched_keyword": keyword, "matched_in": where,
            "opening_text": opening[:300], "crawl_date": r["crawl_date"],
        })
    with (DATA_DIR / "resources-themes.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    missing = sum(1 for r in listing if r["url"] not in bodies)
    print(f"rows {len(rows)}  without cached body {missing}")


if __name__ == "__main__":
    main()
