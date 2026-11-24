import { normalizeMobile, whatsAppChatUrl } from "@/lib/whatsapp-onboarding";

/**
 * Instinct-style start: the number is the identity.
 * A first-contact WhatsApp template is not assumed. The client opens the chat,
 * and that thread is the setup.
 */
export async function POST(req: Request) {
  let body: { phone?: string; locale?: string };
  try {
    body = (await req.json()) as { phone?: string; locale?: string };
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const phone = normalizeMobile(body.phone ?? "");
  if (!phone) {
    return Response.json({ error: "Enter a mobile number with the country code." }, { status: 400 });
  }

  const locale = body.locale === "es" ? "es" : "en";
  return Response.json({ phone, waUrl: whatsAppChatUrl(locale) });
}
