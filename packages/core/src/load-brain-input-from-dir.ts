import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { EMPTY_BRAIN_INPUT } from "./defaults.js";
import type { BrainInput } from "./types.js";

function parseBullets(section: string): string[] {
  return section
    .split("\n")
    .map((l) => l.replace(/^\*\s*/, "").trim())
    .filter(Boolean);
}

function parseProjectFacts(md: string): {
  projectName: string;
  projectMission: string;
  factBullets: string[];
} {
  const titleMatch = md.match(/^#\s+Project facts\s+—\s+(.+)/im);
  const projectName = titleMatch?.[1]?.trim() ?? "";

  const missionMatch = md.match(/## Mission\s+([\s\S]*?)(?=##|$)/i);
  const projectMission = missionMatch?.[1]?.trim() ?? "";

  const gtMatch = md.match(/## Ground truth\s+([\s\S]*?)(?=##|$)/i);
  const factBullets = gtMatch ? parseBullets(gtMatch[1]) : [];

  return { projectName, projectMission, factBullets };
}

function parseOpenQuestions(md: string): string[] {
  const body = md.replace(/^# Open questions[\s\S]*?\n\n/i, "");
  return parseBullets(body).map((q) => q.replace(/^\[CONFIRM\]\s*/i, "").trim());
}

function parseStory(md: string): {
  storyTitle: string;
  storyProblem: string;
  storyBuilt: string;
  storyProof: string;
} {
  const titleMatch = md.match(/^#\s+(.+)/m);
  const storyTitle = titleMatch?.[1]?.trim() ?? "";

  const problemMatch = md.match(/## Problem\s+([\s\S]*?)(?=##|$)/i);
  const builtMatch = md.match(/## (?:What we built|How the offer works)\s+([\s\S]*?)(?=##|$)/i);
  const proofMatch = md.match(/## How we know it works\s+([\s\S]*?)(?=##|$)/i);

  return {
    storyTitle,
    storyProblem: problemMatch?.[1]?.trim() ?? "",
    storyBuilt: builtMatch?.[1]?.trim() ?? "",
    storyProof: proofMatch?.[1]?.trim() ?? "",
  };
}

/** Minimal round-trip from on-disk brain/ for CLI gap fill (not a full parser). */
export async function loadBrainInputFromDir(dir: string): Promise<BrainInput> {
  const base = { ...EMPTY_BRAIN_INPUT, factBullets: [] as string[], openQuestions: [] as string[] };

  try {
    const factsMd = await readFile(join(dir, "brain/facts/project.md"), "utf8");
    const { projectName, projectMission, factBullets } = parseProjectFacts(factsMd);
    base.projectName = projectName;
    base.projectMission = projectMission;
    base.projectDescription = projectMission;
    base.factBullets = factBullets.length ? factBullets : [""];
  } catch {
    // keep defaults
  }

  try {
    const oqMd = await readFile(join(dir, "brain/open-questions.md"), "utf8");
    const oq = parseOpenQuestions(oqMd);
    base.openQuestions = oq.length ? oq.map((q) => (q.startsWith("[CONFIRM]") ? q : `[CONFIRM] ${q}`)) : [""];
  } catch {
    base.openQuestions = [""];
  }

  try {
    const storiesDir = join(dir, "brain/stories");
    const names = (await readdir(storiesDir)).filter((n) => n.endsWith(".md") && n !== "TEMPLATE.md");
    if (names[0]) {
      const storyMd = await readFile(join(storiesDir, names[0]), "utf8");
      Object.assign(base, parseStory(storyMd));
    }
  } catch {
    // keep story defaults
  }

  return base;
}
