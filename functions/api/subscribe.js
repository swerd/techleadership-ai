// POST /api/subscribe — mailing-list signup. Emails the new subscriber's address
// to Andrew via Resend (a lightweight capture; swap in a real ESP later if desired).
// Same env vars as /api/contact (RESEND_API_KEY, FROM_EMAIL, TO_EMAIL).
import { EMAIL_RE, json, sendEmail, field } from "../_lib/email.js";

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  if (field(data, "company_website")) return json({ ok: true }); // honeypot

  const email = field(data, "email", 200);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "validation" }, 422);

  const result = await sendEmail(env, {
    replyTo: email,
    subject: "New newsletter signup — techleadership.ai",
    text: `New subscriber wants your "leading in the age of AI" notes:\n\n${email}`,
  });
  if (!result.ok) {
    return json({ ok: false, error: result.detail === "not_configured" ? "not_configured" : "send_failed" }, result.status);
  }
  return json({ ok: true });
}

export async function onRequest() {
  return json({ ok: false, error: "method_not_allowed" }, 405);
}
