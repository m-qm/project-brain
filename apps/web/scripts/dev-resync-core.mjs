#!/usr/bin/env node
/**
 * Optional: restart Next when packages/core/dist changes (for core + web work).
 * Does NOT delete .next (deleting mid-compile causes _buildManifest ENOENT / 962.js errors).
 *
 * Prefer `pnpm dev` for UI-only work — no automatic restarts.
 */
import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const coreDist = join(webRoot, "../../packages/core/dist");

const RESTART_DEBOUNCE_MS = 3000;
const NEXT_ARGS = ["dev", "--port", "3000"];

let child = null;
let debounceTimer = null;
let restarting = false;
let ignoreWatchUntil = Date.now() + 8000;

function startNext() {
  child = spawn("pnpm", ["exec", "next", ...NEXT_ARGS], {
    cwd: webRoot,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "development" },
  });
  child.on("exit", (code, signal) => {
    if (restarting) return;
    if (signal === "SIGTERM" || signal === "SIGINT") process.exit(0);
    if (code && code !== 0) process.exit(code ?? 1);
  });
}

function scheduleRestart(reason) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log(`\n[dev-resync] Restarting Next (${reason}). Not wiping .next.\n`);
    restarting = true;
    if (!child) {
      restarting = false;
      startNext();
      return;
    }
    const proc = child;
    proc.once("exit", () => {
      restarting = false;
      ignoreWatchUntil = Date.now() + 8000;
      startNext();
    });
    proc.kill("SIGTERM");
    setTimeout(() => {
      if (restarting && proc.exitCode === null) proc.kill("SIGKILL");
    }, 10000);
  }, RESTART_DEBOUNCE_MS);
}

startNext();

try {
  watch(coreDist, { recursive: true }, (_event, filename) => {
    if (!filename || filename.endsWith(".map") || filename.endsWith(".d.ts")) return;
    if (Date.now() < ignoreWatchUntil) return;
    scheduleRestart(`@agentkbase/core dist: ${filename}`);
  });
} catch (err) {
  console.warn("[dev-resync] Could not watch core dist:", err.message);
}

function shutdown() {
  child?.kill("SIGTERM");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
