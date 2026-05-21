# Standing prompt — techleadership.ai (Ralph loop)

You are iterating on the static marketing site for Andrew Swerdlow in `public/`.
Goal: a classy, exclusive, fast, SEO-strong site that sells the book *Tech Leadership*
(Amazon ASIN B0CK45BHLX) and tastefully signals availability for speaking, advising,
coaching, and mentorship — without reading as a full-time-for-hire shingle.

Each iteration, do ONE high-value improvement, then stop:

1. Run `python3 qa.py`. If it reports any ERROR, fix it first.
2. Otherwise pick the single most valuable polish item, e.g.:
   - Tighten copy for clarity, warmth, and exclusivity.
   - Strengthen SEO (titles ≤ 60 chars, descriptions 50–160 chars, headings, alt text,
     internal links, structured data correctness).
   - Improve responsive layout, accessibility (contrast, focus states, landmarks), or performance.
   - Verify every external link (Amazon, retailers, LinkedIn) is correct.
3. Re-run `python3 qa.py` and confirm 0 errors.
4. Commit with a concise message describing the change.

Constraints:
- Keep it dependency-free static HTML/CSS/JS. No frameworks, no build step.
- Preserve the ink/cream/brass design language (Fraunces + Inter).
- Never invent credentials or testimonials beyond what is already substantiated.
- Keep the tone understated and premium.
