import { parseGuideSignup, saveGuideSignup } from "@/lib/guide-signup";

export async function POST(req: Request) {
  let body: {
    email?: string;
    mailingList?: boolean;
    locale?: string;
    source?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = parseGuideSignup(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const result = await saveGuideSignup(parsed.value);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ ok: true, mailingList: result.mailingList });
}
