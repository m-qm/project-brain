import { telegramInbound, sendTelegramText } from "@/lib/telegram-onboarding";
import {
  nextOnboarding,
  notifyOnboardingLead,
  readOnboardingSession,
  writeOnboardingSession,
} from "@/lib/whatsapp-onboarding";

export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return new Response("forbidden", { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: true });
  }

  const inbound = telegramInbound(body);
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!inbound || !token) return Response.json({ ok: true });

  const previous = await readOnboardingSession(inbound.from, "telegram");
  const turn = nextOnboarding(previous, inbound.text, inbound.from, {
    channel: "telegram",
    localeHint: previous ? undefined : inbound.localeHint,
  });
  await writeOnboardingSession(turn.session);
  if (turn.finished) await notifyOnboardingLead(turn.session);

  await sendTelegramText(token, inbound.from, turn.reply).catch(() => undefined);
  return Response.json({ ok: true });
}
