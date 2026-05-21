# Launch Review — techleadership.ai

Reviewer: Margot Sterling · Round 3 (verification pass)
Subject: Andrew Swerdlow, *Tech Leadership: The Blueprint for Evolving from Individual Contributor to Tech Leader*

---

## 1. First Impression
Strong and unmistakably *the book*: scarlet wall with circuit texture, the cover's neon **T·E·C·H / LEADERSHIP** lockup recreated in type, the real cover legible on a dark plate, three credibility stats, and a buy path in the first viewport. Reads as a serious operator. The only missing beat is a human face.

## 2. Brand Match with the Book
Now genuinely *of* the book, not merely *inspired by*: scarlet `#E2231A`, dark circuit traces, white neon-outline T·E·C·H with square node dots and wide tracking, solid-black LEADERSHIP, all-caps display voice. The social `og-image.png` was regenerated to match this exact treatment. **RESOLVED.**

## 3. Typography & Layout
Archivo (expanded, 900) + IBM Plex Sans; clear hierarchy; hero re-aligned so content flows from the top and nothing clips. Good.

## 4. Imagery & Visual Polish
Cover featured well and legible on its dark plate. Shadows/hover/reveal tasteful. **Still no photograph of Andrew** — the one real gap (see Action Item 1).

## 5. Copy & Author Voice
Confident, specific, first person. "/book" intro converted to first person to match the home page — **voice now consistent (RESOLVED).** "Bestselling" remains removed sitewide.

## 6. Conversion
All three formats (Paperback/Kindle/Audible) distinct with correct links; buy path above the fold; working JS contact form. Strong.

## 7. Mobile & Accessibility
Responsive, hamburger with `aria-expanded`, skip link, focus-visible, reduced-motion. **Contrast: `--faint` lightened `#6B6F78 → #8E929C` to meet WCAG AA for small/meta text (RESOLVED).**

## 8. SEO
Unique titles/descriptions, canonicals, JSON-LD (Person/WebSite/Book + per-format workExample + Article + FAQPage), sitemap, internal links, and a ~1,200-word evergreen guide targeting "how to become a tech leader." Mature and well above typical author sites.

## 9. Action Items
Round 1 = 10 items. **Current status: 9 RESOLVED. One OPEN — a pure author dependency.** Remaining:

1. **Supply a licensed photograph of Andrew** (headshot + ideally a speaking shot) for home, about, engage. **OPEN — author dependency.** This is the *only* thing holding the site back from reporter-ready; the developer cannot add it without the author providing a licensed image (scraping a headshot is off-limits).

Resolved Round 5: the unverified `@AndroidX` handle was removed sitewide (`twitter:site`, schema `sameAs`, footer links) to avoid mis-attributing the author's social cards; generic `twitter:card` tags retained. Re-add once a confirmed handle is supplied.

Resolved this round: voice consistency, WCAG contrast, OG card matches the new hero + compressed 411KB→294KB. Previously resolved: contact form, cover clipping/camouflage, neon wordmark, "bestselling" removal, above-fold buy path, evergreen content, logo strip.

**Round 4 (infra):** Caught and fixed a production bug — a 24h `Cache-Control` on `/styles.css` was serving a stale stylesheet at the edge, so freshly-deployed HTML paired with old CSS (broken hero for cached visitors). Now short TTL + `?v=` cache-busting; verified the live CSS matches the deployed HTML. Not a publicist content item, but a real launch blocker had it shipped unnoticed.

---

The site is, in my professional view, reporter-ready in everything the developer controls — there is now exactly **one** open item, and it is not a developer item: there is no photograph of the author. A premium site selling coaching and speaking cannot be faceless. Supply a licensed headshot and this flips to PERFECT.

VERDICT: NEEDS WORK
