/** Digits only, country code included. Empty when the number is not usable. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
export function normalizeMobile(input: string): string {
  const digits = input.replace(/[^\d]/g, "");
  if (digits.length < 8 || digits.length > 15) return "";
  return digits;
}

/** Interim line until a dedicated business number exists. Spain mobile 601 334 941. */
const INTERIM_WHATSAPP_E164 = "34601334941";

export function businessWhatsAppNumber(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? process.env.WHATSAPP_E164 ?? "").replace(
    /[^\d]/g,
    "",
  );
  return fromEnv || INTERIM_WHATSAPP_E164;
}

/** The new client only says hello. The bot asks the rest. */
export function openingLine(locale: string): string {
  return locale === "es" ? "Hola" : "Hi";
}

export function whatsAppChatUrl(locale: string): string {
  const business = businessWhatsAppNumber();
  const text = encodeURIComponent(openingLine(locale));
  if (!business) return `https://wa.me/?text=${text}`;
  return `https://wa.me/${business}?text=${text}`;
}

const WHATSAPP_KEYS = ["name", "website", "offer", "never", "email"] as const;
const TELEGRAM_KEYS = ["name", "website", "email"] as const;
type AnswerKey = (typeof WHATSAPP_KEYS)[number];

function keysFor(channel: OnboardingChannel): readonly AnswerKey[] {
  return channel === "telegram" ? TELEGRAM_KEYS : WHATSAPP_KEYS;
}

const QUESTIONS: Record<"en" | "es", string[]> = {
  en: [
    "What is your name?",
    "What is the public address of your website?",
    "In one line, what do you sell?",
    "What must we never claim? A price, a client, or a deadline is enough.",
    "What email should we use when we contact you?",
  ],
  es: [
    "¿Cómo te llamas?",
    "¿Cuál es la dirección pública de tu web?",
    "En una línea, ¿qué vendes?",
    "¿Qué no debemos afirmar nunca? Vale un precio, un cliente o un plazo.",
    "¿A qué email te escribimos?",
  ],
};

export type OnboardingChannel = "whatsapp" | "telegram";

export type OnboardingSession = {
  from: string;
  locale: "en" | "es";
  step: number;
  answers: Partial<Record<AnswerKey, string>>;
  done: boolean;
  channel?: OnboardingChannel;
};

export type OnboardingTurn = {
  session: OnboardingSession;
  reply: string;
  finished: boolean;
};

function detectLocale(text: string): "en" | "es" {
  return /[áéíóúñ¿¡]|hola|buenas|empez|web|vendo|llamo/i.test(text) ? "es" : "en";
}

function isOpener(text: string): boolean {
  return (
    /^(hi|hello|hey|hola|buenas|start|empezar|\/start)\b/i.test(text.trim()) ||
    /this chat is the setup|este chat es el alta/i.test(text)
  );
}

function thanks(locale: "en" | "es", channel: OnboardingChannel = "whatsapp", name = ""): string {
  if (channel === "telegram") {
    const who = name ? `, ${name}` : "";
    return locale === "es"
      ? `Gracias${who}. Ya tengo tu web y tu email.\n\nTe escribiré aquí. No tienes que hacer nada más.`
      : `Thanks${who}. I have your site and your email.\n\nI'll write to you here. You don't need to do anything else.`;
  }
  return locale === "es"
    ? "Gracias. Ya tenemos tus respuestas y este WhatsApp. Te contactamos por aquí."
    : "Thanks. We have your answers and this WhatsApp. We will contact you here.";
}

function telegramWelcome(locale: "en" | "es"): string {
  if (locale === "es") {
    return "Hola!\n\nSoy Agent KBase. Estamos en beta, con los primeros clientes.\n\nPuedo leer una web pública y decirte qué sostiene esa página. Todavía no publico por ti, y no te invento una fecha. El montaje se cotiza.\n\n¿Cómo te llamas?";
  }
  return "Hi!\n\nI'm Agent KBase. We're in beta, onboarding our first customers.\n\nI can read a public site and tell you what that page supports. I can't publish for you yet, and I won't invent a date. Setup is quoted.\n\nWhat's your name?";
}

function telegramFollowUp(locale: "en" | "es", key: AnswerKey, name?: string): string {
  if (key === "website" && name) {
    return locale === "es" ? `Hola ${name}. ¿Cuál es tu web?` : `Hi ${name}. What's your website?`;
  }
  if (key === "email") {
    return locale === "es" ? "¿A qué email te escribo?" : "What email should I use when I write to you?";
  }
  return locale === "es" ? "¿Cómo te llamas?" : "What's your name?";
}

/** One question at a time. The first hello does not count as an answer. */
export function nextOnboarding(
  session: OnboardingSession | null,
  text: string,
  from: string,
  options?: { channel?: OnboardingChannel; localeHint?: "en" | "es"; profileName?: string },
): OnboardingTurn {
  const trimmed = text.trim();
  const channel = options?.channel ?? session?.channel ?? "whatsapp";
  const keys = keysFor(channel);
  if (session?.done) {
    return {
      session,
      reply: thanks(session.locale, session.channel ?? channel, session.answers.name ?? ""),
      finished: false,
    };
  }

  if (!session || (session.step === 0 && Object.keys(session.answers).length === 0 && isOpener(trimmed))) {
    const locale =
      /^hey\b|^hi\b|^hello\b/i.test(trimmed) && !/hola|buenas/i.test(trimmed)
        ? "en"
        : /hola|buenas|[áéíóúñ¿¡]/i.test(trimmed)
          ? "es"
          : (options?.localeHint ?? detectLocale(trimmed));
    const fresh: OnboardingSession = {
      from,
      locale,
      step: 0,
      answers: {},
      done: false,
      channel,
    };
    const reply = channel === "telegram" ? telegramWelcome(locale) : QUESTIONS[locale][0];
    return { session: fresh, reply, finished: false };
  }

  const current = session;
  const key = keys[current.step];
  if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    const reply =
      channel === "telegram"
        ? current.locale === "es"
          ? "Ese email no parece correcto. ¿A qué email te escribo?"
          : "That email doesn't look right. What email should I use when I write to you?"
        : current.locale === "es"
          ? "Ese email no vale. ¿A qué email te escribimos?"
          : "That email does not work. What email should we use when we contact you?";
    return { session: current, reply, finished: false };
  }

  const answers = { ...current.answers, [key]: trimmed };
  const step = current.step + 1;
  if (step >= keys.length) {
    const done: OnboardingSession = { ...current, answers, step, done: true, channel: current.channel ?? channel };
    return { session: done, reply: thanks(current.locale, done.channel, answers.name ?? ""), finished: true };
  }
  const reply =
    channel === "telegram" ? telegramFollowUp(current.locale, keys[step], answers.name) : QUESTIONS[current.locale][step];
  return {
    session: { ...current, answers, step, done: false },
    reply,
    finished: false,
  };
}

export function onboardingReply(text: string): string {
  return nextOnboarding(null, text, "").reply;
}

type GraphMessage = {
  from?: string;
  type?: string;
  text?: { body?: string };
};

/** Pull the first inbound text out of a WhatsApp Cloud API webhook body. */
export function inboundText(body: unknown): { from: string; text: string } | null {
  const root = body as {
    entry?: { changes?: { value?: { messages?: GraphMessage[] } }[] }[];
  };
  const message = root.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const from = message?.from ?? "";
  const text = message?.text?.body?.trim() ?? "";
  if (!from || !text) return null;
  return { from, text };
}

function sessionFile(channel: OnboardingChannel = "whatsapp"): string {
  const dir =
    channel === "telegram"
      ? process.env.TELEGRAM_ONBOARDING_DIR || "/tmp/agentkbase-telegram"
      : process.env.WHATSAPP_ONBOARDING_DIR || "/tmp/agentkbase-whatsapp";
  return path.join(dir, "sessions.json");
}

export async function readOnboardingSession(
  from: string,
  channel: OnboardingChannel = "whatsapp",
): Promise<OnboardingSession | null> {
  try {
    const raw = await readFile(sessionFile(channel), "utf8");
    const all = JSON.parse(raw) as Record<string, OnboardingSession>;
    return all[from] ?? null;
  } catch {
    return null;
  }
}

export async function writeOnboardingSession(session: OnboardingSession): Promise<void> {
  const file = sessionFile(session.channel ?? "whatsapp");
  await mkdir(path.dirname(file), { recursive: true });
  let all: Record<string, OnboardingSession> = {};
  try {
    all = JSON.parse(await readFile(file, "utf8")) as Record<string, OnboardingSession>;
  } catch {
    all = {};
  }
  all[session.from] = session;
  await writeFile(file, JSON.stringify(all, null, 2));
}

/** Email the finished answers so a person can reply in the same chat. */
export async function notifyOnboardingLead(
  session: OnboardingSession,
  notes?: { summary?: string; said?: string[] },
): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const notifyTo = process.env.WAITLIST_NOTIFY_EMAIL?.trim() || "hello@agentkbase.com";
  const from = process.env.RESEND_FROM?.trim() || "Agent KBase <notifications@agentkbase.com>";
  const channel = session.channel ?? "whatsapp";
  const channelName = channel === "telegram" ? "Telegram" : "WhatsApp";
  const contact = channel === "telegram" ? `Telegram id: ${session.from}` : `WhatsApp: +${session.from}`;
  const lines = [
    `${channelName} onboarding finished`,
    "",
    contact,
    `Name: ${session.answers.name ?? ""}`,
    `Website: ${session.answers.website ?? ""}`,
    ...(session.answers.offer ? [`Sells: ${session.answers.offer}`] : []),
    ...(session.answers.never ? [`Never claim: ${session.answers.never}`] : []),
    `Email: ${session.answers.email ?? ""}`,
    ...(notes?.summary ? ["", `Summary: ${notes.summary}`] : []),
    ...(notes?.said?.length ? ["", "They said:", ...notes.said.map((line) => `- ${line}`)] : []),
  ];
  if (!resendKey) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [notifyTo],
      subject: `${channelName} lead: ${session.answers.name ?? session.from}`,
      text: lines.join("\n"),
      ...(session.answers.email ? { reply_to: session.answers.email } : {}),
    }),
  }).catch(() => undefined);
  return Boolean(response?.ok);
}
