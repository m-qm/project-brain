export type WaitlistPayload = {
  email: string;
  source: string;
  product: string;
  at: string;
};

export type WaitlistSendResult = {
  ok: boolean;
  detail?: string;
  channel?: "domain" | "fallback";
  ownerNotified?: boolean;
  subscriberNotified?: boolean;
};

async function resendSend(
  apiKey: string,
  from: string,
  to: string[],
  subject: string,
  text: string,
  replyTo?: string,
): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

function ownerNotifyText(payload: WaitlistPayload): string {
  return [
    "New Company Brain waitlist signup",
    "",
    `Email: ${payload.email}`,
    `Source: ${payload.source}`,
    `Product: ${payload.product}`,
    `At: ${payload.at}`,
  ].join("\n");
}

function subscriberConfirmText(payload: WaitlistPayload): string {
  return [
    "Thanks for joining the Company Brain Pack waitlist on Agent KBase.",
    "",
    "We will email you when the Pack launches. No need to reply to this message.",
    "",
    "If you did not sign up, ignore this email.",
  ].join("\n");
}

export async function sendWaitlistEmail(payload: WaitlistPayload): Promise<WaitlistSendResult> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const notifyTo = process.env.WAITLIST_NOTIFY_EMAIL?.trim() || "mireiaquerol@gmail.com";
  const from =
    process.env.RESEND_FROM?.trim() || "Agent KBase <notifications@agentkbase.com>";
  const fallbackTo =
    process.env.WAITLIST_RESEND_FALLBACK_TO?.trim() || "mireiaquerol@gmail.com";
  const fallbackFrom =
    process.env.WAITLIST_RESEND_FALLBACK_FROM?.trim() || "Agent KBase <onboarding@resend.dev>";

  if (!resendKey) {
    return { ok: false, detail: "RESEND_API_KEY not configured" };
  }

  try {
    const primary = await resendSend(
      resendKey,
      from,
      [notifyTo],
      `Waitlist: ${payload.email}`,
      ownerNotifyText(payload),
      payload.email,
    );
    if (primary.ok) {
      let subscriberNotified = false;
      const confirm = await resendSend(
        resendKey,
        from,
        [payload.email],
        "You're on the Company Brain waitlist",
        subscriberConfirmText(payload),
      );
      if (confirm.ok) {
        subscriberNotified = true;
      } else {
        console.error("[waitlist] confirmation email failed", confirm.status, confirm.body.slice(0, 300));
      }
      return {
        ok: true,
        channel: "domain",
        ownerNotified: true,
        subscriberNotified,
      };
    }
    console.error("[waitlist] resend primary failed", primary.status, primary.body.slice(0, 500));

    const useFallback = process.env.WAITLIST_RESEND_FALLBACK !== "false";
    if (!useFallback) {
      return { ok: false, detail: primary.body.slice(0, 200) };
    }

    let fallback = await resendSend(
      resendKey,
      fallbackFrom,
      [fallbackTo],
      `Waitlist: ${payload.email}`,
      ownerNotifyText(payload),
      payload.email,
    );
    const bridgeInbox = process.env.WAITLIST_RESEND_BRIDGE_INBOX?.trim();
    if (
      !fallback.ok &&
      bridgeInbox &&
      bridgeInbox.toLowerCase() !== fallbackTo.toLowerCase() &&
      fallback.body.includes("only send testing emails")
    ) {
      fallback = await resendSend(
        resendKey,
        fallbackFrom,
        [bridgeInbox],
        `Waitlist (forward to ${fallbackTo}): ${payload.email}`,
        ownerNotifyText(payload),
        payload.email,
      );
      if (fallback.ok) {
        console.warn("[waitlist] bridge inbox until agentkbase.com verified; forward to", fallbackTo);
      }
    }
    if (fallback.ok) {
      console.warn("[waitlist] used Resend fallback until agentkbase.com is verified");
      return {
        ok: true,
        channel: "fallback",
        ownerNotified: true,
        subscriberNotified: false,
      };
    }
    console.error("[waitlist] resend fallback failed", fallback.status, fallback.body.slice(0, 500));
    return { ok: false, detail: fallback.body.slice(0, 200) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "resend fetch failed";
    console.error("[waitlist] resend error", message);
    return { ok: false, detail: message };
  }
}
