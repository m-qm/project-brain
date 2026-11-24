import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { extractBrainFromWebsiteUrl } from "@agentkbase/core";
import { loadCompanyBrain } from "@/lib/company-brain";
import { notifyOnboardingLead, type OnboardingSession } from "@/lib/whatsapp-onboarding";

type Locale = "en" | "es";

export type LeadAnswers = {
  name?: string;
  website?: string;
  email?: string;
};

type ChatMessage = { role: "user" | "assistant"; text: string };

export type TelegramChat = {
  from: string;
  locale: Locale;
  messages: ChatMessage[];
  answers: LeadAnswers;
  summary: string;
  emailed: boolean;
  leadEmailed?: boolean;
  siteFor?: string;
  siteSheet?: string;
};

const USER_CAP = 24;
const HISTORY_CAP = 12;

const BEHAVIOR = `You are Agent KBase, texting a business owner on Telegram. This chat is the product you sell: an assistant that answers only from the company brain, then qualifies the person.

Sound like a person: short, warm, honest, immediate. At most two short paragraphs. No bullet list. No emoji. No slash commands.

A first hello starts with "Hi!" in English or "Hola!" in Spanish. Never greet them with a name they have not typed in this chat. Never use a Telegram profile name.

The company brain below is the only source for what Agent KBase is and what it may claim. If a price, date, client, ranking, or feature is missing or marked CONFIRM, say you do not have it and that you will write to them. Do not invent it. Do not mention MCP, git, CLI, or eval unless they ask how a developer would use it. Then one sentence: the truth lives in files they own.

Current status, say this when you introduce yourself and when they ask what you can do now: Agent KBase is in beta and onboarding its first customers. You can read a public page they send and say what that page supports. You cannot publish, post, or run their business yet. Setup is quoted. You do not have a date. Do not say you already write their marketing, or that nothing goes live until they say yes, as if that service is running.

When a site sheet is included, showcase the product in two sentences: what that page supports, and what you would not claim because it is not on the page. Then ask for one missing lead field.

Qualify while you answer. You need the name they want used, their public website, and the email where we write. Ask for one missing piece only. If you already have it, do not ask again.

Stay in the conversation language from the known block. A name, a website, or an email is not a language change. The address hello@ is not the greeting hello.

Return JSON only, no markdown:
{"reply":"...","name":"","website":"","email":"","summary":""}
Use empty strings when unknown. summary is one line on what they want.`;

/** Language of a real sentence. A name, a site, or an email does not switch the chat. */
export function detectedLocale(text: string): Locale | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmed)) return null;
  if (!/\s/.test(trimmed) && cleanLeadWebsite(trimmed)) return null;

  const spanish = /[áéíóúñ¿¡]|\b(hola|buenas|gracias|por favor|cómo|cuál|cuándo|también)\b/i;
  if (/^(hey|hi|hello)\b/i.test(trimmed)) return "en";
  if (spanish.test(trimmed)) return "es";
  if (/\b(what|when|your|thanks|please|website|email|can't|cannot)\b/i.test(trimmed)) return "en";
  return null;
}

function localeOf(text: string, hint?: Locale): Locale {
  return detectedLocale(text) ?? hint ?? "en";
}

export function cleanLeadName(value: string): string {
  const name = value.replace(/\s+/g, " ").trim();
  if (!name || name.length > 40 || /[?@!]|\bhttps?\b|\bwww\./i.test(name)) return "";
  if (name.split(" ").length > 4) return "";
  return name;
}

export function cleanLeadWebsite(value: string): string {
  const found = value.match(/(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?/i)?.[0] ?? "";
  if (!found || found.includes("@")) return "";
  return found.replace(/[),.;]+$/, "");
}

export function cleanLeadEmail(value: string): string {
  const found = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  return found;
}

export function mergeLead(current: LeadAnswers, incoming: LeadAnswers): LeadAnswers {
  return {
    name: cleanLeadName(incoming.name ?? "") || current.name,
    website: cleanLeadWebsite(incoming.website ?? "") || current.website,
    email: cleanLeadEmail(incoming.email ?? "") || current.email,
  };
}

export function leadReady(answers: LeadAnswers): boolean {
  return Boolean(answers.name && answers.website && answers.email);
}

export function parseLeadJson(raw: string): { reply: string; answers: LeadAnswers; summary: string } | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const body = JSON.parse(raw.slice(start, end + 1)) as {
      reply?: string;
      name?: string;
      website?: string;
      email?: string;
      summary?: string;
    };
    const reply = (body.reply ?? "").trim();
    if (!reply) return null;
    return {
      reply,
      answers: { name: body.name ?? "", website: body.website ?? "", email: body.email ?? "" },
      summary: (body.summary ?? "").replace(/\s+/g, " ").trim().slice(0, 240),
    };
  } catch {
    return null;
  }
}

function missing(answers: LeadAnswers): "name" | "website" | "email" | null {
  if (!answers.name) return "name";
  if (!answers.website) return "website";
  if (!answers.email) return "email";
  return null;
}

function ask(locale: Locale, key: "name" | "website" | "email"): string {
  if (locale === "es") {
    if (key === "name") return "¿Cómo te llamas?";
    if (key === "website") return "¿Cuál es tu web?";
    return "¿A qué email te escribo?";
  }
  if (key === "name") return "What's your name?";
  if (key === "website") return "What's your website?";
  return "What email should I use when I write to you?";
}

function answersFromText(text: string, current: LeadAnswers): LeadAnswers {
  const withContact = mergeLead(current, { website: text, email: text });
  if (withContact.name) return withContact;
  const trimmed = text.trim();
  if (/[?]/.test(trimmed) || /^(hi|hello|hey|hola|buenas|thanks|thank you|ok|okay|gracias|vale)\b/i.test(trimmed)) {
    return withContact;
  }
  if (/timeline|when|fecha|plazo|cu[aá]ndo|what can you|qu[eé] puedes|what do you do|para qu[eé]|for me now/i.test(trimmed)) {
    return withContact;
  }
  const name = cleanLeadName(trimmed);
  return name ? { ...withContact, name } : withContact;
}

/** Honest replies when no model key is set. Still qualifies the lead. */
export function scriptLeadReply(locale: Locale, text: string, answers: LeadAnswers): { reply: string; answers: LeadAnswers } {
  const nextAnswers = answersFromText(text, answers);
  const next = missing(nextAnswers);
  const question = next ? ask(locale, next) : "";
  const timeline = /timeline|when|fecha|plazo|cu[aá]ndo|how long|date/i.test(text);
  const capability = /what can you|qu[eé] puedes|what do you do|para qu[eé]|for me now/i.test(text);
  const hello = /^(hi|hello|hey|hola|buenas)\b/i.test(text.trim());

  const reply = (() => {
    if (locale === "es") {
      if (hello && !nextAnswers.name) {
        return `Hola!\n\nSoy Agent KBase. Estamos en beta, con los primeros clientes.\n\nPuedo leer una web pública y decirte qué sostiene esa página. Todavía no publico por ti, y no te invento una fecha. El montaje se cotiza.\n\n${question}`;
      }
      if (timeline) {
        return `La verdad, no tengo una fecha que darte. El montaje se cotiza, y prefiero no inventar un plazo.\n\nTe escribiré aquí. ${question}`.trim();
      }
      if (capability) {
        return `Buena pregunta. Estamos en beta, con los primeros clientes. Ahora mismo no puedo hacerte tareas ni publicar por ti.\n\nPuedo leer una web pública y decirte qué sostiene esa página. El montaje se cotiza. ${question}`.trim();
      }
      if (!next) return "Te escribiré aquí. No tienes que hacer nada más.";
      return `Estamos en beta, con los primeros clientes. Puedo leer una web pública y decirte qué sostiene. El montaje se cotiza.\n\n${question}`;
    }

    if (hello && !nextAnswers.name) {
      return `Hi!\n\nI'm Agent KBase. We're in beta, onboarding our first customers.\n\nI can read a public site and tell you what that page supports. I can't publish for you yet, and I won't invent a date. Setup is quoted.\n\n${question}`;
    }
    if (timeline) {
      return `Honestly, I don't have a date I can give you. Setup is quoted, and I'd rather not guess.\n\nI'll write to you here. ${question}`.trim();
    }
    if (capability) {
      return `Fair question. We're in beta, with our first customers. Right now I can't take on tasks or publish for you.\n\nI can read a public site and tell you what that page supports. Setup is quoted. ${question}`.trim();
    }
    if (!next) return "I'll write to you here. You don't need to do anything else.";
    return `We're in beta, onboarding our first customers. I can read a public site and tell you what it supports. Setup is quoted.\n\n${question}`;
  })();

  return { reply, answers: nextAnswers };
}

async function siteSheet(url: string): Promise<string> {
  const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const extract = await extractBrainFromWebsiteUrl(href, { mode: "single", allowServerLlm: false });
    const sheet = extract.suggested;
    const lines = [
      `Source: ${extract.sourceUrl}`,
      sheet.projectName ? `Name: ${sheet.projectName}` : "",
      sheet.projectDescription ? `Says: ${sheet.projectDescription.slice(0, 500)}` : "",
      ...(sheet.factBullets ?? []).slice(0, 6).map((bullet) => `On the page: ${bullet}`),
      ...(sheet.openQuestions ?? []).slice(0, 4).map((question) => `Not confirmed: ${question}`),
    ].filter(Boolean);
    return lines.join("\n").slice(0, 1800);
  } catch {
    return "";
  }
}

/** What the person sees when they send a public site. Only what the page says. */
export function showcaseReply(locale: Locale, website: string, sheet: string, question: string): string {
  const host = website.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const says = sheet
    .split("\n")
    .filter((line) => /^(Name|Says|On the page):/i.test(line))
    .map((line) => line.replace(/^(Name|Says|On the page):\s*/i, "").trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" ")
    .replace(/\s+/g, " ")
    .slice(0, 320);
  const next = question ? `\n\n${question}` : "";
  if (!says) {
    return locale === "es"
      ? `No he podido leer ${host} desde aquí. Si es pública, mándala otra vez con https.${next}`
      : `I couldn't read ${host} from here. If it is public, send it again with https.${next}`;
  }
  if (locale === "es") {
    return `He leído ${host}.\n\nLa página dice: ${says}\n\nNo añadiría un precio, un cliente o un resultado que no esté en esa página.${next}`;
  }
  return `I read ${host}.\n\nThe page says: ${says}\n\nI would not add a price, a client, or a result that is not on that page.${next}`;
}

function mentionsSite(reply: string, website: string): boolean {
  const host = website.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0].toLowerCase();
  return Boolean(host && reply.toLowerCase().includes(host));
}

async function ensureSiteSheet(chat: TelegramChat): Promise<void> {
  const website = chat.answers.website;
  if (!website || chat.siteFor === website) return;
  chat.siteFor = website;
  chat.siteSheet = await siteSheet(website);
}

async function complete(messages: ChatMessage[]): Promise<string | null> {
  const brain = await loadCompanyBrain();
  const system = `${BEHAVIOR}\n\n${brain}`;
  const anthropic = process.env.ANTHROPIC_API_KEY?.trim();
  if (anthropic) {
    const model =
      process.env.TELEGRAM_CHAT_MODEL?.trim() ||
      process.env.ANTHROPIC_EXTRACT_MODEL?.trim() ||
      "claude-3-5-haiku-latest";
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropic,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        temperature: 0.4,
        system,
        messages: messages.slice(-HISTORY_CAP).map((message) => ({
          role: message.role,
          content: message.text,
        })),
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { content?: { type: string; text?: string }[] };
    return data.content?.find((block) => block.type === "text")?.text ?? null;
  }

  const openai = process.env.OPENAI_API_KEY?.trim();
  if (!openai) return null;
  const model = process.env.TELEGRAM_CHAT_MODEL?.trim() || process.env.OPENAI_EXTRACT_MODEL?.trim() || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openai}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        ...messages.slice(-HISTORY_CAP).map((message) => ({ role: message.role, content: message.text })),
      ],
    }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? null;
}

function chatFile(): string {
  const dir = process.env.TELEGRAM_ONBOARDING_DIR || "/tmp/agentkbase-telegram";
  return path.join(dir, "chats.json");
}

export async function readTelegramChat(from: string): Promise<TelegramChat | null> {
  try {
    const all = JSON.parse(await readFile(chatFile(), "utf8")) as Record<string, TelegramChat>;
    return all[from] ?? null;
  } catch {
    return null;
  }
}

export async function writeTelegramChat(chat: TelegramChat): Promise<void> {
  const file = chatFile();
  await mkdir(path.dirname(file), { recursive: true });
  let all: Record<string, TelegramChat> = {};
  try {
    all = JSON.parse(await readFile(file, "utf8")) as Record<string, TelegramChat>;
  } catch {
    all = {};
  }
  all[chat.from] = chat;
  await writeFile(file, JSON.stringify(all, null, 2));
}

function knownBlock(chat: TelegramChat): string {
  return [
    `Language: ${chat.locale}`,
    `Known name: ${chat.answers.name ?? ""}`,
    `Known website: ${chat.answers.website ?? ""}`,
    `Known email: ${chat.answers.email ?? ""}`,
    `Already emailed: ${chat.emailed ? "yes" : "no"}`,
    chat.siteSheet ? `Site sheet:\n${chat.siteSheet}` : "Site sheet:",
  ].join("\n");
}

export async function replyToTelegramLead(
  chat: TelegramChat | null,
  input: { from: string; text: string; localeHint?: Locale },
): Promise<{ chat: TelegramChat; reply: string }> {
  const locale = localeOf(input.text, chat?.locale ?? input.localeHint);
  const current: TelegramChat = chat ?? {
    from: input.from,
    locale,
    messages: [],
    answers: {},
    summary: "",
    emailed: false,
  };
  current.locale = locale;

  const userCount = current.messages.filter((message) => message.role === "user").length;
  const fromText = answersFromText(input.text, current.answers);
  let reply = "";
  let summary = current.summary;

  if (userCount >= USER_CAP) {
    current.answers = fromText;
    reply =
      locale === "es"
        ? "Te escribiré aquí. No tienes que hacer nada más."
        : "I'll write to you here. You don't need to do anything else.";
  } else {
    const previousWebsite = current.answers.website ?? "";
    current.answers = fromText;
    await ensureSiteSheet(current);
    const readSite = Boolean(current.answers.website && current.answers.website !== previousWebsite);
    const history = [
      ...current.messages,
      { role: "user" as const, text: `${knownBlock(current)}\n\nThey just wrote:\n${input.text}` },
    ];
    const raw = await complete(history).catch(() => null);
    const parsed = raw ? parseLeadJson(raw) : null;
    const nextField = missing(parsed ? mergeLead(fromText, parsed.answers) : current.answers);
    const question = nextField ? ask(locale, nextField) : "";
    const shown =
      readSite && current.answers.website
        ? showcaseReply(locale, current.answers.website, current.siteSheet ?? "", question)
        : "";
    const modelShowsSite = Boolean(
      parsed && current.answers.website && mentionsSite(parsed.reply, current.answers.website),
    );
    if (parsed && (!readSite || modelShowsSite)) {
      reply = parsed.reply;
      current.answers = mergeLead(fromText, parsed.answers);
      summary = parsed.summary || summary;
    } else if (shown) {
      reply = shown;
      if (parsed) {
        current.answers = mergeLead(fromText, parsed.answers);
        summary = parsed.summary || summary;
      }
    } else {
      const scripted = scriptLeadReply(locale, input.text, current.answers);
      current.answers = scripted.answers;
      reply = scripted.reply;
    }
  }

  if (!reply.trim()) {
    const scripted = scriptLeadReply(locale, input.text, current.answers);
    current.answers = scripted.answers;
    reply = scripted.reply;
  }

  current.summary = summary;
  current.messages = [
    ...current.messages,
    { role: "user" as const, text: input.text },
    { role: "assistant" as const, text: reply },
  ].slice(-HISTORY_CAP);

  if (leadReady(current.answers) && (!current.emailed || !current.leadEmailed)) {
    const session: OnboardingSession = {
      from: current.from,
      locale,
      step: 3,
      answers: current.answers,
      done: true,
      channel: "telegram",
    };
    const said = current.messages.filter((message) => message.role === "user").map((message) => message.text);
    const sent = await notifyOnboardingLead(session, { summary: current.summary, said }, {
      owner: !current.emailed,
      lead: !current.leadEmailed,
    });
    if (sent.owner) current.emailed = true;
    if (sent.lead && !current.leadEmailed) {
      reply +=
        locale === "es"
          ? "\n\nTe he enviado un email para confirmar que hemos recibido tus datos."
          : "\n\nI sent you an email to confirm we received your details.";
    }
    if (sent.lead) current.leadEmailed = true;
  }

  return { chat: current, reply };
}
