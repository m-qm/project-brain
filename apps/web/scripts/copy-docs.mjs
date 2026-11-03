import { cpSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = join(here, "..", "..", "..", "docs");
const out = join(here, "..", "public", "learn");

mkdirSync(out, { recursive: true });

function copyDir(rel) {
  const src = join(docsRoot, rel);
  const dest = join(out, rel);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest);
}

const learnDocs = [
  "01-first-brain.md",
  "02-facts-vs-stories.md",
  "03-open-questions.md",
  "04-import-skills-skilltree.md",
  "05-engram.md",
  "06-application-mode.md",
  "07-extract-from-website.md",
  "08-multi-page-extract.md",
  "09-guided-gap-filling.md",
  "10-mcp.md",
];

for (const name of learnDocs) {
  copyDir(name);
}

mkdirSync(join(out, "advanced"), { recursive: true });
copyDir("advanced/eval-and-routing.md");

console.log("Copied docs to public/learn");
