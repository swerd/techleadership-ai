// Shared helpers for the form endpoints. Files/dirs prefixed with "_" are not
// routed by Cloudflare Pages, so this is import-only.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Sends a plain-text email via Resend (https://resend.com).
// Requires env.RESEND_API_KEY. FROM_EMAIL/TO_EMAIL are optional overrides.
// Returns { ok: boolean, status, detail }.
export async function sendEmail(env, { replyTo, subject, text }) {
  if (!env.RESEND_API_KEY) return { ok: false, status: 503, detail: "not_configured" };

  const from = env.FROM_EMAIL || "Tech Leadership <onboarding@resend.dev>";
  const to = env.TO_EMAIL || "andrewcswerdlow@gmail.com";

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo || undefined,
      subject,
      text,
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    return { ok: false, status: 502, detail: detail.slice(0, 500) };
  }
  return { ok: true, status: 200 };
}

export function field(data, key, max = 500) {
  return (data?.[key] ?? "").toString().trim().slice(0, max);
}
