// POST /api/contact — emails an inquiry to Andrew via Resend.
//
// Configure in Cloudflare Pages → Settings → Variables and Secrets:
//   RESEND_API_KEY  (secret)  — required to actually send. Get one at resend.com.
//   FROM_EMAIL      (optional) — verified sender, e.g. "Tech Leadership <hello@techleadership.ai>".
//                                Defaults to Resend's onboarding sender.
//   TO_EMAIL        (optional) — recipient. Defaults to andrewcswerdlow@gmail.com.
//
// Until RESEND_API_KEY is set, this returns 503 {error:"not_configured"} and the
// front-end falls back to opening the visitor's email client (mailto).
import { EMAIL_RE, json, sendEmail, field } from "../_lib/email.js";

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  // Honeypot — silently accept bots without sending.
  if (field(data, "company_website")) return json({ ok: true });

  const name = field(data, "name", 200);
  const email = field(data, "email", 200);
  const topic = field(data, "topic", 200);
  const organization = field(data, "organization", 200);
  const message = field(data, "message", 5000);

  if (!name || !EMAIL_RE.test(email) || !message) {
    return json({ ok: false, error: "validation" }, 422);
  }

  const subject = `New inquiry${topic ? ` — ${topic}` : ""} via techleadership.ai`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    organization ? `Organization: ${organization}` : null,
    topic ? `Interested in: ${topic}` : null,
    "",
    message,
  ]
    .filter((v) => v !== null)
    .join("\n");

  const result = await sendEmail(env, { replyTo: email, subject, text });
  if (!result.ok) {
    return json({ ok: false, error: result.detail === "not_configured" ? "not_configured" : "send_failed" }, result.status);
  }
  return json({ ok: true });
}

// Any non-POST request: 405.
export async function onRequest() {
  return json({ ok: false, error: "method_not_allowed" }, 405);
}
