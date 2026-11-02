import { suggestGapFills, validateBrainInput, type BrainInput } from "@agentkbase/core";
import { allowServerLlmInWebApi } from "@/lib/server-llm-policy";

export async function POST(req: Request) {
  let input: BrainInput;
  try {
    input = (await req.json()) as BrainInput;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const v = validateBrainInput(input);
  if (!input.openQuestions?.some((q) => q.trim())) {
    return Response.json({ error: "Add at least one open question." }, { status: 400 });
  }

  try {
    const result = await suggestGapFills(input, {
      allowServerLlm: allowServerLlmInWebApi(),
    });
    return Response.json({ ...result, validationOk: v.ok });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gap fill failed.";
    return Response.json({ error: message }, { status: 422 });
  }
}
