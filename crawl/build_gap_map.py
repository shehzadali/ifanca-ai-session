"""Build viz/gap-map.html from analysis/claims.json and analysis/coverage.csv.

One page for the training session: every claim IFANCA makes on its homepage, About, and Beyond
Certification pages, grouped by pillar and rated by how well a website visitor can find content that
backs it. All text is copied from the analysis files. Nothing is written by hand.
"""
from __future__ import annotations

import csv
import html
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
claims = {c["id"]: c for c in json.loads((ROOT / "analysis/claims.json").read_text(encoding="utf-8"))}
rows = list(csv.DictReader((ROOT / "analysis/coverage.csv").open(encoding="utf-8")))

PILLARS = ["certification", "education", "institutions"]
SCORES = ["strong", "weak", "none"]

data = []
for r in rows:
    c = claims[r["claim_id"]]
    data.append(
        {
            "id": r["claim_id"],
            "text": c["source_text"],
            "page": c["source_url"],
            "pillars": [p.strip() for p in r["pillar"].split(",")],
            "score": r["score"],
            "reason": r["reason"],
        }
    )

totals = Counter(d["score"] for d in data)
per_pillar = {p: Counter(d["score"] for d in data if p in d["pillars"]) for p in PILLARS}
crawl_date = next(iter(claims.values()))["crawl_date"]


def esc(s: str) -> str:
    return html.escape(s, quote=True)


cells = []
for p in PILLARS:
    items = sorted((d for d in data if p in d["pillars"]), key=lambda d: (SCORES.index(d["score"]), d["id"]))
    cells.append((p, items))

page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>IFANCA Gap Map</title>
<meta name="robots" content="noindex">
<style>
  :root {{
    --surface-0: #f4f3ef; --surface-1: #fcfcfb; --line: #e3e1da;
    --text-primary: #0b0b0b; --text-secondary: #52514e; --text-muted: #6b6a66;
    --good: #0ca30c; --warning: #fab219; --critical: #d03b3b;
    color-scheme: light;
  }}
  @media (prefers-color-scheme: dark) {{
    :root {{
      --surface-0: #111110; --surface-1: #1a1a19; --line: #33332f;
      --text-primary: #ffffff; --text-secondary: #c3c2b7; --text-muted: #a3a29a;
      color-scheme: dark;
    }}
  }}
  * {{ box-sizing: border-box; }}
  body {{ margin: 0; background: var(--surface-0); color: var(--text-primary);
    font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }}
  main {{ max-width: 1100px; margin: 0 auto; padding: 28px 20px 48px; }}
  h1 {{ margin: 0; font-size: 30px; letter-spacing: -0.01em; }}
  .lede {{ margin: 6px 0 0; color: var(--text-secondary); max-width: 760px; }}
  .tiles {{ display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 22px 0; }}
  .tile {{ background: var(--surface-1); border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; }}
  .tile .n {{ font-size: 34px; font-weight: 700; line-height: 1.1; }}
  .tile .l {{ color: var(--text-secondary); font-size: 14px; display: flex; align-items: center; gap: 6px; }}
  .card {{ background: var(--surface-1); border: 1px solid var(--line); border-radius: 14px; padding: 18px; margin-top: 14px; }}
  .card h2 {{ margin: 0 0 4px; font-size: 18px; }}
  .card p.note {{ margin: 0 0 12px; color: var(--text-muted); font-size: 14px; }}
  .legend {{ display: flex; flex-wrap: wrap; gap: 16px; font-size: 14px; color: var(--text-secondary); margin: 6px 0 4px; }}
  .legend span {{ display: inline-flex; align-items: center; gap: 6px; }}
  .sw {{ width: 18px; height: 18px; border-radius: 5px; display: inline-flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; color: #0b0b0b; }}
  .good {{ background: var(--good); color: #fff; }} .warning {{ background: var(--warning); color: #0b0b0b; }} .critical {{ background: var(--critical); color: #fff; }}
  .good.sw, .good.cell {{ color: #fff; }}
  .bars {{ display: grid; gap: 12px; margin-top: 10px; }}
  .bar-row {{ display: grid; grid-template-columns: 130px 1fr 90px; align-items: center; gap: 12px; }}
  .bar-row .name {{ font-weight: 600; text-transform: capitalize; }}
  .bar-row .total {{ color: var(--text-secondary); font-size: 14px; text-align: right; }}
  .bar {{ display: flex; gap: 2px; height: 30px; }}
  .seg {{ height: 100%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; min-width: 26px; }}
  .seg:first-child {{ border-radius: 4px 0 0 4px; }} .seg:last-child {{ border-radius: 0 4px 4px 0; }} .seg:only-child {{ border-radius: 4px; }}
  .grid-row {{ margin-top: 16px; }}
  .grid-row h3 {{ margin: 0 0 8px; font-size: 15px; text-transform: capitalize; color: var(--text-secondary); }}
  .cells {{ display: flex; flex-wrap: wrap; gap: 6px; }}
  .cell {{ width: 52px; height: 52px; border-radius: 8px; border: 2px solid var(--surface-1); display: flex; flex-direction: column;
    align-items: center; justify-content: center; font-size: 12px; font-weight: 700; cursor: default; outline-offset: 2px; color: #0b0b0b; }}
  .cell .i {{ font-size: 15px; line-height: 1; }}
  .cell:hover, .cell:focus {{ box-shadow: 0 0 0 2px var(--text-primary); outline: none; }}
  #tip {{ position: fixed; z-index: 10; max-width: 380px; background: var(--surface-1); color: var(--text-primary);
    border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; box-shadow: 0 10px 30px rgba(0,0,0,.18);
    font-size: 14px; pointer-events: none; display: none; }}
  #tip q {{ display: block; font-size: 15px; margin: 4px 0 8px; quotes: "\\201C" "\\201D"; }}
  #tip .meta {{ color: var(--text-secondary); }}
  details {{ margin-top: 14px; }}
  summary {{ cursor: pointer; font-weight: 600; min-height: 44px; display: flex; align-items: center; }}
  table {{ width: 100%; border-collapse: collapse; font-size: 14px; }}
  th, td {{ text-align: left; vertical-align: top; padding: 8px; border-top: 1px solid var(--line); }}
  th {{ color: var(--text-secondary); font-weight: 600; }}
  a {{ color: inherit; }}
  footer {{ margin-top: 22px; color: var(--text-muted); font-size: 13px; }}
  @media (max-width: 700px) {{
    .tiles {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }}
    .bar-row {{ grid-template-columns: 1fr; gap: 4px; }} .bar-row .total {{ text-align: left; }}
  }}
</style>
</head>
<body>
<main>
  <h1>What IFANCA promises, and what a visitor can find</h1>
  <p class="lede">Every promise on the ifanca.org homepage, About, and Beyond Certification pages, copied word for word.
  Each one is rated by whether a website visitor can browse to content that backs it up.</p>

  <div class="tiles">
    <div class="tile"><div class="n">{len(data)}</div><div class="l">promises found</div></div>
    <div class="tile"><div class="n">{totals['strong']}</div><div class="l"><span class="sw good">&#10003;</span> strong: backed and easy to find</div></div>
    <div class="tile"><div class="n">{totals['weak']}</div><div class="l"><span class="sw warning">~</span> weak: partly backed, dated, or buried</div></div>
    <div class="tile"><div class="n">{totals['none']}</div><div class="l"><span class="sw critical">&#10005;</span> none: nothing backs it</div></div>
  </div>

  <section class="card" aria-labelledby="bars-title">
    <h2 id="bars-title">By pillar</h2>
    <p class="note">IFANCA's mission names three pillars. A promise can belong to more than one, so it counts once in each.</p>
    <div class="legend">
      <span><span class="sw good">&#10003;</span>Strong</span><span><span class="sw warning">~</span>Weak</span><span><span class="sw critical">&#10005;</span>None</span>
    </div>
    <div class="bars">
"""

for p in PILLARS:
    counts = per_pillar[p]
    total = sum(counts.values())
    segs = ""
    for s, cls, icon in (("strong", "good", "&#10003;"), ("weak", "warning", "~"), ("none", "critical", "&#10005;")):
        if counts[s]:
            segs += (
                f'<div class="seg {cls}" style="flex:{counts[s]}" '
                f'title="{counts[s]} {s}" aria-label="{counts[s]} {s}">{counts[s]}</div>'
            )
    page += f"""      <div class="bar-row"><span class="name">{p}</span><div class="bar">{segs}</div><span class="total">{total} promises</span></div>
"""

page += """    </div>
  </section>

  <section class="card" aria-labelledby="map-title">
    <h2 id="map-title">Every promise</h2>
    <p class="note">One square per promise. Point at a square, or tab to it, to read the promise and the reason for its rating.</p>
"""

for p, items in cells:
    page += f'    <div class="grid-row"><h3>{p}</h3><div class="cells">\n'
    for d in items:
        cls, icon = {"strong": ("good", "&#10003;"), "weak": ("warning", "~"), "none": ("critical", "&#10005;")}[d["score"]]
        page += (
            f'      <div class="cell {cls}" tabindex="0" data-id="{d["id"]}" aria-label="{esc(d["id"])}: {esc(d["score"])}. {esc(d["text"])}">'
            f'<span class="i">{icon}</span>{d["id"]}</div>\n'
        )
    page += "    </div></div>\n"

page += """  </section>

  <details class="card">
    <summary>Show all promises as a table</summary>
    <table>
      <thead><tr><th>ID</th><th>Promise (word for word)</th><th>Pillars</th><th>Rating</th><th>Why</th><th>Page</th></tr></thead>
      <tbody>
"""
for d in data:
    page += (
        f'        <tr><td>{d["id"]}</td><td>{esc(d["text"])}</td><td>{esc(", ".join(d["pillars"]))}</td>'
        f'<td>{d["score"]}</td><td>{esc(d["reason"])}</td>'
        f'<td><a href="{esc(d["page"])}">{esc(d["page"].replace("https://ifanca.org", "") or "/")}</a></td></tr>\n'
    )

page += f"""      </tbody>
    </table>
  </details>

  <footer>Sources: analysis/claims.json and analysis/coverage.csv, built from a copy of ifanca.org made on {crawl_date}.
  Built by crawl/build_gap_map.py. Demo material, not an official IFANCA document.</footer>
</main>
<div id="tip" role="tooltip"></div>
<script>
  const DATA = {json.dumps({d["id"]: d for d in data}, ensure_ascii=False)};
  const tip = document.getElementById('tip');
  const label = {{ strong: 'Strong: backed and easy to find', weak: 'Weak: partly backed, dated, or buried', none: 'None: nothing backs it' }};
  function show(el) {{
    const d = DATA[el.dataset.id];
    tip.innerHTML = '<div class="meta">' + d.id + ' &middot; ' + d.pillars.join(', ') + '</div><q></q><div><b></b></div><div class="meta why"></div>';
    tip.querySelector('q').textContent = d.text;
    tip.querySelector('b').textContent = label[d.score];
    tip.querySelector('.why').textContent = d.reason;
    tip.style.display = 'block';
    const r = el.getBoundingClientRect();
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let x = r.left + r.width / 2 - w / 2, y = r.top - h - 10;
    if (y < 8) y = r.bottom + 10;
    x = Math.max(8, Math.min(x, window.innerWidth - w - 8));
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }}
  function hide() {{ tip.style.display = 'none'; }}
  document.querySelectorAll('.cell').forEach((el) => {{
    el.addEventListener('mouseenter', () => show(el));
    el.addEventListener('focus', () => show(el));
    el.addEventListener('mouseleave', hide);
    el.addEventListener('blur', hide);
  }});
</script>
</body>
</html>
"""

out = ROOT / "viz/gap-map.html"
out.write_text(page, encoding="utf-8")
print(f"wrote {out.relative_to(ROOT)}: {len(data)} claims, {dict(totals)}")
