import { extractBrainFromWebsiteUrl, type ExtractScanMode } from "@agentkbase/core";
import { allowServerLlmInWebApi } from "@/lib/server-llm-policy";

export async function POST(req: Request) {
  let body: { url?: string; mode?: ExtractScanMode };
  try {
    body = (await req.json()) as { url?: string; mode?: ExtractScanMode };
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return Response.json({ error: "url is required." }, { status: 400 });
  }

  const mode = body.mode ?? "single";
  if (mode !== "single" && mode !== "multipage" && mode !== "deep") {
    return Response.json({ error: "mode must be single, multipage, or deep." }, { status: 400 });
  }

  try {
    const extract = await extractBrainFromWebsiteUrl(rawUrl, {
      mode,
      allowServerLlm: allowServerLlmInWebApi(),
    });
    return Response.json(extract);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Extract failed.";
    return Response.json({ error: message }, { status: 422 });
  }
}
