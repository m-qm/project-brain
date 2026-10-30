import { TEMPLATE_CONTENT } from "./content.generated.js";

export function loadTemplate(name: string): string {
  const key = name.replace(/\\/g, "/");
  const content = TEMPLATE_CONTENT[key];
  if (content === undefined) {
    throw new Error(`Unknown template: ${name}`);
  }
  return content;
}

export function renderTemplate(
  name: string,
  vars: Record<string, string>,
): string {
  let text = loadTemplate(name);
  for (const [key, value] of Object.entries(vars)) {
    text = text.replaceAll(`{{${key}}}`, value ?? "");
  }
  return text;
}

export const TEMPLATE_FILES = Object.keys(TEMPLATE_CONTENT);
