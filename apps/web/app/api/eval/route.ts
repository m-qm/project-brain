import {
  evalDraftAgainstBrainInput,
  validateBrainInputStrict,
  type BrainInput,
  type EvalCheck,
} from "@agentkbase/core";
import { loadHostedProfile } from "@/lib/hosted-profiles";

const CHECKS = new Set<EvalCheck>(["offer", "proof", "title", "sources", "cta", "all"]);

export async function POST(req: Request) {
  let body: {
    brain?: BrainInput;
    profileId?: string;
    draft?: string;
    title?: string;
    checks?: string;
    article?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let brain = body.brain;
  const profileId = body.profileId?.trim();
  if (!brain && profileId) {
    const profile = await loadHostedProfile(profileId);
    if (!profile) {
      return Response.json({ error: "Profile not found. Save your sheet in the wizard first." }, { status: 404 });
    }
    brain = profile.brain;
  }
  const draft = body.draft?.trim() ?? "";
  if (!brain) {
    return Response.json(
      { error: "profileId or brain is required (save your sheet in the wizard to get a profile id)." },
      { status: 400 },
    );
  }
  if (!draft) {
    return Response.json({ error: "draft is required." }, { status: 400 });
  }

  const validation = validateBrainInputStrict(brain);
  if (!validation.ok) {
    return Response.json(
      { errors: validation.issues.filter((i) => i.level === "error").map((i) => i.message) },
      { status: 400 },
    );
  }

  const checks = CHECKS.has(body.checks as EvalCheck) ? (body.checks as EvalCheck) : "all";
  const result = evalDraftAgainstBrainInput(brain, draft, {
    title: body.title,
    checks,
    article: body.article,
  });

  return Response.json({
    ok: result.ok,
    title: result.title,
    issues: result.issues,
    profileId: profileId || undefined,
  });
}
