import { lightTheme, type GraphEdge, type GraphNode, type Theme } from "reagraph";
import type { GraphEdge as LayoutEdge, GraphNode as LayoutNode } from "@/lib/brain-tree-data";

const LAYOUT_CX = 400;
const LAYOUT_CY = 400;

export type ReagraphBrainGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  positions: Map<string, { x: number; y: number; z: number }>;
};

export type ToReagraphOptions = {
  centerLabel: string;
  highlightDomains: Set<string>;
  extractDemo: boolean;
};

/** Agent KBase marketing palette → Reagraph theme */
export const agentKBaseGraphTheme: Theme = {
  ...lightTheme,
  canvas: {
    background: "#f4f4f5",
    fog: null,
  },
  node: {
    ...lightTheme.node,
    fill: "#18181b",
    activeFill: "#09090b",
    opacity: 1,
    inactiveOpacity: 0.15,
    selectedOpacity: 1,
    label: {
      ...lightTheme.node.label,
      color: "#3f3f46",
      activeColor: "#161618",
    },
  },
  edge: {
    ...lightTheme.edge,
    fill: "#d4d4d8",
    activeFill: "#18181b",
    opacity: 0.55,
    inactiveOpacity: 0.1,
    selectedOpacity: 1,
    label: {
      ...lightTheme.edge.label,
      color: "#71717a",
      activeColor: "#52525b",
    },
  },
  arrow: {
    fill: "#d4d4d8",
    activeFill: "#18181b",
  },
};

function layoutCoordToScene(x: number, y: number): { x: number; y: number; z: number } {
  return { x: x - LAYOUT_CX, y: -(y - LAYOUT_CY), z: 0 };
}

function nodeSize(kind: LayoutNode["kind"]): number {
  if (kind === "center") return 22;
  if (kind === "hub") return 12;
  return 7;
}

export function layoutToReagraph(
  layoutNodes: LayoutNode[],
  layoutEdges: LayoutEdge[],
  options: ToReagraphOptions,
): ReagraphBrainGraph {
  const { centerLabel, highlightDomains, extractDemo } = options;
  const positions = new Map<string, { x: number; y: number; z: number }>();

  const nodes: GraphNode[] = layoutNodes.map((n) => {
    const pos = layoutCoordToScene(n.x, n.y);
    positions.set(n.id, pos);

    const isCenter = n.kind === "center";
    const hot = Boolean(extractDemo && n.domainId && highlightDomains.has(n.domainId));
    const dim = Boolean(extractDemo && n.domainId && !highlightDomains.has(n.domainId));

    let fill: string | undefined;
    if (isCenter) fill = "#fafafa";
    else if (n.kind === "hub") fill = hot ? "#18181b" : dim ? "#a1a1aa" : "#18181b";
    else fill = hot ? "#18181b" : dim ? "#d4d4d8" : "#52525b";

    const label =
      isCenter ? centerLabel.replace(/\n/g, " · ") : n.kind === "hub" || n.kind === "leaf" ? n.label : undefined;

    const labelVisible = isCenter || n.kind === "hub" || (n.kind === "leaf" && !extractDemo);

    return {
      id: n.id,
      label,
      size: nodeSize(n.kind),
      fill,
      labelVisible,
      data: { domainId: n.domainId, kind: n.kind },
    };
  });

  const edges: GraphEdge[] = layoutEdges.map((e, i) => {
    const targetNode = layoutNodes.find((n) => n.id === e.to);
    const domainId = targetNode?.domainId;
    const hot = Boolean(extractDemo && domainId && highlightDomains.has(domainId));
    return {
      id: `e-${i}-${e.from}-${e.to}`,
      source: e.from,
      target: e.to,
      interpolation: "curved",
      fill: hot ? "#18181b" : undefined,
    };
  });

  return { nodes, edges, positions };
}

/** Custom layout hook for Reagraph (`layoutType="custom"`). */
export function createFixedLayoutOverrides(
  positions: Map<string, { x: number; y: number; z: number }>,
) {
  return {
    getNodePosition: (id: string) => {
      const pos = positions.get(id);
      return pos ?? { x: 0, y: 0, z: 0 };
    },
  } as Record<string, unknown>;
}

export function domainActives(
  layoutNodes: LayoutNode[],
  activeDomain: string | null,
): string[] {
  if (!activeDomain) return [];
  const ids = layoutNodes
    .filter((n) => n.id === "center" || n.domainId === activeDomain)
    .map((n) => n.id);
  return ids;
}
