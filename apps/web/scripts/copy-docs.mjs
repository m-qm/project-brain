import { cpSync, mkdirSync, readdirSync } from "node:fs";
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

copyDir("01-first-brain.md");
copyDir("02-facts-vs-stories.md");
copyDir("03-open-questions.md");
copyDir("04-import-skills-skilltree.md");
copyDir("05-engram.md");
copyDir("06-application-mode.md");
copyDir("07-extract-from-website.md");
mkdirSync(join(out, "advanced"), { recursive: true });
copyDir("advanced/eval-and-routing.md");

console.log("Copied docs to public/learn");
