import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";

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

export function localizedUrl(path: string, locale: AppLocale): string {
  const suffix = path === "/" ? "" : path;
  if (locale === "es") return `${SITE_URL}/es${suffix}`;
  return suffix ? `${SITE_URL}${suffix}` : SITE_URL;
}

export function pageMeta(
  path: string,
  title: string,
  description: string,
  locale: AppLocale = "en",
): Metadata {
  const en = localizedUrl(path, "en");
  const es = localizedUrl(path, "es");
  const url = locale === "es" ? es : en;
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: { en, es, "x-default": en },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
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
