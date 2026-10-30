import JSZip from "jszip";
import type { BrainInput } from "./types.js";
import { buildPackFiles } from "./pack.js";
import { slugify } from "./slug.js";

/** Top-level folder inside the zip, e.g. `auditamia-brain`. */
export function brainArchiveBasename(input: BrainInput): string {
  const slug = slugify(input.projectName?.trim() || "project");
  return `${slug}-brain`;
}

export async function buildZipBuffer(input: BrainInput): Promise<Buffer> {
  const zip = new JSZip();
  const root = brainArchiveBasename(input);
  for (const file of buildPackFiles(input)) {
    zip.file(`${root}/${file.path}`, file.content);
  }
  return Buffer.from(await zip.generateAsync({ type: "arraybuffer" }));
}
