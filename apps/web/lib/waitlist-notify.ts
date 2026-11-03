export type WaitlistPayload = {
  email: string;
  source: string;
  product: string;
  at: string;
};

export type WaitlistSendResult = {
  ok: boolean;
  detail?: string;
  channel?: "domain";
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
    "New knowledge layer waitlist signup",
    "",
    `Submitter email (form field): ${payload.email}`,
    `Reply-To on this message is set to that address.`,
    "",
    `Source: ${payload.source}`,
    `Product: ${payload.product}`,
    `At: ${payload.at}`,
  ].join("\n");
}

function subscriberConfirmText(payload: WaitlistPayload): string {
  return [
    "Thanks for joining the Agent KBase knowledge layer waitlist.",
    "",
    "We will email you when the base is ready for your studio. No need to reply to this message.",
    "",
    "If you did not sign up, ignore this email.",
  ].join("\n");
}

export async function sendWaitlistEmail(payload: WaitlistPayload): Promise<WaitlistSendResult> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const notifyTo = process.env.WAITLIST_NOTIFY_EMAIL?.trim() || "hello@agentkbase.com";
  const from =
    process.env.RESEND_FROM?.trim() || "Agent KBase <notifications@agentkbase.com>";

  if (!resendKey) {
    return { ok: false, detail: "RESEND_API_KEY not configured" };
  }

  try {
    const owner = await resendSend(
      resendKey,
      from,
      [notifyTo],
      `Waitlist: ${payload.email}`,
      ownerNotifyText(payload),
      payload.email,
    );
    if (!owner.ok) {
      console.error("[waitlist] resend notify failed", owner.status, owner.body.slice(0, 500));
      return { ok: false, detail: owner.body.slice(0, 200) };
    }

    let subscriberNotified = false;
    const confirm = await resendSend(
      resendKey,
      from,
      [payload.email],
      "You're on the Agent KBase knowledge layer waitlist",
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "resend fetch failed";
    console.error("[waitlist] resend error", message);
    return { ok: false, detail: message };
  }
}
