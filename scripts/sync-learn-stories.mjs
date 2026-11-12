#!/usr/bin/env node
/**
 * Phase 1 indexing: mirror public learn guides into brain/stories/learn/.
 * Reference for brain_search — not canonical facts until distilled into brain/facts/.
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const banner = `<!-- SYNCED from apps/web/public — run: node scripts/sync-learn-stories.mjs -->
<!-- Not ground truth. Distill claims into brain/facts/ before agents state them as fact. -->

`;

const sources = [
  { locale: "en", src: join(root, "apps/web/public/learn") },
  { locale: "es", src: join(root, "apps/web/public/es/learn") },
];

function walkMd(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walkMd(full, out);
    } else if (name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

let copied = 0;
for (const { locale, src } of sources) {
  if (!statSync(src, { throwIfNoEntry: false })?.isDirectory()) {
    console.warn(`skip missing: ${src}`);
    continue;
  }
  for (const file of walkMd(src)) {
    const rel = relative(src, file);
    const dest = join(root, "brain/stories/learn", locale, rel);
    mkdirSync(dirname(dest), { recursive: true });
    const body = readFileSync(file, "utf8");
    const text = body.startsWith("<!-- SYNCED") ? body : banner + body;
    writeFileSync(dest, text, "utf8");
    copied++;
  }
}

console.log(`Synced ${copied} learn files → brain/stories/learn/`);
