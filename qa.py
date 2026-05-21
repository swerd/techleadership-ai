#!/usr/bin/env python3
"""QA checker for the techleadership.ai static site."""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).parent / "public"
PAGES = ["index.html", "book.html", "engage.html", "about.html", "how-to-become-a-tech-leader.html", "404.html"]
errors, warnings = [], []


def resolve_internal(href):
    """Map an internal href to a file path under public/. Returns Path or None for anchors/mailto."""
    href = href.split("#")[0].split("?")[0]
    if not href or href.startswith(("mailto:", "tel:", "http://", "https://")):
        return None
    if href == "/":
        return ROOT / "index.html"
    p = href.lstrip("/")
    cand = ROOT / p
    if cand.suffix:  # has extension (css, js, png, svg, xml...)
        return cand
    # clean URL -> .html
    return ROOT / (p + ".html")


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.imgs, self.scripts, self.css = [], [], [], []
        self.has_h1 = False
        self.title = None
        self._in_title = False
        self.imgs_missing_alt = 0
        self.jsonld = []
        self._in_jsonld = False
        self._buf = ""

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "a" and "href" in d:
            self.links.append(d["href"])
        if tag == "img":
            self.imgs.append(d.get("src", ""))
            if not d.get("alt") and d.get("aria-hidden") != "true":
                self.imgs_missing_alt += 1
        if tag == "script" and d.get("type") == "application/ld+json":
            self._in_jsonld = True
            self._buf = ""
        elif tag == "script" and "src" in d:
            self.scripts.append(d["src"])
        if tag == "link" and d.get("rel") == "stylesheet" and "href" in d:
            self.css.append(d["href"])
        if tag == "h1":
            self.has_h1 = True
        if tag == "title":
            self._in_title = True

    def handle_endtag(self, tag):
        if tag == "script" and self._in_jsonld:
            self._in_jsonld = False
            self.jsonld.append(self._buf)
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_jsonld:
            self._buf += data
        if self._in_title:
            self.title = (self.title or "") + data


for page in PAGES:
    fp = ROOT / page
    if not fp.exists():
        errors.append(f"[{page}] MISSING page file")
        continue
    html = fp.read_text(encoding="utf-8")
    p = LinkParser()
    p.feed(html)

    if not p.has_h1:
        errors.append(f"[{page}] no <h1>")
    if not p.title or len(p.title.strip()) < 10:
        warnings.append(f"[{page}] title missing/short")
    if page not in ("404.html",) and len(p.title or "") > 65:
        warnings.append(f"[{page}] title >65 chars ({len(p.title)}): SEO truncation risk")

    # meta description
    m = re.search(r'<meta name="description" content="([^"]*)"', html)
    if page != "404.html":
        if not m:
            errors.append(f"[{page}] missing meta description")
        elif not (50 <= len(m.group(1)) <= 165):
            warnings.append(f"[{page}] meta description length {len(m.group(1))} (ideal 50-160)")
        # canonical
        if 'rel="canonical"' not in html:
            errors.append(f"[{page}] missing canonical")

    # alt text
    if p.imgs_missing_alt:
        warnings.append(f"[{page}] {p.imgs_missing_alt} <img> without alt")

    # JSON-LD validity
    for i, block in enumerate(p.jsonld):
        try:
            json.loads(block)
        except json.JSONDecodeError as e:
            errors.append(f"[{page}] JSON-LD block {i} invalid: {e}")

    # internal links/assets exist
    for href in p.links + p.css + p.scripts + p.imgs:
        target = resolve_internal(href)
        if target is not None and not target.exists():
            errors.append(f"[{page}] broken internal link/asset: {href} -> {target.relative_to(ROOT)} (missing)")

# verify referenced og-image exists
if not (ROOT / "assets" / "og-image.png").exists():
    errors.append("[global] assets/og-image.png missing")

# sitemap urls sanity
sm = (ROOT / "sitemap.xml").read_text()
for loc in re.findall(r"<loc>https://techleadership\.ai/([^<]*)</loc>", sm):
    target = resolve_internal("/" + loc)
    if target and not target.exists():
        errors.append(f"[sitemap] {loc} has no corresponding page")

print("=" * 60)
print(f"QA RESULTS — {len(errors)} errors, {len(warnings)} warnings")
print("=" * 60)
for e in errors:
    print("  ERROR  ", e)
for w in warnings:
    print("  warn   ", w)
print("=" * 60)
sys.exit(1 if errors else 0)
