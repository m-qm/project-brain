"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EXTRACT_DEMO_INPUT,
  centerClusterDots,
  layoutBrainTree,
  treeFromWizard,
  type TreeDomain,
} from "@/lib/brain-tree-data";
import { loadWizardState } from "@/lib/wizard-state";

type BrainTreeGraphProps = {
  /** When true, merge nodes from wizard localStorage */
  live?: boolean;
  /** Landing extract section: filled FACTS / GAPS from a sample URL scan */
  extractDemo?: boolean;
  /** Spoke ids to emphasize (e.g. facts, gaps) */
  highlightDomains?: string[];
  className?: string;
  centerLabel?: string;
  domains?: TreeDomain[];
};

export function BrainTreeGraph({
  live = false,
  extractDemo = false,
  highlightDomains = [],
  className = "",
  centerLabel: centerLabelProp,
  domains: domainsProp,
}: BrainTreeGraphProps) {
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  // Never read localStorage in initial state: SSR and first client paint must match.
  const [liveTree, setLiveTree] = useState(() => {
    if (extractDemo) return treeFromWizard(EXTRACT_DEMO_INPUT);
    return treeFromWizard(null);
  });
  const [liveReady, setLiveReady] = useState(!live);

  useEffect(() => {
    if (!live) return;
    const refresh = () => {
      setLiveTree(treeFromWizard(loadWizardState()));
      setLiveReady(true);
    };
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key?.includes("project-brain-wizard")) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("project-brain-wizard-save", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("project-brain-wizard-save", refresh);
    };
  }, [live]);

  const centerLabel = centerLabelProp ?? liveTree.center;
  const domains = domainsProp ?? liveTree.domains;
  const { nodes, edges } = useMemo(() => layoutBrainTree(domains), [domains]);
  const dots = useMemo(() => centerClusterDots(42), []);

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const highlightSet = new Set(highlightDomains);
  const graphClass = [
    "brain-tree-graph",
    extractDemo ? "brain-tree-graph--extract" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <figure className={graphClass} aria-label="Brain radial map">
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
          const emphasized =
            extractDemo && edgeDomain && highlightSet.has(edgeDomain);
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
              className={
                emphasized ? "brain-tree-edge brain-tree-edge--hot" : "brain-tree-edge"
              }
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
          const hot =
            extractDemo && node.domainId && highlightSet.has(node.domainId);

          return (
            <g
              key={node.id}
              style={{ opacity: dim ? 0.2 : hot ? 1 : extractDemo ? 0.45 : 1 }}
              onMouseEnter={() => node.domainId && setActiveDomain(node.domainId)}
              onMouseLeave={() => setActiveDomain(null)}
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
      {live && liveReady && liveTree.isLive && (
        <figcaption className="brain-tree-caption live">Nodes synced from your wizard draft</figcaption>
      )}
      {!live && extractDemo && (
        <figcaption className="brain-tree-caption extract">
          Sample after URL extract · FACTS and GAPS highlighted ·{" "}
          <a href="/wizard">Try your URL</a>
        </figcaption>
      )}
      {!live && !extractDemo && (
        <figcaption className="brain-tree-caption">
          Demo topology · hover a spoke ·{" "}
          <a href="/wizard">Wizard</a> fills FACTS, STORIES, and GAPS
        </figcaption>
      )}
    </figure>
  );
}
