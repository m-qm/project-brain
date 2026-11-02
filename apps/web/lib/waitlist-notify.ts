export type WaitlistPayload = {
  email: string;
  source: string;
  product: string;
  at: string;
};

export async function postWaitlistWebhook(
  webhook: string,
  apiKey: string | undefined,
  payload: WaitlistPayload,
): Promise<{ ok: boolean; status: number; body: string }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) {
    headers["x-make-apikey"] = apiKey;
  }
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return { ok: false, status: 0, body: message };
  }
}

export async function sendWaitlistEmail(payload: WaitlistPayload): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const notifyTo = process.env.WAITLIST_NOTIFY_EMAIL?.trim() || "hello@dualperspective.digital";
  const from =
    process.env.RESEND_FROM?.trim() || "Agent KBase <onboarding@resend.dev>";

  if (!resendKey) {
    return false;
  }

  const text = [
    "New Company Brain waitlist signup",
    "",
    `Email: ${payload.email}`,
    `Source: ${payload.source}`,
    `Product: ${payload.product}`,
    `At: ${payload.at}`,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [notifyTo],
        subject: `Waitlist: ${payload.email}`,
        text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
