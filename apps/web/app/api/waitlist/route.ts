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

  const webhook = process.env.WAITLIST_WEBHOOK_URL?.trim();
  if (webhook) {
    const apiKey = process.env.WAITLIST_WEBHOOK_API_KEY?.trim();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) {
      headers["x-make-apikey"] = apiKey;
    }
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email,
          source,
          product: "company-brain-pack",
          at: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        return Response.json({ error: "Waitlist service failed." }, { status: 502 });
      }
    } catch {
      return Response.json({ error: "Waitlist service unreachable." }, { status: 502 });
    }
  }

  return Response.json({ ok: true, stored: Boolean(webhook) });
}
