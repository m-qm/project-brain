#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import {
  brainBrief,
  brainEval,
  brainList,
  brainOpenQuestions,
  brainRead,
  brainSearch,
  brainValidate,
} from "./tools.js";

const server = new McpServer({
  name: "agentkbase",
  version: "0.1.0",
});

const readOnly: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

const dirField = z
  .string()
  .optional()
  .describe(
    "Repo root that contains brain/. Defaults to BRAIN_DIR, then the process working directory. Walks up to 8 parent directories until brain/AGENTS.md exists.",
  );

server.registerTool(
  "brain_brief",
  {
    title: "Brain brief",
    description:
      "Return the token-bounded Agent KBase context pack (AGENTS.md, project facts, open questions, and a story index). Same text as `brain brief`. Read-only.",
    inputSchema: { dir: dirField },
    annotations: readOnly,
  },
  async ({ dir }) => brainBrief({ dir }),
);

server.registerTool(
  "brain_validate",
  {
    title: "Validate brain",
    description:
      "Check that the required brain files exist and report empty [CONFIRM] placeholders. Returns JSON `{ dir, ok, issues }`. Read-only. Same checks as `brain validate`.",
    inputSchema: { dir: dirField },
    annotations: readOnly,
  },
  async ({ dir }) => brainValidate({ dir }),
);

server.registerTool(
  "brain_list",
  {
    title: "List brain files",
    description:
      "List markdown files under brain/. Returns JSON `{ dir, files }`. Symlinks that resolve outside brain/ are omitted. Read-only.",
    inputSchema: { dir: dirField },
    annotations: readOnly,
  },
  async ({ dir }) => brainList({ dir }),
);

server.registerTool(
  "brain_read",
  {
    title: "Read brain file",
    description:
      "Read one file under brain/. Paths that escape brain/, including via symlink, are rejected. Read-only.",
    inputSchema: {
      dir: dirField,
      path: z
        .string()
        .describe("File under brain/, for example brain/facts/project.md or facts/project.md."),
    },
    annotations: readOnly,
  },
  async ({ dir, path }) => brainRead({ dir, path }),
);

server.registerTool(
  "brain_search",
  {
    title: "Search brain",
    description:
      "Case-insensitive substring search over markdown under brain/. Returns JSON `{ dir, query, hits, truncated }` with path and 1-based line. At most 50 hits. Read-only.",
    inputSchema: {
      dir: dirField,
      query: z.string().describe("Substring to find. Matching is case-insensitive."),
    },
    annotations: readOnly,
  },
  async ({ dir, query }) => brainSearch({ dir, query }),
);

server.registerTool(
  "brain_eval",
  {
    title: "Eval draft against facts",
    description:
      "Check draft text against brain/facts. Default check is invented prices. Does not write brain/ and does not publish. Returns JSON `{ dir, ok, issues }`. Read-only. Same checks as `brain eval`.",
    inputSchema: {
      dir: dirField,
      draft: z.string().optional().describe("Draft text to check."),
      path: z
        .string()
        .optional()
        .describe("Optional file under brain/ to check instead of draft text."),
      article: z
        .string()
        .optional()
        .describe("Published article text. When set, draft is treated as a LinkedIn caption."),
      checks: z
        .string()
        .optional()
        .describe("offer (default), proof, title, sources, cta, or all."),
    },
    annotations: readOnly,
  },
  async ({ dir, draft, path, article, checks }) => brainEval({ dir, draft, path, article, checks }),
);

server.registerTool(
  "brain_open_questions",
  {
    title: "Open questions",
    description:
      "List open questions from brain/open-questions.md. Returns JSON `{ dir, questions }`. Read-only. Do not treat these as facts.",
    inputSchema: { dir: dirField },
    annotations: readOnly,
  },
  async ({ dir }) => brainOpenQuestions({ dir }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
