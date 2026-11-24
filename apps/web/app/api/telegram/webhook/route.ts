import { telegramInbound, sendTelegramText } from "@/lib/telegram-onboarding";
import { readTelegramChat, replyToTelegramLead, writeTelegramChat } from "@/lib/telegram-chat";

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

  const previous = await readTelegramChat(inbound.from);
  const turn = await replyToTelegramLead(previous, {
    from: inbound.from,
    text: inbound.text,
    localeHint: inbound.localeHint,
  });
  await writeTelegramChat(turn.chat);
  await sendTelegramText(token, inbound.from, turn.reply).catch(() => undefined);
  return Response.json({ ok: true });
}
