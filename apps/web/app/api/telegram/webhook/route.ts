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
  if (!inbound) return Response.json({ ok: true });

  const previous = await readTelegramChat(inbound.from);
  const turn = await replyToTelegramLead(previous, {
    from: inbound.from,
    text: inbound.text,
    localeHint: inbound.localeHint,
    start: inbound.start,
  });
  await writeTelegramChat(turn.chat);

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (token) await sendTelegramText(token, inbound.from, turn.reply).catch(() => undefined);

  if (process.env.NODE_ENV === "production") return Response.json({ ok: true });
  return Response.json({ ok: true, reply: turn.reply, brain: turn.brain });
}
