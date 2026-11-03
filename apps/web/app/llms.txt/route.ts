import { BLOG_POSTS } from "../[locale]/blog/blog-docs";
import { LEARN_DOCS } from "../[locale]/learn/learn-docs";
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
    "> Agent KBase is the knowledge layer for a studio or a small consultancy. Paste the public site, correct the draft, and every agent that speaks for the business reads the same base.",
    "",
    "The CLI (`npm install -g @agentkbase/cli`) and the web wizard export the same validated pack: facts, stories, and AGENTS.md. Validation runs before export. A public website URL can seed a draft; review it before export. SkillTree imports skills (how to work). Engram is a separate cross-session memory layer.",
    "",
    "The first result is a base the owner trusts. An article or a LinkedIn post comes after, and only with a yes. The OSS brain stays read-only. Done-for-you installs that base from the public site.",
    "",
    section("Start", [
      `- [Home](${SITE_URL}/): product overview and install`,
      `- [Wizard](${SITE_URL}/wizard): build and export a brain in the browser`,
      `- [Learn](${SITE_URL}/learn): short guides for small teams`,
      `- [Blog](${SITE_URL}/blog): HITL articles; nothing live skipped the five checks`,
      ...BLOG_POSTS.map(
        (post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.description}`,
      ),
    ]),
    "",
    section("Guides", guides),
    "",
    section("Product", [
      `- [SkillTree + Agent KBase](${SITE_URL}/skilltree): pair SkillTree skills with a brain/ folder`,
      `- [The knowledge layer](${SITE_URL}/company-brain): one base every agent reads; waitlist and done-for-you`,
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
