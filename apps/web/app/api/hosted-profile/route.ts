import { validateBrainInputStrict, type BrainInput } from "@agentkbase/core";
import { loadHostedProfile, saveHostedProfile } from "@/lib/hosted-profiles";

export async function POST(req: Request) {
  let body: { brain?: BrainInput; sourceUrl?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.brain) {
    return Response.json({ error: "brain is required." }, { status: 400 });
  }
  const validation = validateBrainInputStrict(body.brain);
  if (!validation.ok) {
    return Response.json(
      { errors: validation.issues.filter((i) => i.level === "error").map((i) => i.message) },
      { status: 400 },
    );
  }
  const profileId = await saveHostedProfile(body.brain, body.sourceUrl);
  return Response.json({
    profileId,
    exportZipUrl: "https://agentkbase.com/wizard",
    note: "Hosted copy for Claude MCP. Export brain.zip from the wizard to own files in git.",
  });
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id")?.trim();
  if (!id) {
    return Response.json({ error: "id query parameter is required." }, { status: 400 });
  }
  const profile = await loadHostedProfile(id);
  if (!profile) {
    return Response.json({ error: "Profile not found." }, { status: 404 });
  }
  return Response.json({ profileId: id, sourceUrl: profile.sourceUrl, brain: profile.brain });
}
