import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const storage = join(here, "..", "storage", "telegram-brains");
const files = ["facts/project.md", "facts/offer-limits.md", "open-questions.md", "stories/positioning.md"];
const cap = 14000;

const brains = {};
let entries = [];
try {
  entries = await readdir(storage, { withFileTypes: true });
} catch {
  entries = [];
}

for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const id = entry.name.toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(id)) continue;
  const chunks = [`# Client brain ${id}`, ""];
  let project = "";
  for (const rel of files) {
    try {
      const text = (await readFile(join(storage, id, rel), "utf8")).trim();
      if (!text) continue;
      if (rel === "facts/project.md") project = text;
      chunks.push(`## ${rel}`, text, "");
    } catch {
      // Optional until project.md is present.
    }
  }
  if (!project) continue;
  brains[id] = chunks.join("\n").slice(0, cap);
}

const payload = { brains };
await writeFile(join(here, "..", "lib", "client-brains.snapshot.json"), JSON.stringify(payload));
const ids = Object.keys(brains).sort().join(", ") || "(none)";
console.log(`Embedded client brains: ${ids}`);
