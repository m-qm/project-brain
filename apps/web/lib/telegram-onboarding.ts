/** Public bot. Override with TELEGRAM_BOT_USERNAME if the handle changes. */
const DEFAULT_BOT = "agentkbase_bot";

export function telegramBotUsername(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_TELEGRAM_BOT ?? process.env.TELEGRAM_BOT_USERNAME ?? "")
    .trim()
    .replace(/^@/, "")
    .replace(/[^A-Za-z0-9_]/g, "");
  return fromEnv || DEFAULT_BOT;
}

/** What /start stands for. A bot link cannot prefill a sentence, so Start sends this hello. */
export function telegramOpeningLine(locale: string): string {
  return locale === "es" ? "Hola Agent KBase!" : "Hey Agent KBase!";
}

/**
 * Opens @agentkbase_bot. Telegram shows Start; the tap delivers /start hey or /start hola
 * and the webhook answers. Start payloads cannot contain spaces.
 */
export function telegramChatUrl(locale: string): string {
  const bot = telegramBotUsername();
  const start = locale === "es" ? "hola" : "hey";
  return `https://t.me/${bot}?start=${start}`;
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
