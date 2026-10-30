import type { BrainInput } from "@project-brain/core/browser";

export type TreeLeaf = { id: string; label: string };

export type TreeDomain = {
  id: string;
  label: string;
  leaves: TreeLeaf[];
};

export const DEMO_CENTER = "COMPANY BRAIN";

/** Eight spokes · three leaves each — same topology as SkillTree marketing maps. */
export const DEMO_TREE: TreeDomain[] = [
  {
    id: "offers",
    label: "OFFERS",
    leaves: [
      { id: "o1", label: "99 € report" },
      { id: "o2", label: "48 h SLA" },
      { id: "o3", label: "Three actions" },
    ],
  },
  {
    id: "clients",
    label: "CLIENTS",
    leaves: [
      { id: "c1", label: "Renewal teams" },
      { id: "c2", label: "Ops leads" },
      { id: "c3", label: "Finance" },
    ],
  },
  {
    id: "voice",
    label: "VOICE",
    leaves: [
      { id: "v1", label: "Direct ES" },
      { id: "v2", label: "No hype" },
      { id: "v3", label: "Evidence first" },
    ],
  },
  {
    id: "facts",
    label: "FACTS",
    leaves: [
      { id: "f1", label: "Invoices in" },
      { id: "f2", label: "Export optional" },
      { id: "f3", label: "No account access" },
    ],
  },
  {
    id: "stories",
    label: "STORIES",
    leaves: [
      { id: "s1", label: "Problem" },
      { id: "s2", label: "Offer flow" },
      { id: "s3", label: "Proof gates" },
    ],
  },
  {
    id: "gaps",
    label: "GAPS",
    leaves: [
      { id: "g1", label: "[CONFIRM] SKU" },
      { id: "g2", label: "[CONFIRM] Export" },
      { id: "g3", label: "[CONFIRM] Claims" },
    ],
  },
  {
    id: "ops",
    label: "OPS",
    leaves: [
      { id: "p1", label: "Validate" },
      { id: "p2", label: "AGENTS.md" },
      { id: "p3", label: "brain brief" },
    ],
  },
  {
    id: "skills",
    label: "SKILLS",
    leaves: [
      { id: "k1", label: "SkillTree" },
      { id: "k2", label: "Cursor rules" },
      { id: "k3", label: "Engram opt." },
    ],
  },
];

function truncate(label: string, max = 22): string {
  const t = label.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function stripPrefix(line: string): string {
  return line.replace(/^(Problema|Entradas|Entregable|Datos|Privacidad|Oferta|Source)[^:]*:\s*/i, "");
}

export function treeFromWizard(input: BrainInput | null): {
  center: string;
  domains: TreeDomain[];
  isLive: boolean;
} {
  if (!input?.projectName?.trim()) {
    return { center: DEMO_CENTER, domains: DEMO_TREE, isLive: false };
  }

  const center = truncate(input.projectName.toUpperCase(), 18);
  const facts = input.factBullets.map((s) => s.trim()).filter(Boolean);
  const gaps = input.openQuestions.map((s) => s.trim()).filter(Boolean);

  const domains = DEMO_TREE.map((d) => {
    if (d.id === "facts" && facts.length > 0) {
      return {
        ...d,
        leaves: facts.slice(0, 3).map((label, i) => ({
          id: `f${i}`,
          label: truncate(stripPrefix(label)),
        })),
      };
    }
    if (d.id === "gaps" && gaps.length > 0) {
      return {
        ...d,
        leaves: gaps.slice(0, 3).map((label, i) => ({
          id: `g${i}`,
          label: truncate(label.replace(/^\[CONFIRM\]\s*/i, "")),
        })),
      };
    }
    if (d.id === "stories" && input.storyTitle?.trim()) {
      return {
        ...d,
        leaves: [
          { id: "s1", label: truncate(input.storyProblem || "Problem") },
          { id: "s2", label: truncate(input.storyTitle) },
          { id: "s3", label: truncate(input.storyBuilt || "Flow") },
        ],
      };
    }
    if (d.id === "offers" && input.projectMission?.trim()) {
      return {
        ...d,
        leaves: [
          { id: "o1", label: truncate(input.projectMission) },
          ...d.leaves.slice(1),
        ],
      };
    }
    return d;
  });

  return { center, domains, isLive: true };
}

export type GraphNode = {
  id: string;
  x: number;
  y: number;
  r: number;
  kind: "center" | "hub" | "leaf";
  label?: string;
  domainId?: string;
};

export type GraphEdge = { from: string; to: string };

const CX = 400;
const CY = 400;
const R_HUB = 118;
const R_LEAF = 228;

export function layoutBrainTree(domains: TreeDomain[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
    { id: "center", x: CX, y: CY, r: 36, kind: "center", label: "brain" },
  ];
  const edges: GraphEdge[] = [];
  const n = domains.length;
  const step = 360 / n;

  domains.forEach((domain, i) => {
    const angle = i * step;
    const hub = polar(CX, CY, R_HUB, angle);
    const hubId = `hub-${domain.id}`;
    nodes.push({
      id: hubId,
      x: hub.x,
      y: hub.y,
      r: 10,
      kind: "hub",
      label: domain.label,
      domainId: domain.id,
    });
    edges.push({ from: "center", to: hubId });

    const spreads = [-14, 0, 14];
    domain.leaves.forEach((leaf, j) => {
      const leafAngle = angle + (spreads[j] ?? 0);
      const pos = polar(CX, CY, R_LEAF, leafAngle);
      const leafId = `leaf-${domain.id}-${leaf.id}`;
      nodes.push({
        id: leafId,
        x: pos.x,
        y: pos.y,
        r: 6,
        kind: "leaf",
        label: leaf.label,
        domainId: domain.id,
      });
      edges.push({ from: hubId, to: leafId });
    });
  });

  return { nodes, edges };
}

function polar(cx: number, cy: number, r: number, deg: number): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Stable “nebula” dots for the center brain cluster */
export function centerClusterDots(seed = 1): { cx: number; cy: number; r: number; fill: string }[] {
  const colors = ["#2dd4bf", "#f472b6", "#fb923c", "#52525b", "#18181b", "#a1a1aa"];
  const out: { cx: number; cy: number; r: number; fill: string }[] = [];
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < 64; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = rand() * 28;
    out.push({
      cx: CX + Math.cos(angle) * dist,
      cy: CY + Math.sin(angle) * dist,
      r: 1.2 + rand() * 2.2,
      fill: colors[i % colors.length],
    });
  }
  return out;
}
