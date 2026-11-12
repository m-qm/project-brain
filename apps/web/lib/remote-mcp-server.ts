import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import {
  EMPTY_BRAIN_INPUT,
  buildBrief,
  evalDraftAgainstBrainInput,
  extractBrainFromWebsiteUrl,
  mergeExtractIntoBrain,
  validateBrainInputStrict,
  type EvalCheck,
} from "@agentkbase/core";
import { loadHostedProfile, saveHostedProfile } from "./hosted-profiles";

const readOnly: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

const CHECKS = new Set<EvalCheck>(["offer", "proof", "title", "sources", "cta", "all"]);

export function createRemoteMcpServer(): McpServer {
  const server = new McpServer({
    name: "agentkbase-remote",
    version: "0.1.0",
  });

  server.registerTool(
    "scan_business_website",
    {
      title: "Scan business website",
      description:
        "Read a public business URL and draft what they sell, who it is for, and [CONFIRM] gaps. Saves a hosted profile id for follow-up tools. Does not publish.",
      inputSchema: {
        url: z.string().describe("Public https URL of the business site."),
      },
      annotations: readOnly,
    },
    async ({ url }) => {
      try {
        const extract = await extractBrainFromWebsiteUrl(url, { mode: "single" });
        const brain = mergeExtractIntoBrain({ ...EMPTY_BRAIN_INPUT, projectName: "Business" }, extract, "replace");
        brain.projectName = brain.projectName.trim() || new URL(url).hostname;
        const validation = validateBrainInputStrict(brain);
        const profileId = await saveHostedProfile(brain, url);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  profileId,
                  sourceUrl: url,
                  validationOk: validation.ok,
                  validationWarnings: validation.issues.filter((i) => i.level === "warn").map((i) => i.message),
                  brain,
                  exportNote: "Export brain.zip at https://agentkbase.com/wizard — files you own in git.",
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (e) {
        const message = e instanceof Error ? e.message : "Extract failed.";
        return { content: [{ type: "text", text: message }], isError: true };
      }
    },
  );

  server.registerTool(
    "get_what_we_can_claim",
    {
      title: "Get what we can claim",
      description:
        "Return the approved claims pack (brief) for a hosted profile. Use after scan_business_website. Read-only.",
      inputSchema: {
        profileId: z.string().describe("Hosted profile id from scan_business_website."),
      },
      annotations: readOnly,
    },
    async ({ profileId }) => {
      const profile = await loadHostedProfile(profileId);
      if (!profile) {
        return { content: [{ type: "text", text: "Profile not found." }], isError: true };
      }
      const brief = buildBrief(profile.brain);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                profileId,
                sourceUrl: profile.sourceUrl,
                brief,
                evidence: "facts from hosted brain (wizard/export: brain/facts/project.md)",
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    "check_draft_before_publish",
    {
      title: "Check draft before publish",
      description:
        "Check marketing copy against hosted facts. Flags invented prices and other checks from company-brain. Does not publish.",
      inputSchema: {
        profileId: z.string().describe("Hosted profile id."),
        draft: z.string().describe("Article, email, or LinkedIn caption to check."),
        title: z.string().optional().describe("Optional title separate from draft."),
        checks: z.string().optional().describe("offer (default), proof, title, sources, cta, or all."),
        article: z.string().optional().describe("When checking a LinkedIn caption, pass the published article text."),
      },
      annotations: readOnly,
    },
    async ({ profileId, draft, title, checks, article }) => {
      const profile = await loadHostedProfile(profileId);
      if (!profile) {
        return { content: [{ type: "text", text: "Profile not found." }], isError: true };
      }
      const check = CHECKS.has(checks as EvalCheck) ? (checks as EvalCheck) : "offer";
      const result = evalDraftAgainstBrainInput(profile.brain, draft, { title, checks: check, article });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                profileId,
                sourceUrl: profile.sourceUrl,
                ok: result.ok,
                title: result.title,
                issues: result.issues,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  return server;
}
