import { sendWaitlistEmail, type WaitlistPayload } from "../../../lib/waitlist-notify";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: string; source?: string };
  try {
    body = (await req.json()) as { email?: string; source?: string };
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Valid email required." }, { status: 400 });
  }

  const source = body.source?.trim().slice(0, 64) || "company-brain";

  const payload: WaitlistPayload = {
    email,
    source,
    product: "company-brain-pack",
    at: new Date().toISOString(),
  };

  if (!process.env.RESEND_API_KEY?.trim()) {
    return Response.json({ error: "Waitlist is not configured on this server." }, { status: 503 });
  }

  const result = await sendWaitlistEmail(payload);
  if (!result.ok) {
    return Response.json({ error: "Could not save your signup. Try again or email hello@agentkbase.com." }, { status: 502 });
  }

  return Response.json({ ok: true, stored: true });
}
