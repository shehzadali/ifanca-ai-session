# What we learned about IFANCA's mission

A one-page summary for the training session. Every quote below is copied word for word from ifanca.org, with the page it came from. The full list is in `analysis/claims.json`, the ratings are in `analysis/coverage.csv`, and the picture is `viz/gap-map.html`.

Copy of the website made on 2026-10-04.

## How we found it

1. Claude read three pages: the homepage, About, and Beyond Certification.
2. It copied every promise IFANCA makes, word for word. A script checked that each one appears exactly on the page. It found 42.
3. It sorted the promises into the three pillars IFANCA names itself.
4. It checked each promise against the website a visitor can actually click through, and rated it.

## The mission in IFANCA's own words

> "IFANCA is an organization dedicated to promoting halal through certification, education, and the creation and support of institutions."
>
> Homepage, https://ifanca.org/

> "IFANCA’s vision is to ensure everyone has access to the halal products and services that let them live a secure, satisfied life."
>
> Homepage, https://ifanca.org/

## The three pillars

| Pillar | What IFANCA says | Promises | Easy to find | Partly | Not found |
|---|---|---|---|---|---|
| Certification | "We help companies create halal products that consumers can trust" | 26 | 7 | 18 | 1 |
| Education | "We are a resource to everyone looking to learn about halal." | 15 | 1 | 13 | 1 |
| Institutions | "We strive to best serve humanity by promoting food and health security and nutrition equity through local and global partnerships" | 14 | 1 | 13 | 0 |

A promise can belong to more than one pillar, so it counts once in each.

## What the ratings mean

- **Easy to find (strong):** a visitor can click through to current content that backs it up.
- **Partly (weak):** some support exists, but it is old, buried, broken, or contradicted.
- **Not found (none):** nothing on the site backs it up.

## What this tells us, in plain words

- **Certification is the strongest pillar.** The certification process, the list of 11,642 certified products, and IFANCA's recognitions are all easy to reach.
- **Education is mostly promised, not delivered online.** There is a lot of material, but it sits in one long library sorted by date, and there is no simple starting point to learn what halal means.
- **Institutions work is almost invisible.** Programs, partnerships, and grants are only reachable through the footer's Sitemap page.

## Two promises nothing backs up

> "assist R&D teams with scientific and religious guidance to develop new halal products"
>
> About, https://ifanca.org/about/

> "writing articles for various publications around the world"
>
> About, https://ifanca.org/about/

## Where this led

These gaps became the user journeys (`analysis/user-journeys.md`), and the journeys became the app's features.
