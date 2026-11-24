import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const body = [
    "# Agent KBase",
    "",
    "> A company assistant you text on Telegram. We're in beta, onboarding our first customers. From your website we build your company's knowledge base.",
    "",
    "Free. Setup is quoted.",
    "",
    `Email: hello@agentkbase.com`,
    `Home: ${SITE_URL}/`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
