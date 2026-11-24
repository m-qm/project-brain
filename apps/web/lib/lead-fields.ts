export type LeadAnswers = {
  name?: string;
  website?: string;
  email?: string;
};

export function cleanLeadName(value: string): string {
  const name = value.replace(/\s+/g, " ").trim();
  if (!name || name.length > 40 || /[?@!]|\bhttps?\b|\bwww\./i.test(name)) return "";
  if (name.split(" ").length > 4) return "";
  return name;
}

/** A domain that only appears inside an email address is not a website. */
export function cleanLeadWebsite(value: string): string {
  const withoutEmails = value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, " ");
  const found = withoutEmails.match(/(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?/i)?.[0] ?? "";
  if (!found || found.includes("@")) return "";
  return found.replace(/[),.;]+$/, "");
}

export function cleanLeadEmail(value: string): string {
  return value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
}

export function mergeLead(current: LeadAnswers, incoming: LeadAnswers): LeadAnswers {
  return {
    name: cleanLeadName(incoming.name ?? "") || current.name,
    website: cleanLeadWebsite(incoming.website ?? "") || current.website,
    email: cleanLeadEmail(incoming.email ?? "") || current.email,
  };
}

function hostOf(website: string): string {
  return website.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0].toLowerCase();
}

function emailHosts(text: string): Set<string> {
  const hosts = new Set<string>();
  for (const match of text.matchAll(/[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/gi)) {
    hosts.add(match[1].toLowerCase());
  }
  return hosts;
}

/**
 * The model sometimes copies the domain of an email into website.
 * mireiaquerol@gmail.com must not replace dualperspective.digital with gmail.com.
 */
export function mergeModelLead(base: LeadAnswers, userText: string, model: LeadAnswers): LeadAnswers {
  const merged = mergeLead(base, model);
  const proposedHost = hostOf(cleanLeadWebsite(merged.website ?? ""));
  const statedHost = hostOf(cleanLeadWebsite(userText));
  if (proposedHost && emailHosts(userText).has(proposedHost) && statedHost !== proposedHost) {
    return { ...merged, website: base.website };
  }
  return merged;
}

export function leadReady(answers: LeadAnswers): boolean {
  return Boolean(answers.name && answers.website && answers.email);
}

/** The chat describes the page. It does not narrate the draft rule. */
export function dropPriceRefusal(reply: string): string {
  return reply
    .replace(/(?:^|\n)\s*no añadiría un precio[^.?\n]*[.?]?\s*/gi, "\n")
    .replace(/(?:^|\n)\s*i (?:would not|wouldn't|will not|won't) add a price[^.?\n]*[.?]?\s*/gi, "\n")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
