import {
  brainArchiveBasename,
  buildZipBuffer,
  validateBrainInputStrict,
  type BrainInput,
} from "@project-brain/core";

export async function POST(req: Request) {
  let input: BrainInput;
  try {
    input = (await req.json()) as BrainInput;
  } catch {
    return Response.json({ errors: ["Invalid JSON body"] }, { status: 400 });
  }

  const validation = validateBrainInputStrict(input);
  if (!validation.ok) {
    return Response.json(
      {
        errors: validation.issues
          .filter((i) => i.level === "error")
          .map((i) => i.message),
      },
      { status: 400 },
    );
  }

  const buffer = await buildZipBuffer(input);
  const filename = `${brainArchiveBasename(input)}.zip`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
