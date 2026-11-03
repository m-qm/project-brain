import type { Metadata } from "next";

/** Canonical origin. www.agentkbase.com redirects here. */
export const SITE_URL = "https://agentkbase.com";

export const SITE_NAME = "Agent KBase";

export const SITE_TITLE = "Agent KBase · The Knowledge Layer Every Agent Reads";

export const SITE_DESCRIPTION =
  "Agent KBase is the knowledge layer for a studio or a small consultancy. Paste your site, correct the draft, and every agent reads the same base.";

/** Exact script body. The CSP hash must match these bytes. */
export const WEBSITE_JSON_LD =
  '{"@context":"https://schema.org","@type":"WebSite","name":"Agent KBase","alternateName":["agentkbase","AgentKBase"],"url":"https://agentkbase.com","description":"Agent KBase is the knowledge layer for a studio or a small consultancy. Paste your site, correct the draft, and every agent reads the same base."}';

export const WEBSITE_JSON_LD_HASH = "sha256-1/JvkOb/8eCRiGiH4MLG3DjSd9qzNkcxIvJuqyqsDqU=";

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
