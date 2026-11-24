import {
  inboundText,
  nextOnboarding,
  notifyOnboardingLead,
  readOnboardingSession,
  writeOnboardingSession,
} from "@/lib/whatsapp-onboarding";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_VERIFY_TOKEN;
  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("forbidden", { status: 403 });
}

async function sendReply(to: string, body: string, token: string, phoneNumberId: string) {
  await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: true });
  }

  const inbound = inboundText(body);
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!inbound || !token || !phoneNumberId) {
    return Response.json({ ok: true });
  }

  const previous = await readOnboardingSession(inbound.from);
  const turn = nextOnboarding(previous, inbound.text, inbound.from);
  await writeOnboardingSession(turn.session);
  if (turn.finished) await notifyOnboardingLead(turn.session);

  await sendReply(inbound.from, turn.reply, token, phoneNumberId).catch(() => undefined);
  return Response.json({ ok: true });
}
