export type WaitlistPayload = {
  email: string;
  source: string;
  product: string;
  at: string;
};

export async function sendWaitlistEmail(
  payload: WaitlistPayload,
): Promise<{ ok: boolean; detail?: string }> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const notifyTo = process.env.WAITLIST_NOTIFY_EMAIL?.trim() || "mireiaquerol@gmail.com";
  const from =
    process.env.RESEND_FROM?.trim() || "Agent KBase <notifications@agentkbase.com>";

  if (!resendKey) {
    return { ok: false, detail: "RESEND_API_KEY not configured" };
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
        reply_to: payload.email,
      }),
    });
    if (res.ok) {
      return { ok: true };
    }
    const body = await res.text();
    console.error("[waitlist] resend failed", res.status, body.slice(0, 500));
    return { ok: false, detail: body.slice(0, 200) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "resend fetch failed";
    console.error("[waitlist] resend error", message);
    return { ok: false, detail: message };
  }
}
