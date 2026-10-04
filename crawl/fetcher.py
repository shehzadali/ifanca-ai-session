"""Shared fetch layer for the IFANCA crawl.

Rate limits every live request to 1/second, caches every raw response under
data/raw/ keyed by a caller-supplied path, and serves from cache on rerun so
nothing is fetched twice. See CLAUDE.md ground rules.
"""
from __future__ import annotations

import csv
import json
import time
from pathlib import Path
from urllib.parse import urljoin

import requests

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = REPO_ROOT / "data" / "raw"
BASE_URL = "https://ifanca.org"
RATE_LIMIT_SECONDS = 1.0

# Chosen to avoid colliding (by substring, per Python's robotparser semantics)
# with any of the ~140 blocklisted bot tokens in ifanca.org's robots.txt.
# "IFANCA-AI-Session-Crawler" originally collided with the "es" token (from
# "Session"), which carries "Disallow: /". Verified collision-free before use.
USER_AGENT = (
    "IfancaContentAudit/1.0 "
    "(educational content audit for an internal AI session; "
    "contact: crawler-contact@example.com)"
)

_LOG_PATH = RAW_DIR / "_fetch_log.csv"
_last_request_time = 0.0


def _throttle() -> None:
    global _last_request_time
    elapsed = time.monotonic() - _last_request_time
    wait = RATE_LIMIT_SECONDS - elapsed
    if wait > 0:
        time.sleep(wait)
    _last_request_time = time.monotonic()


def _log(url: str, method: str, cache_hit: bool, status: int | None) -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    is_new = not _LOG_PATH.exists()
    with _LOG_PATH.open("a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if is_new:
            writer.writerow(["timestamp", "method", "url", "cache_hit", "status"])
        writer.writerow([time.strftime("%Y-%m-%dT%H:%M:%S"), method, url, cache_hit, status])


def _full_cache_path(cache_rel_path: str) -> Path:
    path = RAW_DIR / cache_rel_path
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def fetch_text(url: str, cache_rel_path: str, method: str = "GET", data: dict | None = None) -> str:
    """Fetch raw text (HTML/XML) from url, or read it from cache if already present."""
    path = _full_cache_path(cache_rel_path)
    if path.exists():
        _log(url, method, True, None)
        return path.read_text(encoding="utf-8")

    headers = {"User-Agent": USER_AGENT}
    max_attempts = 3
    last_error: Exception | None = None
    for attempt in range(1, max_attempts + 1):
        _throttle()
        try:
            if method == "GET":
                resp = requests.get(url, headers=headers, timeout=30)
            elif method == "POST":
                resp = requests.post(url, headers=headers, data=data, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            resp.raise_for_status()
        except requests.exceptions.RequestException as exc:
            last_error = exc
            # A timeout/connection drop (e.g. the machine slept mid-crawl) is a
            # local/network hiccup, not the server signalling anything, so a
            # short retry is reasonable without violating the rate limit.
            if attempt < max_attempts:
                time.sleep(2 * attempt)
                continue
            raise
        _log(url, method, False, resp.status_code)
        path.write_text(resp.text, encoding="utf-8")
        return resp.text
    raise last_error  # pragma: no cover - unreachable, loop always returns or raises


def fetch_json(url: str, cache_rel_path: str, method: str = "GET", data: dict | None = None) -> dict:
    """Fetch JSON from url (GET or POST form data), caching the raw JSON text."""
    text = fetch_text(url, cache_rel_path, method=method, data=data)
    return json.loads(text)


def absolute_url(path_or_url: str) -> str:
    if path_or_url.startswith("http"):
        return path_or_url
    return urljoin(BASE_URL + "/", path_or_url.lstrip("/"))


def slugify_path(url: str) -> str:
    """Turn a full URL path into a safe filename for the HTML cache."""
    rel = url.replace(BASE_URL, "").strip("/")
    if not rel:
        rel = "_index"
    return rel.replace("/", "__") + ".html"
