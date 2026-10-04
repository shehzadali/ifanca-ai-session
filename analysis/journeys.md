# Visitor journeys

Crawl date: 2026-10-04. Walked against the cached site and the Stage 1 visitor map (`data/visitor-inventory.csv`). No live requests were made. Forms were not submitted. Search and filter behavior is taken from the cached responses the pages load.

Result key: **OK** works, **Partial** works with a gap, **Fail** the visitor cannot complete the step.

## Journey 1: A consumer in a grocery store checks whether a product is halal

| Step | What the visitor does | Where | Result | Evidence |
|---|---|---|---|---|
| 1 | Opens ifanca.org on a phone. Sees "Halal for All" and that the Crescent-M logo means "This is halal." | https://ifanca.org/ | OK | Homepage hero text |
| 2 | Taps a category tile such as Food or Beverages. | https://ifanca.org/ | Partial | All five tiles open the unfiltered list of 11,642 products. The category is not applied. |
| 3 | Opens Certified Products from the menu and types the product name in "Search by Product Name". | https://ifanca.org/halal-certified-products/ | OK | Search, company, category, marketplace, and country filters. 12 results per page. |
| 4 | Reads the result card. | same | Partial | Card shows name, company, category, "Sold in", and marketplace. 8,428 of 11,642 products say "Worldwide". No size, barcode, or variant detail to match the package. |
| 5 | Wants proof that the certification is current. | same | Fail | No certificate, issue or expiry date, or Crescent-M image on the card. Cards do not link to a product page. The theme has a certificate lookup template, but the certificates content type has 0 entries. |
| 6 | Checks the mark on the package against the real mark. | whole site | Fail | No page shows the Crescent-M mark or explains how to spot a fake. A news post on fraudulent certificates exists but is not linked from the product list. |
| 7 | Product is not in the list. Looks for what that means. | https://ifanca.org/halal-certified-products/ | Fail | No note says whether absence means not certified, certified by another body, or not listed. |
| 8 | Falls back to reading the ingredient label. | https://ifanca.org/faqs/ and the resources library | Partial | FAQ answers cover lecithin, mono and diglycerides, Yellow No. 5, gelatin, and rennet. The Halal Shopper's Guide to Ingredients (2011) and the Quick Reference Guide (2012) exist, but only in the 1,115-item resources list. Neither is linked from the product list. |

**Where it fails:** steps 5 to 7. The visitor can find a product name but cannot confirm certification or interpret a missing result. This is the main consumer promise on the homepage and About page.

## Journey 2: A parent wants to explain to a child what halal means and why

| Step | What the visitor does | Where | Result | Evidence |
|---|---|---|---|---|
| 1 | Looks on the homepage for "What is halal?" | https://ifanca.org/ | Fail | No link or section explains halal. The "Explore Halal" button goes to the resources library. |
| 2 | Opens Frequently Asked Questions from the menu. | https://ifanca.org/faqs/ | Partial | "What is halal?" answer is 251 words. It defines halal, haram, and mashbooh and lists prohibited sources. Written for adults. |
| 3 | Opens the Resources Library and looks for a beginner or family filter. | https://ifanca.org/resources/ | Fail | Type filter has 9 types. Topic filter has 2 topics (Ingredients 8, Resources 128). 979 of 1,115 items have no topic. No basics, family, or children filter. |
| 4 | Searches the library for children's content. | same | Fail | Titles with "kids" or "children" are about cooking, nutrition, or school lunches (for example "Nutrients for Kids", "A Child's First Fast"). None explains halal to a child. |
| 5 | Looks for the reasons behind halal. | resources library | Partial | Adult articles exist, such as "Why Should Muslims Eat Halal?" (1998) and "Zabihah vs. Halal" (2025). By theme count, about 26 of 1,115 resources are halal basics, and most date from 1998 to 2012. |

**Where it fails:** steps 1, 3, and 4. There is no entry point for a newcomer and nothing written for children. This project does not write religious explanations, so the gap is recorded for IFANCA to fill.

## Journey 3: A food company considers certification

| Step | What the visitor does | Where | Result | Evidence |
|---|---|---|---|---|
| 1 | Reads "Why certify with IFANCA?" on the homepage. | https://ifanca.org/ | OK | Three bullets: globally recognized, trusted, education and training for clients. |
| 2 | Opens Certification Process. | https://ifanca.org/certification-process/ | OK | Five steps from application to committee decision, and an application form on the page. |
| 3 | Looks for cost. | https://ifanca.org/faqs/ | Partial | Fee ranges are in the FAQ answer "What are the fees for certification?" (for example plant registration $2,000 to $2,500). The process page does not link to it. |
| 4 | Looks for how long certification takes. | whole site | Fail | No timeline on any reachable page. |
| 5 | Looks for requirements and documents to prepare. | https://ifanca.org/certification-process-indonesia/, https://ifanca.org/faqs/ | Partial | Indonesia page lists some preparation. FAQ names the schemes followed. No general requirements list. |
| 6 | Checks recognition in target markets. | https://ifanca.org/accreditations-and-recognitions/ | OK | 6 accreditations and 10 recognitions, including BPJPH, JAKIM, and MUIS. |
| 7 | Looks for peer companies. | https://ifanca.org/certified-companies/ | Fail | The menu page lists 471 companies, all in China. The 149 consumer brands in the product filter are not on it. The two lists share no names. The 464 company profiles are search only and hold only a name. |
| 8 | Looks for the training and R&D help that the About page describes. | whole site | Fail | No page describes either service. Only news from 2012 mentions talks and a workshop. |
| 9 | Applies or asks a question. | https://ifanca.org/certification-process/, https://ifanca.org/contact/ | OK | Application form and contact form. Not submitted. |

**Where it fails:** steps 4, 7, and 8. A company can apply, but cannot judge time, see peers in its sector, or learn what support it gets.
