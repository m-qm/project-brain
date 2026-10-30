import { extractBrainFromWebsiteUrl } from "@agentkbase/core";

export async function POST(req: Request) {
  let body: { url?: string };
  try {
    body = (await req.json()) as { url?: string };
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return Response.json({ error: "url is required." }, { status: 400 });
  }

  try {
    const extract = await extractBrainFromWebsiteUrl(rawUrl);
    return Response.json(extract);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Extract failed.";
    return Response.json({ error: message }, { status: 422 });
  }
}
