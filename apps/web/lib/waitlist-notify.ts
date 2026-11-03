export type WaitlistPayload = {
  email: string;
  source: string;
  product: string;
  at: string;
};

async function resendSend(
  apiKey: string,
  from: string,
  to: string[],
  payload: WaitlistPayload,
): Promise<{ ok: boolean; status: number; body: string }> {
  const text = [
    "New Company Brain waitlist signup",
    "",
    `Email: ${payload.email}`,
    `Source: ${payload.source}`,
    `Product: ${payload.product}`,
    `At: ${payload.at}`,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Waitlist: ${payload.email}`,
      text,
      reply_to: payload.email,
    }),
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

export async function sendWaitlistEmail(
  payload: WaitlistPayload,
): Promise<{ ok: boolean; detail?: string; channel?: "domain" | "fallback" }> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const notifyTo = process.env.WAITLIST_NOTIFY_EMAIL?.trim() || "mireiaquerol@gmail.com";
  const from =
    process.env.RESEND_FROM?.trim() || "Agent KBase <notifications@agentkbase.com>";
  const fallbackTo =
    process.env.WAITLIST_RESEND_FALLBACK_TO?.trim() || "hello@dualperspective.digital";
  const fallbackFrom =
    process.env.WAITLIST_RESEND_FALLBACK_FROM?.trim() || "Agent KBase <onboarding@resend.dev>";

  if (!resendKey) {
    return { ok: false, detail: "RESEND_API_KEY not configured" };
  }

  try {
    const primary = await resendSend(resendKey, from, [notifyTo], payload);
    if (primary.ok) {
      return { ok: true, channel: "domain" };
    }
    console.error("[waitlist] resend primary failed", primary.status, primary.body.slice(0, 500));

    const useFallback = process.env.WAITLIST_RESEND_FALLBACK !== "false";
    if (!useFallback) {
      return { ok: false, detail: primary.body.slice(0, 200) };
    }

    const fallback = await resendSend(resendKey, fallbackFrom, [fallbackTo], payload);
    if (fallback.ok) {
      console.warn("[waitlist] used Resend fallback inbox until agentkbase.com is verified");
      return { ok: true, channel: "fallback" };
    }
    console.error("[waitlist] resend fallback failed", fallback.status, fallback.body.slice(0, 500));
    return { ok: false, detail: fallback.body.slice(0, 200) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "resend fetch failed";
    console.error("[waitlist] resend error", message);
    return { ok: false, detail: message };
  }
}
