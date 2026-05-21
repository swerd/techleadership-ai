#!/usr/bin/env node
/**
 * Mobile QA harness for techleadership.ai
 *
 * Loads every page at several real mobile device sizes (cache disabled),
 * screenshots each, and runs automated assertions that FAIL loudly on the
 * kinds of regressions we've actually shipped:
 *   - horizontal scroll / page wider than the viewport
 *   - any visible element bleeding past the right/left edge
 *   - images rendered with a broken aspect ratio (e.g. a cover stretched
 *     tall because the HTML height= hint won over CSS)
 *   - the hero cover clipped at the bottom of the hero
 *   - the mobile nav overlay not covering the screen / no scroll-lock
 *
 * Runs against a local server or the live site:
 *   node scripts/mobile-qa.mjs                       # http://localhost:8799
 *   node scripts/mobile-qa.mjs https://techleadership.ai
 *   BASE_URL=https://techleadership.ai npm run qa:mobile
 *
 * Uses the system Google Chrome via playwright-core (no bundled browser).
 * Screenshots are written to ./.mobile-qa/ (gitignored).
 */
import { chromium } from "playwright-core";
import { mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const BASE_URL = (process.argv[2] || process.env.BASE_URL || "http://localhost:8799").replace(/\/$/, "");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, ".mobile-qa");
const TOL = 2; // px tolerance for sub-pixel rounding

// Pages to test (path → label). index is "/", the rest are explicit .html
// so the same list works against the local python server and Cloudflare Pages.
const PAGES = [
  ["/", "home"],
  ["/about.html", "about"],
  ["/book.html", "book"],
  ["/engage.html", "engage"],
  ["/how-to-become-a-tech-leader.html", "guide"],
  ["/404.html", "404"],
];

// Real-ish device descriptors (small Android + the two iPhones Andrew uses).
const DEVICES = [
  { name: "iphone-se", width: 375, height: 667, dpr: 2 },
  { name: "iphone-15-pro", width: 393, height: 852, dpr: 3 },
  { name: "android-small", width: 360, height: 800, dpr: 3 },
];

// Assertions run in the page. Returns an array of failure strings (empty = pass).
function inPageChecks(tol) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const fails = [];

  // 1. No horizontal document overflow.
  const sw = document.documentElement.scrollWidth;
  if (sw > vw + tol) fails.push(`horizontal overflow: scrollWidth ${sw} > viewport ${vw}`);

  // helper: is an element clipped by an overflow-hidden/clip ancestor?
  const clipped = (el) => {
    let p = el.parentElement;
    while (p) {
      const o = getComputedStyle(p);
      if (/(hidden|clip|auto|scroll)/.test(o.overflowX) && p.getBoundingClientRect().right <= vw + tol) return true;
      p = p.parentElement;
    }
    return false;
  };

  // 2. No visible element bleeds past the viewport horizontally (ignoring clipped/decorative).
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) === 0) continue;
    if (cs.position === "fixed") continue; // overlays handled separately
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // only flag elements that are at least partially in view and spill past an edge;
    // fully off-screen elements (e.g. the a11y skip-link at left:-999px) aren't bleeding.
    const bleedsRight = r.right > vw + tol && r.left < vw - tol;
    const bleedsLeft = r.left < -tol && r.right > tol;
    if ((bleedsRight || bleedsLeft) && !clipped(el)) {
      fails.push(`element bleeds horizontally: <${el.tagName.toLowerCase()} class="${el.className}"> right=${Math.round(r.right)} left=${Math.round(r.left)} vw=${vw}`);
      if (fails.length > 12) break;
    }
  }

  // 3. Images: aspect ratio preserved + not absurdly oversized.
  for (const img of document.querySelectorAll("img")) {
    // naturalWidth > 0 is the reliable "loaded" signal; .complete can stay false
    // during async decode (esp. for duplicated/lazy images).
    if (!img.naturalWidth) {
      fails.push(`image failed to load: ${img.getAttribute("src")}`);
      continue;
    }
    const r = img.getBoundingClientRect();
    if (r.width === 0) continue;
    const natural = img.naturalWidth / img.naturalHeight;
    const rendered = r.width / r.height;
    if (Math.abs(rendered / natural - 1) > 0.05) {
      fails.push(`image aspect ratio broken: ${img.getAttribute("src")} rendered ${Math.round(r.width)}x${Math.round(r.height)} (ratio ${rendered.toFixed(2)}) vs natural ratio ${natural.toFixed(2)}`);
    }
    if (r.right > vw + tol || r.left < -tol) {
      fails.push(`image overflows viewport: ${img.getAttribute("src")} right=${Math.round(r.right)} vw=${vw}`);
    }
    if (r.height > vh * 1.5) {
      fails.push(`image suspiciously tall: ${img.getAttribute("src")} ${Math.round(r.width)}x${Math.round(r.height)} (viewport h=${vh})`);
    }
  }

  // 4. Hero cover not clipped at the bottom of the hero.
  const hero = document.querySelector(".hero");
  const cover = document.querySelector(".hero-cover img");
  if (hero && cover) {
    const hr = hero.getBoundingClientRect();
    const cr = cover.getBoundingClientRect();
    if (cr.bottom > hr.bottom + tol) {
      fails.push(`hero cover clipped at hero bottom: cover.bottom=${Math.round(cr.bottom)} > hero.bottom=${Math.round(hr.bottom)}`);
    }
  }

  return fails;
}

// Open/close the mobile nav and assert it behaves as a full-screen overlay with
// scroll-lock. Async + transition-aware: we click in Node and wait for the CSS
// transition to settle before measuring, so we don't catch a mid-animation frame.
async function checkNav(page, tol) {
  const isMobileNav = await page.evaluate(() => {
    const t = document.querySelector(".nav-toggle");
    return !!t && getComputedStyle(t).display !== "none";
  });
  if (!isMobileNav) return [];

  await page.click(".nav-toggle");
  await page.waitForTimeout(450); // let transform/opacity transitions finish
  const openFails = await page.evaluate((tol) => {
    const links = document.querySelector(".nav-links");
    const r = links.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const f = [];
    // overlay intentionally starts at the header bottom (~76px) so the logo + X stay visible.
    if (r.top < -tol || r.top > 80) f.push(`nav overlay top off (expected ~header bottom): ${Math.round(r.top)}`);
    if (r.bottom < vh - tol) f.push(`nav overlay doesn't reach bottom: bottom=${Math.round(r.bottom)} vh=${vh}`);
    if (r.right < vw - tol || r.left > tol) f.push(`nav overlay not full width: left=${Math.round(r.left)} right=${Math.round(r.right)} vw=${vw}`);
    if (getComputedStyle(document.body).overflow !== "hidden") f.push(`body not scroll-locked while menu open`);
    if (parseFloat(getComputedStyle(links).opacity) < 0.99) f.push(`nav overlay not opaque when open`);
    return f;
  }, tol);

  await page.click(".nav-toggle");
  await page.waitForTimeout(450);
  const closeFails = await page.evaluate(() => {
    const f = [];
    if (document.body.classList.contains("nav-open")) f.push(`body still locked after closing menu`);
    if (getComputedStyle(document.body).overflow === "hidden") f.push(`body still scroll-locked after close`);
    return f;
  });
  return [...openFails, ...closeFails];
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  let totalFails = 0;
  const summary = [];

  for (const d of DEVICES) {
    const context = await browser.newContext({
      viewport: { width: d.width, height: d.height },
      deviceScaleFactor: d.dpr,
      isMobile: true,
      hasTouch: true,
      bypassCSP: true,
      serviceWorkers: "block",
      extraHTTPHeaders: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    });

    for (const [pagePath, label] of PAGES) {
      const page = await context.newPage();
      const url = `${BASE_URL}${pagePath}${pagePath.includes("?") ? "&" : "?"}qa=${Date.now()}`;
      const tag = `${label}@${d.name}`;
      try {
        const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
        if (resp && resp.status() >= 400 && label !== "404") {
          summary.push([tag, [`HTTP ${resp.status()} for ${url}`]]);
          totalFails++;
          await page.close();
          continue;
        }
        await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
        // scroll the whole page to trigger loading="lazy" images, then return to top.
        await page.evaluate(async () => {
          await new Promise((res) => {
            let y = 0;
            const step = () => {
              window.scrollTo(0, y);
              y += Math.round(window.innerHeight * 0.9);
              if (y < document.body.scrollHeight) requestAnimationFrame(step);
              else { window.scrollTo(0, 0); res(); }
            };
            step();
          });
        });
        // wait for every image to actually finish loading/decoding (avoids races).
        await page.waitForFunction(() => Array.from(document.images).every((i) => i.naturalWidth > 0), null, { timeout: 15000 }).catch(() => {});
        // reveal-on-scroll elements start at opacity:0; force them visible so
        // screenshots show real content and checks aren't fooled.
        await page.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible")));
        await page.waitForTimeout(150);

        await page.screenshot({ path: path.join(OUT_DIR, `${tag}.png`), fullPage: true });

        const layoutFails = await page.evaluate(inPageChecks, TOL);
        const menuFails = await checkNav(page, TOL);
        const fails = [...layoutFails, ...menuFails];
        if (fails.length) totalFails += fails.length;
        summary.push([tag, fails]);
      } catch (err) {
        summary.push([tag, [`ERROR: ${err.message}`]]);
        totalFails++;
      }
      await page.close();
    }
    await context.close();
  }
  await browser.close();

  console.log(`\nMobile QA — ${BASE_URL}\nScreenshots: ${path.relative(ROOT, OUT_DIR)}/\n`);
  for (const [tag, fails] of summary) {
    if (fails.length === 0) {
      console.log(`  PASS  ${tag}`);
    } else {
      console.log(`  FAIL  ${tag}`);
      for (const f of fails) console.log(`          - ${f}`);
    }
  }
  console.log(`\n${totalFails === 0 ? "ALL CLEAR" : totalFails + " issue(s) found"} across ${summary.length} page/device combos.\n`);
  process.exit(totalFails === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
