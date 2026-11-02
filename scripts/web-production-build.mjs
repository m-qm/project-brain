#!/usr/bin/env node
/**
 * Production web build: always clean .next first (dev + build sharing .next corrupts output).
 * Refuses to run if next dev is listening on 3000.
 */
import { execSync, spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const webNext = join(root, "apps/web/.next");

function devOn3000() {
  const r = spawnSync("lsof", ["-i", ":3000", "-t"], { encoding: "utf8" });
  return Boolean(r.stdout?.trim());
}

if (devOn3000()) {
  console.error(
    "\n[build] Port 3000 is in use (next dev?). Stop dev (Ctrl+C) before pnpm build.\n",
  );
  process.exit(1);
}

try {
  rmSync(webNext, { recursive: true, force: true });
} catch (e) {
  console.error("[build] Could not remove apps/web/.next:", e.message);
  process.exit(1);
}

execSync("pnpm --filter @agentkbase/web run build", {
  cwd: root,
  stdio: "inherit",
});
