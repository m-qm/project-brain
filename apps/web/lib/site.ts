import type { Metadata } from "next";

/** Canonical origin. www.agentkbase.com redirects here. */
export const SITE_URL = "https://agentkbase.com";

export const SITE_NAME = "Agent KBase";

export const SITE_TITLE =
  "Agent KBase (agentkbase) · Git-native brain for Cursor agents";

export const SITE_DESCRIPTION =
  "agentkbase.com is a git-native knowledge base for Cursor agents. Skills say what the agent can do. Agent KBase holds curated facts in brain/ for your repo.";

/** Exact script body. The CSP hash must match these bytes. */
export const WEBSITE_JSON_LD =
  '{"@context":"https://schema.org","@type":"WebSite","name":"Agent KBase","alternateName":["agentkbase","AgentKBase"],"url":"https://agentkbase.com","description":"agentkbase.com is a git-native knowledge base for Cursor agents. Skills say what the agent can do. Agent KBase holds curated facts in brain/ for your repo."}';

export const WEBSITE_JSON_LD_HASH = "sha256-xwi1ipjI3d/7AwsAIIk8AzaMSD6jOUOJSZlbnu59jsw=";

export function pageMeta(path: string, title: string, description: string): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
  };
}

/**
 * Agents that fetch pages for AI answers or training.
 * `User-agent: *` already allows them. Naming them keeps a later
 * disallow from applying to AI crawlers by accident.
 */
export const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Amazonbot",
  "meta-externalagent",
  "Bytespider",
  "cohere-ai",
] as const;
