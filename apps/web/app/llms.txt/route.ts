import { LEARN_DOCS } from "../learn/learn-docs";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

function section(title: string, lines: string[]): string {
  return [`## ${title}`, ...lines].join("\n");
}

export function GET() {
  const guides = LEARN_DOCS.map(
    (doc) => `- [${doc.title}](${SITE_URL}/learn/${doc.slug}): ${doc.description}`,
  );

  const body = [
    "# Agent KBase",
    "",
    "> Open-source, git-native knowledge base for Cursor agents. Skills say what an agent can do. Agent KBase holds curated facts, stories, and open questions in a brain/ folder the agent can load before a task.",
    "",
    "The CLI (`npm install -g @agentkbase/cli`) and the web wizard export the same validated pack: facts, stories, and AGENTS.md. Validation runs before export. A public website URL can seed a draft; review it before export. SkillTree imports skills (how to work). Engram is a separate cross-session memory layer.",
    "",
    "Company Brain Pack is a paid add-on, still coming soon. It adds department facts for marketing, sales, operations, fulfillment, and work-logs on top of the free wizard.",
    "",
    section("Start", [
      `- [Home](${SITE_URL}/): product overview and install`,
      `- [Wizard](${SITE_URL}/wizard): build and export a brain in the browser`,
      `- [Learn](${SITE_URL}/learn): short guides for small teams`,
    ]),
    "",
    section("Guides", guides),
    "",
    section("Product", [
      `- [SkillTree + Agent KBase](${SITE_URL}/skilltree): pair SkillTree skills with a brain/ folder`,
      `- [Company Brain Pack](${SITE_URL}/company-brain): multi-department brain, waitlist`,
    ]),
    "",
    section("Optional", [
      `- [Brain map](${SITE_URL}/tree): local preview of a wizard draft in this browser`,
      "- [GitHub](https://github.com/m-qm/project-brain): source",
      "- [npm](https://www.npmjs.com/package/@agentkbase/cli): `@agentkbase/cli`",
    ]),
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
