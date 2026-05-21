# techleadership.ai

Marketing site for **Andrew Swerdlow** — technology leader, bestselling author of
*Tech Leadership: The Blueprint for Evolving from Individual Contributor to Tech Leader*,
and selective speaker, advisor, and executive coach.

Live: **https://techleadership.ai**

## Stack

Intentionally simple and fast: hand-authored static HTML + CSS + a touch of vanilla JS.
No build step, no framework, no dependencies to rot. Hosted on **Cloudflare Pages**.

```
public/
├── index.html        # Home — editorial scroll: hero, about, book, testimonial, services, contact
├── book.html         # The Book — SEO landing → Amazon / Kindle / Audible / B&N / Apple Books
├── engage.html       # Work With Me — speaking, advising, coaching, mentorship & bootcamps
├── about.html        # Full bio & credentials
├── 404.html
├── styles.css        # Design system (ink / cream / brass; Fraunces + Inter)
├── main.js           # Nav, sticky header, scroll reveals
├── robots.txt
├── sitemap.xml
├── _headers          # Security + cache headers (Cloudflare Pages)
└── assets/
    ├── og-image.png  # 1200×630 social card
    └── og-image.svg  # source
```

## Develop

```bash
npm run dev    # serve public/ at http://localhost:8765
npm run qa     # run the QA checker (links, JSON-LD, SEO meta, alt text)
```

## Mobile QA

A Playwright harness loads **every page** at three real device sizes — iPhone SE
(375px), iPhone 15 Pro (393px) and a small Android (360px) — with caching disabled,
screenshots each into `.mobile-qa/` (gitignored), and **fails loudly** on the kinds
of mobile regressions we've actually shipped:

- horizontal scroll / any element bleeding past the viewport edge
- images with a broken aspect ratio (e.g. the hero cover stretched tall because the
  HTML `height=` hint won over CSS) or rendered larger than the viewport
- the hero cover clipped at the bottom of the hero
- the mobile nav not opening as a full-screen, scroll-locked overlay

```bash
npm run dev            # in one terminal (or: python3 devserver.py 8799)
npm run qa:mobile      # check the local server (defaults to http://localhost:8799)
npm run qa:mobile:live # check the live site, https://techleadership.ai

# or point it anywhere:
node scripts/mobile-qa.mjs http://localhost:8799
```

Exit code is non-zero if any check fails, so it can gate a deploy. It drives the
system Google Chrome via `playwright-core` (no bundled-browser download). **Run
`npm run qa:mobile:live` after every deploy** — the live site is the thing that
has to be clean.

## Deploy

```bash
npm run deploy            # wrangler pages deploy public --project-name=techleadership
```

Pushes to `main` also build via the Cloudflare Pages Git integration once connected.

## SEO

- Per-page `<title>`, meta description, and canonical URLs
- Open Graph + Twitter card metadata with a 1200×630 social card
- JSON-LD structured data: `Person`, `WebSite`, `Book`, `ProfessionalService`, `AboutPage`
- `sitemap.xml` + `robots.txt`
- Keyword-targeted content around "becoming a tech leader" funneling to the book on Amazon

## The Ralph loop

`ralph.sh` runs an autonomous build/QA/commit loop (the "Ralph Wiggum" technique:
a fixed prompt re-fed to the agent each iteration). See `PROMPT.md` for the standing
instructions. Run with `./ralph.sh` (Ctrl-C to stop).
