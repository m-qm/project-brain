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
    "> Notes for the article, the post, and the reply. In the morning there is a draft. You say yes or no. A price that is not on the site is cut.",
    "",
    "The open-source folder is free. Setup of the operated loop is quoted in writing after a start call. There is no public fee on this site yet.",
    "",
    "The CLI (`npm install -g @agentkbase/cli`) and the web wizard export the same folder: facts, stories, and open questions. A public website URL can seed a draft. You correct it before export.",
    "",
    section("Start", [
      `- [Home](${SITE_URL}/): the article, the LinkedIn post, and your yes`,
      `- [Service](${SITE_URL}/company-brain): notes, five checks, and a quoted setup`,
      `- [Wizard](${SITE_URL}/wizard): paste your site and correct the draft`,
      `- [Learn](${SITE_URL}/learn): short guides`,
      `- [Blog](${SITE_URL}/blog): prices, reviews, and titles`,
      ...BLOG_POSTS.map(
        (post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.description}`,
      ),
    ]),
    "",
    section("Guides", guides),
    "",
    section("Product", [
      `- [Service](${SITE_URL}/company-brain): notes, drafts, and a quoted setup`,
    ]),
    "",
    section("Optional", [
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
