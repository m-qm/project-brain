"use client";

import {
  centerClusterDots,
  type GraphEdge,
  type GraphNode,
} from "@/lib/brain-tree-data";

type BrainTreeGraphSvgProps = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  centerLabel: string;
  extractDemo: boolean;
  highlightDomains: string[];
  activeDomain: string | null;
  onActiveDomain: (id: string | null) => void;
  live: boolean;
  liveReady: boolean;
};

export function BrainTreeGraphSvg({
  nodes,
  edges,
  centerLabel,
  extractDemo,
  highlightDomains,
  activeDomain,
  onActiveDomain,
  live,
  liveReady,
}: BrainTreeGraphSvgProps) {
  const dots = centerClusterDots(42);
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const highlightSet = new Set(highlightDomains);

  return (
    <svg
      viewBox="0 0 800 800"
      role="img"
      className="brain-tree-svg"
      aria-busy={live && !liveReady}
    >
      <title>Radial map: company brain at center, domains and leaves on spokes</title>
      {edges.map((e) => {
        const a = nodeById.get(e.from);
        const b = nodeById.get(e.to);
        if (!a || !b) return null;
        const edgeDomain = b.domainId ?? a.domainId;
        const emphasized = extractDemo && edgeDomain && highlightSet.has(edgeDomain);
        const dim =
          activeDomain &&
          a.domainId !== activeDomain &&
          b.domainId !== activeDomain &&
          e.from !== "center";
        return (
          <line
            key={`${e.from}-${e.to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className={emphasized ? "brain-tree-edge brain-tree-edge--hot" : "brain-tree-edge"}
            style={{ opacity: dim ? 0.12 : emphasized ? 1 : 0.55 }}
          />
        );
      })}

      <g className="brain-tree-center-cluster" aria-hidden>
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} opacity={0.85} />
        ))}
      </g>

      {nodes.map((node) => {
        if (node.kind === "center") {
          return (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r={node.r} className="brain-tree-center-ring" />
              <text x={node.x} y={node.y + 4} textAnchor="middle" className="brain-tree-center-text">
                {centerLabel.split("\n").map((line, i) => (
                  <tspan key={i} x={node.x} dy={i === 0 ? 0 : 14}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        }

        const dim = activeDomain && node.domainId !== activeDomain;
        const isHub = node.kind === "hub";
        const hot = extractDemo && node.domainId && highlightSet.has(node.domainId);

        return (
          <g
            key={node.id}
            style={{ opacity: dim ? 0.2 : hot ? 1 : extractDemo ? 0.45 : 1 }}
            onMouseEnter={() => node.domainId && onActiveDomain(node.domainId)}
            onMouseLeave={() => onActiveDomain(null)}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={node.r}
              className={
                isHub
                  ? hot
                    ? "brain-tree-hub brain-tree-hub--hot"
                    : "brain-tree-hub"
                  : hot
                    ? "brain-tree-leaf brain-tree-leaf--hot"
                    : "brain-tree-leaf"
              }
            />
            {node.label && (
              <text
                x={node.x}
                y={node.y + (isHub ? -18 : 20)}
                textAnchor="middle"
                className={isHub ? "brain-tree-hub-label" : "brain-tree-leaf-label"}
              >
                {node.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
