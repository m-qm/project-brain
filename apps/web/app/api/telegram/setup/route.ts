import { SITE_URL } from "@/lib/site";
import { telegramBotUsername } from "@/lib/telegram-onboarding";

/** Point @agentkbase_bot at this site. Uses the server token and never returns it. */
export async function POST() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    return Response.json({ ok: false, error: "TELEGRAM_BOT_TOKEN is not set on this server" }, { status: 503 });
  }

  const webhook = `${SITE_URL}/api/telegram/webhook`;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const set = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url: webhook,
      ...(secret ? { secret_token: secret } : {}),
      allowed_updates: ["message"],
    }),
  });
  const setBody = (await set.json().catch(() => null)) as { ok?: boolean; description?: string } | null;

  const me = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const meBody = (await me.json().catch(() => null)) as { ok?: boolean; result?: { username?: string } } | null;
  const username = meBody?.result?.username;

  return Response.json({
    ok: Boolean(setBody?.ok),
    webhook,
    bot: username ? `@${username}` : `@${telegramBotUsername()}`,
    description: setBody?.description ?? "",
  });
}
