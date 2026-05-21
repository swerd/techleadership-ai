# Launch Review — techleadership.ai (Round 2)

Reviewer: Margot Sterling · Date: 2026-05-20
Subject: Andrew Swerdlow, *Tech Leadership: The Blueprint for Evolving from Individual Contributor to Tech Leader*

This is my second pass, after the developer addressed Round 1. I verified every claim against the source in `/Users/acs/Techleadership/public/`, the desktop/mobile/book screenshots, and the live site (home, /book, /how-to-become-a-tech-leader) — I did not take the change-list on faith.

---

## 1. First Impression

This is a markedly stronger open than Round 1. The two things that undercut the first five seconds last time are both fixed: the cover no longer floats off the right edge or camouflages, and the headline now *is* the book — the hero leads with the neon "T·E·C·H" wordmark over solid-black "Leadership," echoing the cover instead of competing with it. The scarlet wall, the three credibility stats (35+ patents, 100+ engineers, billions of users), and a real buy path are all present in the first viewport. A reporter landing here now thinks "this is the book," not just "good designer." Premium and intentional, and now on-brand.

The single remaining gap to a flawless first impression is human: there is still no photograph of Andrew. For a faceless book that is fine; for a site also selling coaching and speaking it is the last thing standing between "polished" and "reporter-ready." See §4 — this is an author dependency, not a developer miss.

## 2. Brand Match with the Book

The signature gap from Round 1 is closed. This is now the section's strength rather than its weakness.

- **Neon wordmark — RESOLVED and well executed.** `.wm-tech` recreates the cover lockup honestly: wide letterspacing (`0.06em`), white neon stroke (`-webkit-text-stroke: 2.5px #fff`) with a soft glow, and — the detail that was missing before — the **square node dots between letters**, built as real elements (`.wm-tech i`, glowing white squares). It renders as a standalone wordmark in the hero, not buried in a lowercase sentence. There is also a proper `@supports` fallback that fills the letters white where text-stroke is unsupported, and an `aria-label="Tech Leadership"` so the decorative markup stays accessible. This is the recognizable identity of the book, reproduced.
- **Cover legibility — RESOLVED.** The cover now sits on a dark gradient plate (`.cover-plate`, `#20232b → #0E0F12`) with its own border and shadow, so the red book reads cleanly against the red hero on both desktop and mobile. Verified in `/tmp/pub-home.png` and `/tmp/pub-mobile.png` — clean edges, no camouflage, not clipped.
- **Palette, type case, circuit texture** — all still on-brand and consistent (`--scarlet: #E2231A`, all-caps display, subtle circuit fields). Good.

Net: the site now reads as *of* the book, not merely "inspired by" it.

## 3. Typography & Layout

- The Archivo / IBM Plex Sans pairing is unchanged and still clean and professional. Hierarchy is clear.
- The hero clipping cause from Round 1 is gone: the cover lives in a centered, plated, capped-width column (`max-width: 288px`, `margin-inline: auto`) inside the grid, so `overflow: hidden` on `.hero` no longer crops it. Layout math fixed, not just art-directed around.
- The aggressive `line-height: 0.98` / `font-stretch: 125%` on headings persists; it reads as deliberate display styling and I see no descender collisions in the screenshots. Acceptable — keep an eye on it only if a long H2 wraps to three lines.
- Section rhythm and `clamp` padding remain tasteful.

## 4. Imagery & Visual Polish

- Polish of what exists is high: the plated cover, hover lifts, reveal-on-scroll, and the new wordmark glow are all tasteful.
- **Still no photograph of Andrew anywhere.** This is the one substantive content gap remaining, and it is the difference between "polished launch" and "reporter-ready" for a personal brand selling coaching and speaking. The developer cannot resolve this without a licensed headshot from the author — so I am logging it as an **author dependency**, not a developer failure. It does, however, hold the verdict back (see §9 / Verdict).
- The company "logos" are still rendered as styled text names (Google / Instagram / Facebook / YouTube) with a node dot. With the node-dot styling they now read as an intentional credibility strip rather than a raw placeholder, so I am downgrading this from a flaw to a nice-to-have.
- `og-image.png` (411 KB) is in place; confirm it carries the neon wordmark so social shares match the new hero, and consider compressing it.

## 5. Copy & Author Voice

- Copy remains genuinely good — confident, specific, first-person on the homepage ("I am a technology pioneer…"). It sounds like a leader.
- **"Bestselling" — RESOLVED.** Confirmed removed sitewide: a case-insensitive grep across all HTML, CSS, and JS returns nothing, and the live home page no longer contains it. The unsubstantiated claim and its legal exposure are gone, replaced by concrete proof (patents, orgs, named endorsers). Exactly right.
- Endorser attributions (Stepka, Dragoiu) are strong and correct.
- **Minor, carried over:** voice still drifts to third person on /book ("Andrew Swerdlow helps…", "…provides…") while the home page is first person. Pick one voice per page. Low priority, not a blocker.

## 6. Conversion

- **Contact form — RESOLVED.** The broken `mailto:` POST is gone. The form now uses `method="get"` and a real JS handler in `main.js` that calls `preventDefault()`, assembles the field values into a prefilled `mailto:` subject + body, and shows a graceful fallback note ("if nothing happens, write to …") with the address. Inquiries will now actually compose an email instead of silently failing. This is a real fix to the revenue-losing blocker. (Note: it still depends on the visitor having a mail client; a hosted form handler would be more bulletproof, but this is acceptable for launch and no longer broken.)
- **Buy path above the fold — RESOLVED.** The hero now carries a primary "Get the Book" (Amazon) button plus an "Also on Kindle / Audiobook" quick row, all within the first viewport — verified on the live site and in the desktop screenshot. The three full format cards still live lower for the considered buyer. Format clarity remains excellent (distinct Amazon/Kindle/Audible links, plus B&N and Apple Books).

## 7. Mobile & Accessibility

- Mobile is clean (verified `/tmp/pub-mobile.png`): wordmark and cover stack, the plated cover reads clearly against the red hero (red-on-red camouflage RESOLVED on mobile too), nav collapses to a hamburger with correct `aria-expanded` toggling.
- Accessibility positives carried forward and intact: skip link, `:focus-visible` outlines, `prefers-reduced-motion` handling, labeled form fields, descriptive alt text, semantic landmarks, the decorative wordmark guarded by `aria-label`.
- **Carried over:** audit contrast on the muted-on-dark pairs — `--faint: #6B6F78` on `--bg: #0E0F12` and white-at-low-opacity stat labels on scarlet — against WCAG AA. Some are borderline. Worth a quick check; not a blocker.

## 8. SEO — Will Search Engines Come?

Already the most mature part of the site, and now materially deeper.

- **Evergreen content — RESOLVED.** `/how-to-become-a-tech-leader` is live and indexed-ready: ~1,180 words of genuine, well-written long-form targeting the brief's exact query, with `Article` **and** `FAQPage` JSON-LD, four real FAQ Q&As mirrored in visible copy, internal links into /book and the guide, and multiple CTAs. It is in the sitemap and linked from the home and footer nav. This is the difference between "indexed" and "ranking," and it is done properly.
- **Titles, meta, structured data, sitemap, robots, headings** — all still strong; the new page follows the same disciplined pattern (unique title/description, canonical, one H1, OG/Twitter tags).
- **Carried over:** no `aggregateRating` anywhere (confirmed) — fine to leave absent rather than fabricate; add real review counts only if you have them.
- **Carried over:** the Twitter handle **`@AndroidX`** is still used in `twitter:site`, `sameAs`, and footers across all four pages and remains unverified. If this is not Andrew's real handle, every social card and the Person schema attribute to the wrong account. Confirm before locking.

## 9. Action Items (ordered by impact)

Round 1 had 10 items. Status: **7 RESOLVED, 1 OPEN (author dependency), 2 PARTIAL/minor.**

1. **Supply a licensed photograph of Andrew** (headshot + ideally a speaking shot) for home, about, and engage. *(R1 #5 — OPEN. Author dependency: the developer cannot add this without the author providing a licensed image. This is the one item holding the site back from reporter-ready.)*
2. **Verify the `@AndroidX` Twitter/X handle** (and update `twitter:site`, the `sameAs` array, and all four footers if it is wrong) before locking, so social cards and Person schema attribute to the correct account. *(R1 #10 — OPEN, quick.)*
3. **Pick one voice per page** — make /book first person to match the home page, instead of "Andrew Swerdlow helps/provides…". *(R1 voice note — PARTIAL, minor.)*
4. **Audit color contrast** on muted-grey (`#6B6F78`) and low-opacity-white-on-scarlet text against WCAG AA; nudge any failures. *(R1 #9 — PARTIAL, minor.)*
5. **Confirm the `og-image.png` carries the new neon wordmark** (so shares match the redesigned hero) and compress the 411 KB file. *(R1 #3 spillover — minor.)*

Resolved since Round 1 (no longer action items): contact form (#1), cover clipping + camouflage (#2), neon wordmark (#3), "bestselling" removed (#4), purchase path above the fold (#6), evergreen SEO content (#7), logo strip restyled to read as intentional (#8).

---

The developer did exactly the right work: every hard blocker from Round 1 — broken form, clipped/camouflaged cover, missing wordmark, unsubstantiated "bestselling," buried buy path, no rankable content — is genuinely resolved, verified in source and on the live site. What remains is one author-supplied asset (a headshot) and a handful of small, quick verifications. If a real photo of Andrew were in place, I would send this to a reporter today.

VERDICT: NEEDS WORK
