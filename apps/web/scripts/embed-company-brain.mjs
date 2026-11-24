import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..", "..");
const files = [
  "brain/facts/project.md",
  "brain/facts/offer-limits.md",
  "brain/open-questions.md",
  "brain/stories/positioning.md",
];

const parts = ["# Company brain", ""];
for (const rel of files) {
  const text = await readFile(join(repo, rel), "utf8");
  parts.push(`## ${rel}`, text.trim(), "");
}
const payload = { text: parts.join("\n").slice(0, 14000) };
await writeFile(join(here, "..", "lib", "company-brain.snapshot.json"), JSON.stringify(payload));
console.log(`Embedded company brain (${payload.text.length} chars)`);
