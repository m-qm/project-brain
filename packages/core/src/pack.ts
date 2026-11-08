import { renderTemplate } from "@agentkbase/templates";
import type { BrainInput, PackFile } from "./types.js";
import { isServiceBrain } from "./service-detect.js";
import { slugify } from "./slug.js";

function formatBullets(items: string[]): string {
  return items
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `* ${s}`)
    .join("\n");
}

function formatOpenQuestions(items: string[]): string {
  const lines = items.map((s) => s.trim()).filter(Boolean);
  if (lines.length === 0) {
    return "* (none yet — add items the agent must not guess)";
  }
  return lines.map((s) => (s.startsWith("[CONFIRM]") ? `* ${s}` : `* [CONFIRM] ${s}`)).join("\n");
}

function missionLine(input: BrainInput): string {
  return (input.projectMission?.trim() || input.projectDescription.trim()).trim();
}

/** Repo-root file. Distinct from `brain/AGENTS.md`. */
export const ROOT_AGENTS_PATH = "AGENTS.md";

/** Marks the block setup appends once. An agent does not parse it. */
export const ROOT_AGENTS_BLOCK_START = "<!-- agentkbase:agents:start -->";
export const ROOT_AGENTS_BLOCK_END = "<!-- agentkbase:agents:end -->";

/**
 * Short root instructions. Fixed text: a draft's prices and names must not leak in.
 * The same string is the whole file in a fresh zip, and the block appended when
 * a root AGENTS.md already exists.
 */
export function rootAgentsMd(): string {
  return [
    ROOT_AGENTS_BLOCK_START,
    "# Agent instructions",
    "",
    "**Mission:** Read `brain/facts/project.md` and `brain/open-questions.md`.",
    "",
    "* Do not invent a price, a client, or a metric.",
    "* Stop on `[CONFIRM]`.",
    "* Run `brain eval` before a public draft.",
    ROOT_AGENTS_BLOCK_END,
    "",
  ].join("\n");
}

export function buildPackFiles(input: BrainInput): PackFile[] {
  const projectSlug = slugify(input.projectName);
  const projectMission = missionLine(input);
  const service = isServiceBrain(input);
  const builtHeading = service ? "How the offer works" : "What we built";

  const vars: Record<string, string> = {
    projectName: input.projectName.trim(),
    projectDescription: input.projectDescription.trim(),
    projectMission,
    projectSlug,
    factBullets: formatBullets(input.factBullets),
    openQuestions: formatOpenQuestions(input.openQuestions),
  };

  const storySlug = slugify(input.storyTitle || "main-system");
  const storyContent = `# ${input.storyTitle.trim() || "Main system"}

## Problem

${input.storyProblem.trim() || "(fill in)"}

## ${builtHeading}

${input.storyBuilt.trim() || "(fill in)"}

## How we know it works

${input.storyProof.trim() || "(fill in)"}
`;

  return [
    { path: "README.md", content: renderTemplate("README.md", vars) },
    { path: ROOT_AGENTS_PATH, content: rootAgentsMd() },
    { path: "brain/AGENTS.md", content: renderTemplate("AGENTS.md", vars) },
    { path: "brain/facts/project.md", content: renderTemplate("facts/project.md", vars) },
    { path: "brain/facts/README.md", content: renderTemplate("facts/README.md", vars) },
    { path: "brain/stories/TEMPLATE.md", content: renderTemplate("stories/TEMPLATE.md", vars) },
    { path: `brain/stories/${storySlug}.md`, content: storyContent },
    { path: "brain/open-questions.md", content: renderTemplate("open-questions.md", vars) },
    {
      path: ".cursor/rules/project-brain.mdc",
      content: renderTemplate("cursor-rules/project-brain.mdc", vars),
    },
    {
      path: ".engram/config.example.json",
      content: renderTemplate("engram/config.example.json", vars),
    },
  ];
}
