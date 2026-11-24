import { normalizeBrainId } from "./brain-id";

/** Public bot. Override with TELEGRAM_BOT_NAME (or TELEGRAM_BOT_USERNAME). */
const DEFAULT_BOT = "agentkbase_bot";

function readBotName(): string {
  const raw = (
    process.env.TELEGRAM_BOT_NAME ??
    process.env.TELEGRAM_BOT_USERNAME ??
    process.env.NEXT_PUBLIC_TELEGRAM_BOT ??
    ""
  ).trim();
  if (!raw || /\s/.test(raw)) return "";
  return raw.replace(/^@/, "").replace(/[^A-Za-z0-9_]/g, "");
}

export function telegramBotUsername(): string {
  return readBotName() || DEFAULT_BOT;
}

/** Sentence already written in the message box. People send this, not a slash command. */
export function telegramOpeningLine(locale: string): string {
  return locale === "es" ? "Hola Agent KBase!" : "Hey Agent KBase!";
}

/** Opens @agentkbase_bot with that sentence filled in. Public lead chat: no start id. */
export function telegramChatUrl(locale: string): string {
  const bot = telegramBotUsername();
  const text = encodeURIComponent(telegramOpeningLine(locale));
  return `https://t.me/${bot}?text=${text}`;
}

/** One bot. The id picks a folder under storage/telegram-brains. */
export function telegramShowcaseUrl(brainId: string): string {
  const bot = telegramBotUsername();
  const id = normalizeBrainId(brainId);
  if (!id) return `https://t.me/${bot}`;
  return `https://t.me/${bot}?start=${id}`;
}

type TelegramMessage = {
  text?: string;
  from?: { id?: number; first_name?: string; language_code?: string };
  chat?: { id?: number };
};

export function telegramInbound(body: unknown): {
  from: string;
  text: string;
  localeHint?: "en" | "es";
  profileName?: string;
  /** Present only for /start. brainId null keeps the public company chat. */
  start?: { brainId: string | null };
} | null {
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
  let start: { brainId: string | null } | undefined;
  if (/^\/start(?:@\w+)?(?:\s|$)/i.test(raw)) {
    const payload = raw.replace(/^\/start(?:@\w+)?/i, "").trim();
    const brainId = normalizeBrainId(payload);
    start = { brainId };
    if (brainId) text = localeHint === "es" ? "Hola" : "Hello";
    else text = localeHint === "es" ? "Hola Agent KBase!" : "Hey Agent KBase!";
  }

  return { from: String(from), text, localeHint, profileName, ...(start ? { start } : {}) };
}

export async function sendTelegramText(token: string, chatId: string, text: string): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!response.ok) throw new Error(`Telegram sendMessage failed (${response.status}).`);
}
