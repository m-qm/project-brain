/** Public bot username, without @. Empty until TELEGRAM_BOT_USERNAME is set. */
export function telegramBotUsername(): string {
  return (process.env.NEXT_PUBLIC_TELEGRAM_BOT ?? process.env.TELEGRAM_BOT_USERNAME ?? "")
    .trim()
    .replace(/^@/, "")
    .replace(/[^A-Za-z0-9_]/g, "");
}

/** Phrase already sitting in the message box. The person still taps send. */
export function telegramOpeningLine(locale: string): string {
  return locale === "es" ? "Hola Agent KBase!" : "Hey Agent KBase!";
}

/** Opens the chat with that phrase filled in. No phone number in the link. */
export function telegramChatUrl(locale: string): string {
  const bot = telegramBotUsername();
  const text = encodeURIComponent(telegramOpeningLine(locale));
  if (!bot) return `https://t.me/?text=${text}`;
  return `https://t.me/${bot}?text=${text}`;
}

type TelegramMessage = {
  text?: string;
  from?: { id?: number; first_name?: string; language_code?: string };
  chat?: { id?: number };
};

export function telegramInbound(
  body: unknown,
): { from: string; text: string; localeHint?: "en" | "es"; profileName?: string } | null {
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

  const profileName = (message?.from?.first_name ?? "").replace(/\s+/g, " ").trim().slice(0, 40) || undefined;

  let text = raw;
  if (/^\/start(?:@\w+)?(?:\s|$)/i.test(raw)) {
    const payload = raw.replace(/^\/start(?:@\w+)?/i, "").trim();
    text = payload || (localeHint === "es" ? "Hola Agent KBase!" : "Hey Agent KBase!");
  }

  return { from: String(from), text, localeHint, profileName };
}

export async function sendTelegramText(token: string, chatId: string, text: string): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!response.ok) throw new Error(`Telegram sendMessage failed (${response.status}).`);
}
