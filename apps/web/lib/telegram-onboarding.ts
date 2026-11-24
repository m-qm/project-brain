/** Public bot username, without @. Empty until TELEGRAM_BOT_USERNAME is set. */
export function telegramBotUsername(): string {
  return (process.env.NEXT_PUBLIC_TELEGRAM_BOT ?? process.env.TELEGRAM_BOT_USERNAME ?? "")
    .trim()
    .replace(/^@/, "")
    .replace(/[^A-Za-z0-9_]/g, "");
}

/** Opens the setup bot. The visible label stays generic; the number is not part of this link. */
export function telegramChatUrl(locale: string): string {
  const bot = telegramBotUsername();
  const start = locale === "es" ? "hola" : "hi";
  if (!bot) return "https://t.me/";
  return `https://t.me/${bot}?start=${start}`;
}

type TelegramMessage = {
  text?: string;
  from?: { id?: number; language_code?: string };
  chat?: { id?: number };
};

export function telegramInbound(body: unknown): { from: string; text: string; localeHint?: "en" | "es" } | null {
  const message = (body as { message?: TelegramMessage })?.message;
  const from = message?.from?.id ?? message?.chat?.id;
  const raw = message?.text?.trim() ?? "";
  if (!from || !raw) return null;

  const language = message?.from?.language_code ?? "";
  const localeHint = language.toLowerCase().startsWith("es")
    ? "es"
    : language.toLowerCase().startsWith("en")
      ? "en"
      : undefined;

  let text = raw;
  if (/^\/start(?:@\w+)?(?:\s|$)/i.test(raw)) {
    const payload = raw.replace(/^\/start(?:@\w+)?/i, "").trim();
    text = payload || (localeHint === "es" ? "Hola" : "Hi");
  }

  return { from: String(from), text, localeHint };
}

export async function sendTelegramText(token: string, chatId: string, text: string): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!response.ok) throw new Error(`Telegram sendMessage failed (${response.status}).`);
}
