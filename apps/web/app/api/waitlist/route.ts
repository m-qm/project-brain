import { postWaitlistWebhook, sendWaitlistEmail, type WaitlistPayload } from "../../../lib/waitlist-notify";

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

  const webhook = process.env.WAITLIST_WEBHOOK_URL?.trim();
  const apiKey = process.env.WAITLIST_WEBHOOK_API_KEY?.trim();

  let storedVia: "webhook" | "email" | null = null;

  if (webhook) {
    const result = await postWaitlistWebhook(webhook, apiKey, payload);
    if (result.ok) {
      storedVia = "webhook";
    } else {
      console.error("[waitlist] webhook failed", result.status, result.body.slice(0, 500));
    }
  }

  if (!storedVia) {
    const emailed = await sendWaitlistEmail(payload);
    if (emailed) {
      storedVia = "email";
    }
  }

  if (!storedVia && webhook) {
    return Response.json({ error: "Waitlist service failed." }, { status: 502 });
  }

  return Response.json({
    ok: true,
    stored: Boolean(storedVia),
    via: storedVia ?? undefined,
  });
}
