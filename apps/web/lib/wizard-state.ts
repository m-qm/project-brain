import type { BrainInput } from "@agentkbase/core";

export const STORAGE_KEY = "project-brain-wizard-v1";
export const SITE_URL_KEY = "project-brain-wizard-site-url";
export const HOSTED_PROFILE_KEY = "project-brain-hosted-profile-id";

export const defaultWizardState = (): BrainInput => ({
  projectName: "",
  projectDescription: "",
  factBullets: ["", "", ""],
  storyTitle: "Main system",
  storyProblem: "",
  storyBuilt: "",
  storyProof: "",
  openQuestions: [""],
});

export function loadWizardState(): BrainInput {
  if (typeof window === "undefined") return defaultWizardState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultWizardState();
    return { ...defaultWizardState(), ...JSON.parse(raw) } as BrainInput;
  } catch {
    return defaultWizardState();
  }
}

export function saveWizardState(input: BrainInput): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("project-brain-wizard-save"));
  }
}

export function loadWizardSiteUrl(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(SITE_URL_KEY)?.trim() ?? "";
}

export function saveWizardSiteUrl(url: string): void {
  localStorage.setItem(SITE_URL_KEY, url.trim());
}

export function loadWizardHostedProfileId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(HOSTED_PROFILE_KEY)?.trim() ?? "";
}

export function saveWizardHostedProfileId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HOSTED_PROFILE_KEY, id.trim());
}
