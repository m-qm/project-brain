import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const body = [
    "# Agent KBase",
    "",
    "> A company assistant you text on Telegram. There is no app. Send your website. It writes from that site. It can draft a LinkedIn post, stop a price you do not charge, or wait until you say yes.",
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
