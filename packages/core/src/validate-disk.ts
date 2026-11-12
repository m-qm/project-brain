import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ValidationIssue, ValidationResult } from "./types.js";
import { REQUIRED_ON_DISK } from "./disk.js";
import { buildClaimsIndex } from "./claims.js";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function validateBrainDir(dir: string): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];

  for (const rel of REQUIRED_ON_DISK) {
    const full = join(dir, rel);
    if (!(await exists(full))) {
      issues.push({ level: "error", message: `Missing required file: ${rel}` });
    }
  }

  const oqPath = join(dir, "brain/open-questions.md");
  if (await exists(oqPath)) {
    const text = await readFile(oqPath, "utf8");
    if (text.includes("[CONFIRM]") && /\[CONFIRM\]\s*\n|\[CONFIRM\]\s*$/.test(text)) {
      issues.push({
        level: "warn",
        message: "open-questions.md has empty [CONFIRM] placeholders.",
      });
    }
  }

  const ok = !issues.some((i) => i.level === "error");
  if (ok) {
    try {
      const claims = await buildClaimsIndex(dir);
      if (claims.length === 0) {
        issues.push({
          level: "warn",
          message: "No claims parsed from brain/facts/ — check bullet lists.",
        });
      }
    } catch {
      issues.push({ level: "warn", message: "Could not build claims index." });
    }
  }

  return { ok, issues };
}
