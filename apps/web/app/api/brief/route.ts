import { buildBrief, validateBrainInputStrict, type BrainInput } from "@project-brain/core";

export async function POST(req: Request) {
  const input = (await req.json()) as BrainInput;
  const validation = validateBrainInputStrict(input);
  if (!validation.ok) {
    return Response.json(
      { errors: validation.issues.filter((i) => i.level === "error").map((i) => i.message) },
      { status: 400 },
    );
  }
  return Response.json({ brief: buildBrief(input) });
}
