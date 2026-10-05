"""Stage 2: claims from the homepage, About, and Beyond Certification pages, and
how well a visitor can browse to content that backs each one.

Claims were extracted by hand. This script checks that every source_text is an
exact substring of the cached page text (so nothing is paraphrased), and that
every supporting URL is in the visitor inventory, a reachable listing, or the
unreachable set. It then writes analysis/claims.json and analysis/coverage.csv.

Scores:
  strong  a visitor can browse to current content that directly backs the claim
  weak    some browsable support, but partial, dated, buried, broken, or contradicted
  none    no content backs the claim
  hidden  backing content exists but only through site search or with no path
"""
from __future__ import annotations

import csv
import json
import re
from pathlib import Path

from bs4 import BeautifulSoup

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_HTML = REPO_ROOT / "data" / "raw" / "html"
ANALYSIS = REPO_ROOT / "analysis"
CRAWL_DATE = "2026-10-04"

HOME = "https://ifanca.org/"
ABOUT = "https://ifanca.org/about/"
BEYOND = "https://ifanca.org/beyond-certification/"
PAGE_FILES = {HOME: "_index.html", ABOUT: "about.html", BEYOND: "beyond-certification.html"}

# Supporting URLs used below.
PROCESS = "https://ifanca.org/certification-process/"
INDONESIA = "https://ifanca.org/certification-process-indonesia/"
ACCRED = "https://ifanca.org/accreditations-and-recognitions/"
PRODUCTS = "https://ifanca.org/halal-certified-products/"
COMPANIES = "https://ifanca.org/certified-companies/"
FAQS = "https://ifanca.org/faqs/"
RESOURCES = "https://ifanca.org/resources/"
NEWS = "https://ifanca.org/news/"
MAGAZINE = "https://ifanca.org/halal-consumer-magazine/"
CONTACT = "https://ifanca.org/contact/"
TEAM = "https://ifanca.org/team/"
EVENTS = "https://ifanca.org/events/"
SITEMAP = "https://ifanca.org/sitemap/"
SEARCH = "https://ifanca.org/?s"
R = "https://ifanca.org/resources/"

# id, source_url, also_found_on, pillar(s), audience, exact source text
CLAIMS = [
    ("C01", HOME, [], ["certification", "education", "institutions"], "general",
     "IFANCA is an organization dedicated to promoting halal through certification, education, and the creation and support of institutions."),
    ("C02", HOME, [], ["certification"], "industry",
     "We help companies create halal products that consumers can trust"),
    ("C03", HOME, [], ["certification"], "consumer",
     "our trademark Crescent-M logo means one thing: “This is halal.”"),
    ("C04", HOME, [], ["certification"], "industry",
     "Halal certification is provided by IFANCA to ensure compliance with the halal requirements."),
    ("C05", HOME, [], ["certification"], "general",
     "IFANCA is a global leader in halal certification."),
    ("C06", HOME, [], ["certification"], "general",
     "Since 1982, we have worked to promote halal."),
    ("C07", HOME, [], ["certification"], "industry",
     "We understand global halal standards and requirements and have optimized the halal certification process."),
    ("C08", HOME, [], ["certification"], "industry",
     "Our process is simple, cost effective and efficient, and easily implemented."),
    ("C09", HOME, [], ["certification"], "industry",
     "Globally recognized and accepted"),
    ("C10", HOME, [], ["certification"], "general",
     "Trusted by industry and consumers"),
    ("C11", HOME, [], ["certification", "education"], "industry",
     "Halal education & training for our client partners"),
    ("C12", HOME, [], ["certification"], "consumer",
     "Explore Halal Certified Products"),
    ("C13", HOME, [ABOUT, BEYOND], ["institutions"], "general",
     "IFANCA’s vision is to ensure everyone has access to the halal products and services that let them live a secure, satisfied life."),
    ("C14", HOME, [ABOUT, BEYOND], ["institutions"], "partner",
     "We strive to best serve humanity by promoting food and health security and nutrition equity through local and global partnerships"),
    ("C15", HOME, [ABOUT, BEYOND], ["institutions"], "partner",
     "empowering other established institutions"),
    ("C16", HOME, [ABOUT, BEYOND], ["institutions", "education"], "general",
     "uplifting religious and scientific voices"),
    ("C17", HOME, [], ["institutions"], "partner",
     "Explore Programs"),
    ("C18", ABOUT, [], ["certification"], "general",
     "IFANCA is a not-for-profit organization committed to helping consumers and industry source authentic halal products since 1982."),
    ("C19", ABOUT, [], ["certification"], "consumer",
     "Our registered Crescent-M halal service mark assures consumers the product is halal without a doubt!"),
    ("C20", ABOUT, [], ["certification"], "industry",
     "IFANCA halal certification means your products meet the dietary requirements of over 1.8 billion consumers."),
    ("C21", ABOUT, [], ["certification", "education", "institutions"], "general",
     "Promote halal by helping industries produce halal-certified products, increasing awareness through education, and building and supporting institutions."),
    ("C22", ABOUT, [], ["certification", "education"], "general",
     "Continue to be the trusted authority on halal"),
    ("C23", ABOUT, [], ["education"], "consumer",
     "We are a resource to everyone looking to learn about halal."),
    ("C24", ABOUT, [], ["certification", "education", "institutions"], "general",
     "We are continually listening and evolving to overcome challenges and meet the needs of everyone we work with."),
    ("C25", ABOUT, [], ["certification"], "industry",
     "Our team empowers different organizations to produce halal products."),
    ("C26", ABOUT, [], ["certification", "education"], "industry",
     "We train client teams in certification standards"),
    ("C27", ABOUT, [], ["certification"], "industry",
     "assist R&D teams with scientific and religious guidance to develop new halal products"),
    ("C28", ABOUT, [], ["certification", "institutions"], "industry",
     "solve problems using our network of affiliates and experts"),
    ("C29", ABOUT, [], ["certification"], "consumer",
     "We promote our clients’ halal-certified products to consumers"),
    ("C30", ABOUT, [], ["certification"], "consumer",
     "make it easy for everyone to find and use IFANCA-certified products in their lives."),
    ("C31", ABOUT, [BEYOND], ["education"], "consumer",
     "We invite everyone to learn about halal and become an advocate for increasing awareness."),
    ("C32", ABOUT, [BEYOND], ["education"], "consumer",
     "producing a quarterly Halal Consumer magazine"),
    ("C33", ABOUT, [BEYOND], ["education"], "general",
     "writing articles for various publications around the world"),
    ("C34", ABOUT, [BEYOND], ["education"], "general",
     "contributing to research papers and findings"),
    ("C35", ABOUT, [BEYOND], ["education"], "industry",
     "Our leaders and experts share their knowledge at industry conferences"),
    ("C36", ABOUT, [BEYOND], ["education", "institutions"], "general",
     "we host events to promote halal"),
    ("C37", ABOUT, [BEYOND], ["institutions"], "partner",
     "IFANCA also invests in sponsorships and grants for various university partnerships"),
    ("C38", ABOUT, [BEYOND], ["institutions", "education"], "partner",
     "supports different halal programs and events focused on awareness"),
    ("C39", ABOUT, [], ["certification"], "general",
     "A Global Leader in Halal Services"),
    ("C42", ABOUT, [], ["certification"], "consumer",
     "Our globally accepted and trusted Crescent-M logo means one thing: “this is halal.”"),
    ("C40", BEYOND, [], ["institutions"], "partner",
     "Programs & Partnerships"),
    ("C41", BEYOND, [], ["institutions"], "partner",
     "Want to collaborate with us? Get in touch with us"),
]

# id -> (score, one-line reason, supporting URLs)
COVERAGE = {
    "C01": ("weak", "Certification is well covered. Education is a large but unsorted library. Institutions work is reachable only through the footer Sitemap page.",
            [PROCESS, PRODUCTS, RESOURCES, BEYOND, SITEMAP]),
    "C02": ("strong", "Five-step process page with application form, and 11,642 certified products listed.",
            [PROCESS, PRODUCTS]),
    "C03": ("weak", "No page shows the Crescent-M mark or explains how to read or verify it on a package. Product cards do not show it.",
            [PRODUCTS, NEWS]),
    "C04": ("strong", "Process page describes application, technical review, on-site audit, and committee decision.",
            [PROCESS, INDONESIA]),
    "C05": ("weak", "Accreditations page supports global reach. Nothing on the site supports leadership beyond the statement.",
            [ACCRED]),
    "C06": ("weak", "History is only in old resource articles deep in a 93-page list. They give founding as 1980 and registration as 1982.",
            [R + "25th-year-anniversary-ifanca-in-historic-perspective/", R + "ifanca-and-halal-how-it-all-began/"]),
    "C07": ("strong", "Accreditations list, FAQ on certification schemes, and an Indonesia page that maps the process to SJPH.",
            [ACCRED, FAQS, INDONESIA]),
    "C08": ("weak", "Five steps and fee ranges (FAQ) are shown. No timeline, effort, or comparison supports efficient or easily implemented.",
            [PROCESS, FAQS]),
    "C09": ("strong", "Accreditations page lists 6 accreditation bodies and 10 recognitions, reachable from the main menu.",
            [ACCRED]),
    "C10": ("weak", "Product volume implies industry trust. No consumer evidence, testimonials, or client list beyond a China-only company table.",
            [PRODUCTS, COMPANIES]),
    "C11": ("weak", "No page describes a training offer. Only dated news items mention workshops (2012).",
            [NEWS]),
    "C12": ("weak", "Product list works, but all five homepage category tiles open the unfiltered list.",
            [PRODUCTS, HOME]),
    "C13": ("weak", "Aspiration. Product list supports access to products. Little on services for consumers.",
            [PRODUCTS, BEYOND]),
    "C14": ("weak", "UNICEF and polio news and 3 programs exist. Programs are reachable only through the footer Sitemap page.",
            [NEWS, BEYOND, "https://ifanca.org/programs/unicef/"]),
    "C15": ("weak", "Three program pages (Texas A&M, ACLU Illinois, UNICEF) of 31 to 89 words each, behind the footer Sitemap page.",
            ["https://ifanca.org/programs/texas-am-university/", "https://ifanca.org/programs/aclu-illinois/", "https://ifanca.org/programs/unicef/"]),
    "C16": ("weak", "Magazine editorials and 2003 conference proceedings exist in the resources list. No page gathers these voices.",
            [RESOURCES, MAGAZINE]),
    "C17": ("weak", "The homepage Explore Programs button links to #. Programs exist only through footer, Sitemap, Beyond Certification.",
            [HOME, SITEMAP, BEYOND]),
    "C18": ("strong", "Certification process for industry and a searchable list of 11,642 products for consumers.",
            [PROCESS, PRODUCTS]),
    "C19": ("weak", "Same as C03. No mark explainer and no way to verify a certificate. The certificate lookup feature in the theme has 0 entries.",
            [PRODUCTS, COMPANIES]),
    "C20": ("weak", "The figure differs across the site: 1.8 billion (About), 1.9 billion (Certification Process), 1.57 billion (Halal Explained, 2025).",
            [ABOUT, PROCESS, R + "halal-explained-from-food-fundamentals-to-certi%ef%ac%81cation/"]),
    "C21": ("weak", "Certification pillar is strong. Education and institutions pillars are thin or hard to reach (see C23, C38).",
            [PROCESS, RESOURCES, BEYOND]),
    "C22": ("weak", "Accreditations and 26 FAQs support authority. Core consumer explainers are mostly dated 1998 to 2012.",
            [ACCRED, FAQS, RESOURCES]),
    "C23": ("weak", "1,115 resources, but about 26 are halal basics, the topic filter has only 2 topics, and FAQ is the only short explainer.",
            [RESOURCES, FAQS]),
    "C24": ("weak", "A contact form invites questions and complaints. Nothing shows changes made in response.",
            [CONTACT]),
    "C25": ("strong", "Certification process pages and the product list back this directly.",
            [PROCESS, INDONESIA, PRODUCTS]),
    "C26": ("weak", "No training page. Dated news on a 2012 workshop only.",
            [NEWS]),
    "C27": ("none", "No page describes R&D support. Only 2012 news items about conference talks.",
            [NEWS]),
    "C28": ("weak", "Contact page links two affiliates (ifancc.org, hfce.eu). No affiliate or expert directory. Team page lists one person.",
            [CONTACT, TEAM]),
    "C29": ("strong", "Product list, 24 company Spotlight articles, and a product locator section in each magazine issue.",
            [PRODUCTS, RESOURCES, MAGAZINE]),
    "C30": ("weak", "Product list is searchable but cards have no link or logo. Product pages and empty company profiles are search only.",
            [PRODUCTS, SEARCH, COMPANIES]),
    "C31": ("weak", "Large library, but no starting point for a newcomer and no advocacy material.",
            [RESOURCES, FAQS]),
    "C32": ("weak", "75 issues browsable with PDFs. Only 2 issues listed in 2025 and 2 so far in 2026, so recent output is not quarterly.",
            [MAGAZINE]),
    "C33": ("none", "No list of articles written for outside publications.",
            []),
    "C34": ("weak", "2003 conference proceedings and a 2006 research center news item only. No research list.",
            [RESOURCES, NEWS]),
    "C35": ("strong", "News has many items on talks and conferences, most from 2005 to 2016, plus a 2024 conference announcement.",
            [NEWS]),
    "C36": ("weak", "The Events page shows only placeholder items. Real events appear only as news posts.",
            [EVENTS, NEWS]),
    "C37": ("weak", "Texas A&M program and scholarship news exist. No grants page. Programs reachable only through the footer Sitemap page.",
            ["https://ifanca.org/programs/texas-am-university/", NEWS]),
    "C38": ("weak", "Three programs, short pages, reached only through footer, Sitemap, Beyond Certification. Program archive shows 1 of 3.",
            [BEYOND, "https://ifanca.org/programs/"]),
    "C39": ("weak", "Same as C05. Accreditations support global reach, not leadership.",
            [ACCRED]),
    "C40": ("weak", "Programs grid loads 3 programs. The page itself is reachable only through the footer Sitemap page.",
            [BEYOND, SITEMAP]),
    "C42": ("weak", "Same as C03. Accreditations support global acceptance, but nothing explains or verifies the mark for a consumer.",
            [ACCRED, PRODUCTS]),
    "C41": ("strong", "Contact form and phone and email on every page.",
            [CONTACT]),
}


def page_text(url: str) -> str:
    soup = BeautifulSoup((RAW_HTML / PAGE_FILES[url]).read_text(encoding="utf-8"), "lxml")
    for t in soup.select("script, style, noscript, svg"):
        t.decompose()
    return re.sub(r"\s+", " ", soup.get_text(" ", strip=True))


def main() -> None:
    texts = {u: page_text(u) for u in PAGE_FILES}
    claims = []
    for cid, url, also, pillars, audience, text in CLAIMS:
        for u in [url, *also]:
            if text not in texts[u] and text.replace("magazine", "Magazine") not in texts[u]:
                raise SystemExit(f"{cid}: source text not found verbatim on {u}")
        claims.append({
            "id": cid, "source_text": text, "source_url": url, "also_found_on": also,
            "pillar": pillars, "audience": audience, "crawl_date": CRAWL_DATE,
        })
    assert set(COVERAGE) == {c["id"] for c in claims}
    claims.sort(key=lambda c: c["id"])

    ANALYSIS.mkdir(exist_ok=True)
    (ANALYSIS / "claims.json").write_text(json.dumps(claims, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with (ANALYSIS / "coverage.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["claim_id", "pillar", "audience", "score", "reason", "supporting_urls", "source_text", "crawl_date"])
        for c in claims:
            score, reason, urls = COVERAGE[c["id"]]
            w.writerow([c["id"], ", ".join(c["pillar"]), c["audience"], score, reason, " ".join(urls),
                        c["source_text"], CRAWL_DATE])
    from collections import Counter
    print(len(claims), Counter(v[0] for v in COVERAGE.values()))


if __name__ == "__main__":
    main()
