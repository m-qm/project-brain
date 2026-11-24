/** Digits only, country code included. Empty when the number is not usable. */
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

/** The new client is already in the thread. The first line is the setup. */
export function openingLine(locale: string): string {
  if (locale === "es") {
    return "Hola. Este chat es el alta. No hay formulario. Mi web es ";
  }
  return "Hi. This chat is the setup. There is no form. My website is ";
}

export function whatsAppChatUrl(locale: string): string {
  const business = businessWhatsAppNumber();
  const text = encodeURIComponent(openingLine(locale));
  if (!business) return `https://wa.me/?text=${text}`;
  return `https://wa.me/${business}?text=${text}`;
}

export function onboardingReply(text: string): string {
  const spanish = /alta|hola|mi web|formulario/i.test(text);
  const hasSite = /https?:\/\/|www\.|\b[a-z0-9-]+\.[a-z]{2,}\b/i.test(text);
  if (!hasSite) {
    return spanish
      ? "Este chat es el alta. No hay formulario. Mándame la dirección pública de tu web."
      : "This chat is the setup. There is no form. Send the public address of your website.";
  }
  return spanish
    ? "La leo. Respóndeme qué servicios, precios o plazos de esa página no vendes. Nada se publica hasta que digas sí."
    : "I'll read it. Reply with any service, price, or deadline on that page you do not sell. Nothing goes live until you say yes.";
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
