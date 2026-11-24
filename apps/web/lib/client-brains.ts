import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeBrainId } from "./brain-id";

/** Same four files loadCompanyBrain reads, under storage/telegram-brains/<id>/. */
export const CLIENT_BRAIN_FILES = [
  "facts/project.md",
  "facts/offer-limits.md",
  "open-questions.md",
  "stories/positioning.md",
] as const;

/** Same character cap as loadCompanyBrain. */
export const CLIENT_BRAIN_CAP = 14000;

export type ClientBrainSnapshot = { brains?: Record<string, string> };

export function assembleClientBrain(id: string, files: Record<string, string>): string | null {
  const project = files["facts/project.md"];
  if (!project?.trim()) return null;
  const chunks = [`# Client brain ${id}`, ""];
  for (const rel of CLIENT_BRAIN_FILES) {
    const text = files[rel];
    if (!text?.trim()) continue;
    chunks.push(`## ${rel}`, text.trim(), "");
  }
  const body = chunks.join("\n");
  if (!body.includes("## facts/project.md")) return null;
  return body.slice(0, CLIENT_BRAIN_CAP);
}

function storageRoots(explicit?: string): string[] {
  const roots = [
    explicit,
    path.join(process.cwd(), "storage", "telegram-brains"),
    path.join(process.cwd(), "apps", "web", "storage", "telegram-brains"),
  ];
  return roots.filter((root): root is string => Boolean(root));
}

function insideRoot(root: string, id: string): string | null {
  const base = path.resolve(root);
  const dir = path.resolve(root, id);
  if (dir !== path.join(base, id)) return null;
  return dir;
}

async function readBrainDir(dir: string, id: string): Promise<string | null> {
  const files: Record<string, string> = {};
  for (const rel of CLIENT_BRAIN_FILES) {
    try {
      files[rel] = await readFile(path.join(dir, rel), "utf8");
    } catch {
      // Missing file. project.md is required by assembleClientBrain.
    }
  }
  return assembleClientBrain(id, files);
}

async function fromDisk(id: string, explicitRoot?: string): Promise<string | null> {
  for (const root of storageRoots(explicitRoot)) {
    const dir = insideRoot(root, id);
    if (!dir) continue;
    const text = await readBrainDir(dir, id);
    if (text) return text;
  }
  return null;
}

async function fromSnapshotFile(id: string): Promise<string | null> {
  const candidates = [
    path.join(process.cwd(), "lib", "client-brains.snapshot.json"),
    path.join(process.cwd(), "apps", "web", "lib", "client-brains.snapshot.json"),
  ];
  for (const file of candidates) {
    try {
      const parsed = JSON.parse(await readFile(file, "utf8")) as ClientBrainSnapshot;
      const text = parsed.brains?.[id];
      if (text?.includes("## facts/project.md")) return text.slice(0, CLIENT_BRAIN_CAP);
    } catch {
      // Try the next snapshot path.
    }
  }
  return null;
}

export async function loadClientBrain(
  id: string,
  opts?: { root?: string; snapshot?: ClientBrainSnapshot },
): Promise<string | null> {
  const safe = normalizeBrainId(id);
  if (!safe) return null;
  const onDisk = await fromDisk(safe, opts?.root);
  if (onDisk) return onDisk;
  const bundled = opts?.snapshot?.brains?.[safe];
  if (bundled?.includes("## facts/project.md")) return bundled.slice(0, CLIENT_BRAIN_CAP);
  return fromSnapshotFile(safe);
}

/**
 * Public lead chat (no id) stays on the company brain.
 * A start payload selects a folder. A normal message never does.
 * Unknown ids do not fall through to a different client.
 */
export async function resolveShowcaseBrain(
  start: { brainId: string | null } | undefined,
  previousBrainId: string | undefined,
  opts?: { root?: string; snapshot?: ClientBrainSnapshot },
): Promise<{ brain: string; text: string | null }> {
  const requested = start ? start.brainId : (previousBrainId ?? null);
  const id = normalizeBrainId(requested);
  if (!id) return { brain: "company", text: null };
  const text = await loadClientBrain(id, opts);
  if (!text) return { brain: "company", text: null };
  return { brain: id, text };
}

function usableLines(brain: string): string[] {
  return brain
    .split("\n")
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter((line) => line && !line.startsWith("#") && !line.includes("[CONFIRM]"));
}

export function clientTitle(brain: string): string {
  const match = brain.match(/^#\s+(?!Client brain\b)(.+)$/m);
  return match?.[1]?.trim() ?? "";
}

function clientIntro(brain: string): string {
  const title = clientTitle(brain);
  const idx = title ? brain.indexOf(`# ${title}`) : -1;
  if (idx < 0) return "";
  const after = brain.slice(idx + title.length + 2);
  const para = after
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith("#") && !block.includes("[CONFIRM]"));
  return (para ?? "").replace(/\s+/g, " ").slice(0, 420);
}

/** A model reply may only carry euro amounts and names this brain already has. */
export function replySupportedByBrain(reply: string, brain: string): boolean {
  const text = reply.trim();
  if (!text) return false;
  if (/agent kbase|primeros clientes|onboarding our first customers/i.test(text) && !/agent kbase/i.test(brain)) {
    return false;
  }
  const amounts = text.match(/\d[\d.]*(?:,\d+)?(?=\s*€)/g) ?? [];
  return amounts.every((amount) => brain.includes(amount));
}

/** Grounded reply when no model key is set. Quotes notes; does not qualify a lead. */
export function scriptClientReply(locale: "en" | "es", brain: string, userText: string): string {
  const title = clientTitle(brain) || "This company";
  const introFull = clientIntro(brain);
  const intro = introFull.match(/^.*?\.(\s|$)/)?.[0]?.trim() ?? introFull.slice(0, 180);
  const lines = usableLines(brain);
  const prices = lines.filter((line) => /€/.test(line)).slice(0, 5);
  const caveat = lines.find((line) => /not a closed quote/i.test(line)) ?? "";
  const noClients = lines.find((line) => /names no clients/i.test(line)) ?? "";
  const asksPrice = /price|precio|cuesta|cost|cu[aá]nto|€|euro|presupuesto|quote/i.test(userText);
  const asksWho = /client|cliente|customer|conf[ií]an|who (?:do|are)|nombre/i.test(userText);
  const asksWhen = /\b(24\s?h|sla|plazo|deadline|cu[aá]ndo|when|how long|semana|week|d[ií]a laborable)\b/i.test(userText);

  if (asksWhen) {
    return locale === "es"
      ? "Eso está marcado [CONFIRM] en las notas, así que no lo doy como un hecho."
      : "That is marked [CONFIRM] in the notes, so I will not state it as fact.";
  }

  if (asksWho) {
    if (!noClients) {
      return locale === "es"
        ? "Eso está marcado [CONFIRM] en las notas, así que no lo doy como un hecho."
        : "That is marked [CONFIRM] in the notes, so I will not state it as fact.";
    }
    return locale === "es"
      ? `${title}. ${noClients} Solo respondo con estas notas.`
      : `${title}. ${noClients} I only answer from these notes.`;
  }

  const identity = [title.replace(/\.$/, ""), intro.replace(/\.$/, "")].filter(Boolean).join(". ");
  const only = locale === "es" ? "Solo respondo con estas notas." : "I only answer from these notes.";
  const priceBlock = [...prices, caveat].filter(Boolean).join(" ");
  if (asksPrice) {
    return priceBlock
      ? `${identity}. ${only}\n\n${priceBlock}`
      : `${identity}. ${only}\n\n${locale === "es" ? "Las notas no traen esa cifra." : "The notes do not have that figure."}`;
  }
  return priceBlock ? `${identity}. ${only}\n\n${priceBlock}` : `${identity}. ${only}`;
}
