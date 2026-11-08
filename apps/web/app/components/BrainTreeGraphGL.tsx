"use client";

import { GraphCanvas } from "reagraph";
import { useCallback, useMemo, useState, type ComponentProps } from "react";
import type { GraphNode as LayoutNode } from "@/lib/brain-tree-data";
import type { InternalGraphNode } from "reagraph";
import {
  agentKBaseGraphTheme,
  createFixedLayoutOverrides,
  domainActives,
  layoutToReagraph,
} from "@/lib/brain-graph-model";

type BrainTreeGraphGLProps = {
  layoutNodes: LayoutNode[];
  layoutEdges: { from: string; to: string }[];
  centerLabel: string;
  extractDemo: boolean;
  highlightDomains: string[];
  interactive?: boolean;
};

export function BrainTreeGraphGL({
  layoutNodes,
  layoutEdges,
  centerLabel,
  extractDemo,
  highlightDomains,
  interactive = true,
}: BrainTreeGraphGLProps) {
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  const highlightSet = useMemo(() => new Set(highlightDomains), [highlightDomains]);

  const graph = useMemo(
    () => layoutToReagraph(layoutNodes, layoutEdges, { centerLabel, highlightDomains: highlightSet, extractDemo }),
    [layoutNodes, layoutEdges, centerLabel, highlightSet, extractDemo],
  );

  const layoutOverrides = useMemo(
    () => createFixedLayoutOverrides(graph.positions),
    [graph.positions],
  );

  const actives = useMemo(
    () => (interactive ? domainActives(layoutNodes, activeDomain) : []),
    [interactive, layoutNodes, activeDomain],
  );

  const onNodePointerOver = useCallback((node: InternalGraphNode) => {
    const domainId = (node.data as { domainId?: string } | undefined)?.domainId;
    if (domainId) setActiveDomain(domainId);
  }, []);

  const onNodePointerOut = useCallback(() => setActiveDomain(null), []);

  return (
    <div className="brain-tree-gl" role="img" aria-label="Company brain graph">
      <GraphCanvas
        nodes={graph.nodes}
        edges={graph.edges}
        theme={agentKBaseGraphTheme}
        layoutType="custom"
        layoutOverrides={
          layoutOverrides as ComponentProps<typeof GraphCanvas>["layoutOverrides"]
        }
        actives={actives}
        animated={false}
        draggable={false}
        cameraMode="pan"
        minDistance={280}
        maxDistance={1200}
        minZoom={0.35}
        maxZoom={2.2}
        labelType="all"
        labelFontUrl="/fonts/inter-latin-600-normal.woff"
        edgeInterpolation="curved"
        onNodePointerOver={interactive ? onNodePointerOver : undefined}
        onNodePointerOut={interactive ? onNodePointerOut : undefined}
      />
    </div>
  );
}
