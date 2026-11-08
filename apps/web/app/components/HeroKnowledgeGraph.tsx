"use client";

import { useEffect, useId, useRef } from "react";

export type HeroGraphCopy = {
  caption: string;
  legendFacts: string;
  legendStories: string;
  legendQuestions: string;
  legendConfirm: string;
  center: string;
  facts: string;
  stories: string;
  questions: string;
  confirm: string;
  agents: string;
  project: string;
  routing: string;
  voice: string;
  offers: string;
  constraints: string;
  client: string;
  audience: string;
  price: string;
  deadline: string;
};

type Tone = "center" | "fact" | "story" | "question" | "confirm" | "agent";
type Anchor = "n" | "s" | "e" | "w";

type NodeDef = {
  id: string;
  labelKey?: keyof HeroGraphCopy;
  tone: Tone;
  kind: "hub" | "leaf" | "gap" | "center" | "dust";
  x: number;
  y: number;
  r: number;
  phase: number;
  drift: number;
  anchor?: Anchor;
  lines?: boolean;
};

type EdgeDef = {
  from: string;
  to: string;
  bend: 1 | -1;
  gap?: boolean;
};

type Point = { x: number; y: number };

const NODES: NodeDef[] = [
  { id: "offers", labelKey: "offers", tone: "fact", kind: "leaf", x: 196, y: 72, r: 7, phase: 0.2, drift: 11, anchor: "n" },
  { id: "voice", labelKey: "voice", tone: "fact", kind: "leaf", x: 108, y: 132, r: 7, phase: 1.1, drift: 10, anchor: "n" },
  { id: "facts", labelKey: "facts", tone: "fact", kind: "hub", x: 228, y: 186, r: 18, phase: 0.4, drift: 7, anchor: "w" },
  { id: "constraints", labelKey: "constraints", tone: "fact", kind: "leaf", x: 108, y: 262, r: 6.5, phase: 2.2, drift: 11, anchor: "s" },
  { id: "project", labelKey: "project", tone: "fact", kind: "leaf", x: 338, y: 108, r: 7, phase: 1.7, drift: 9, anchor: "n" },
  { id: "dust-facts", tone: "fact", kind: "dust", x: 310, y: 210, r: 3.4, phase: 0.9, drift: 13 },

  { id: "dust-stories", tone: "story", kind: "dust", x: 478, y: 78, r: 3.4, phase: 3.1, drift: 12 },
  { id: "stories", labelKey: "stories", tone: "story", kind: "hub", x: 548, y: 164, r: 18, phase: 0.6, drift: 7, anchor: "n" },
  { id: "client", labelKey: "client", tone: "story", kind: "leaf", x: 620, y: 84, r: 7, phase: 2.8, drift: 10, anchor: "n" },
  { id: "routing", labelKey: "routing", tone: "story", kind: "leaf", x: 648, y: 248, r: 7, phase: 1.4, drift: 9, anchor: "s" },

  { id: "brain", labelKey: "center", tone: "center", kind: "center", x: 400, y: 318, r: 30, phase: 0.15, drift: 4.5 },

  { id: "agents", labelKey: "agents", tone: "agent", kind: "hub", x: 590, y: 368, r: 12, phase: 2.1, drift: 7, anchor: "e" },
  { id: "dust-agents", tone: "agent", kind: "dust", x: 648, y: 412, r: 3.2, phase: 0.5, drift: 11 },

  { id: "audience", labelKey: "audience", tone: "question", kind: "leaf", x: 118, y: 348, r: 6.5, phase: 1.9, drift: 10, anchor: "e" },
  { id: "questions", labelKey: "questions", tone: "question", kind: "hub", x: 196, y: 424, r: 16, phase: 2.6, drift: 7, anchor: "s", lines: true },
  { id: "dust-questions", tone: "question", kind: "dust", x: 132, y: 500, r: 3.2, phase: 3.4, drift: 12 },

  { id: "price", labelKey: "price", tone: "confirm", kind: "gap", x: 268, y: 534, r: 7, phase: 0.8, drift: 10, anchor: "w" },
  { id: "confirm", labelKey: "confirm", tone: "confirm", kind: "gap", x: 404, y: 492, r: 15, phase: 1.5, drift: 6, anchor: "n" },
  { id: "deadline", labelKey: "deadline", tone: "confirm", kind: "gap", x: 548, y: 534, r: 7, phase: 2.4, drift: 10, anchor: "e" },
  { id: "dust-gap", tone: "confirm", kind: "dust", x: 492, y: 448, r: 3.2, phase: 3.6, drift: 11 },
];

const EDGES: EdgeDef[] = [
  { from: "brain", to: "facts", bend: 1 },
  { from: "brain", to: "stories", bend: -1 },
  { from: "brain", to: "questions", bend: 1 },
  { from: "brain", to: "confirm", bend: -1, gap: true },
  { from: "brain", to: "agents", bend: 1 },
  { from: "facts", to: "offers", bend: -1 },
  { from: "facts", to: "voice", bend: 1 },
  { from: "facts", to: "constraints", bend: -1 },
  { from: "facts", to: "project", bend: 1 },
  { from: "facts", to: "dust-facts", bend: -1 },
  { from: "facts", to: "questions", bend: 1 },
  { from: "stories", to: "client", bend: -1 },
  { from: "stories", to: "routing", bend: 1 },
  { from: "stories", to: "dust-stories", bend: 1 },
  { from: "stories", to: "agents", bend: -1 },
  { from: "questions", to: "audience", bend: -1 },
  { from: "questions", to: "confirm", bend: 1, gap: true },
  { from: "questions", to: "dust-questions", bend: -1 },
  { from: "confirm", to: "price", bend: 1, gap: true },
  { from: "confirm", to: "deadline", bend: -1, gap: true },
  { from: "confirm", to: "dust-gap", bend: 1, gap: true },
  { from: "agents", to: "dust-agents", bend: -1 },
];

const PULSES = [
  { edge: 0, speed: 0.16, offset: 0 },
  { edge: 1, speed: 0.13, offset: 0.35 },
  { edge: 4, speed: 0.18, offset: 0.62 },
  { edge: 16, speed: 0.15, offset: 0.2 },
];

const NODE_BY_ID = new Map(NODES.map((node) => [node.id, node]));

function controlPoint(a: Point, b: Point, bend: number): Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const mag = Math.min(40, len * 0.18) * bend;
  return {
    x: (a.x + b.x) / 2 + (-dy / len) * mag,
    y: (a.y + b.y) / 2 + (dx / len) * mag,
  };
}

function edgePath(a: Point, b: Point, bend: number): string {
  const c = controlPoint(a, b, bend);
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${c.x.toFixed(1)} ${c.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

function pointOnEdge(a: Point, b: Point, bend: number, u: number): Point {
  const c = controlPoint(a, b, bend);
  const t = 1 - u;
  return {
    x: t * t * a.x + 2 * t * u * c.x + u * u * b.x,
    y: t * t * a.y + 2 * t * u * c.y + u * u * b.y,
  };
}

function labelPlacement(anchor: Anchor, r: number): { x: number; y: number; textAnchor: "start" | "middle" | "end" } {
  switch (anchor) {
    case "n":
      return { x: 0, y: -(r + 12), textAnchor: "middle" };
    case "s":
      return { x: 0, y: r + 16, textAnchor: "middle" };
    case "e":
      return { x: r + 9, y: 4, textAnchor: "start" };
    case "w":
      return { x: -(r + 9), y: 4, textAnchor: "end" };
  }
}

function splitLabel(label: string, lines: boolean | undefined): string[] {
  if (!lines) return [label];
  const parts = label.trim().split(/\s+/);
  if (parts.length < 2) return [label];
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")];
}

function edgeKey(edge: EdgeDef): string {
  return `${edge.from}-${edge.to}`;
}

export function HeroKnowledgeGraph({ copy }: { copy: HeroGraphCopy }) {
  const rawId = useId();
  const gradId = `hero-graph-wash-${rawId.replace(/:/g, "")}`;
  const groups = useRef<Record<string, SVGGElement | null>>({});
  const paths = useRef<Record<string, SVGPathElement | null>>({});
  const pulses = useRef<Array<SVGCircleElement | null>>([]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let alive = true;

    const place = (at: (node: NodeDef) => Point) => {
      const pos = new Map<string, Point>();
      for (const node of NODES) {
        const point = at(node);
        pos.set(node.id, point);
        groups.current[node.id]?.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
      }
      EDGES.forEach((edge) => {
        const a = pos.get(edge.from);
        const b = pos.get(edge.to);
        if (!a || !b) return;
        paths.current[edgeKey(edge)]?.setAttribute("d", edgePath(a, b, edge.bend));
      });
      return pos;
    };

    const reset = () => {
      place((node) => ({ x: node.x, y: node.y }));
      pulses.current.forEach((dot) => dot?.setAttribute("opacity", "0"));
    };

    const tick = (now: number) => {
      if (!alive) return;
      if (document.visibilityState === "hidden") {
        frame = requestAnimationFrame(tick);
        return;
      }
      const t = now / 1000;
      const pos = place((node) => ({
        x: node.x + Math.sin(t * 0.72 + node.phase) * node.drift,
        y: node.y + Math.cos(t * 0.56 + node.phase * 1.17) * node.drift * 0.85,
      }));
      PULSES.forEach((pulse, index) => {
        const edge = EDGES[pulse.edge];
        const dot = pulses.current[index];
        if (!edge || !dot) return;
        const a = pos.get(edge.from);
        const b = pos.get(edge.to);
        if (!a || !b) return;
        const u = (t * pulse.speed + pulse.offset) % 1;
        const p = pointOnEdge(a, b, edge.bend, u);
        dot.setAttribute("cx", p.x.toFixed(2));
        dot.setAttribute("cy", p.y.toFixed(2));
        dot.setAttribute("opacity", "1");
      });
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (motion.matches) {
        reset();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    start();
    motion.addEventListener("change", start);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      motion.removeEventListener("change", start);
    };
  }, []);

  return (
    <figure className="hero-graph" aria-label={copy.caption}>
      <svg className="hero-graph-svg" viewBox="0 0 760 590" role="img">
        <title>{copy.caption}</title>
        <defs>
          <radialGradient id={gradId} cx="50%" cy="46%" r="58%">
            <stop offset="0%" stopColor="#12715c" stopOpacity="0.16" />
            <stop offset="55%" stopColor="#1d4f8f" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#12715c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="400" cy="300" rx="300" ry="230" fill={`url(#${gradId})`} />
        {EDGES.map((edge) => {
          const a = NODE_BY_ID.get(edge.from);
          const b = NODE_BY_ID.get(edge.to);
          if (!a || !b) return null;
          return (
            <path
              key={edgeKey(edge)}
              ref={(el) => {
                paths.current[edgeKey(edge)] = el;
              }}
              d={edgePath(a, b, edge.bend)}
              className={edge.gap ? "hero-graph-edge is-gap" : "hero-graph-edge"}
            />
          );
        })}
        <g aria-hidden>
          {PULSES.map((pulse, index) => {
            const edge = EDGES[pulse.edge];
            const a = edge ? NODE_BY_ID.get(edge.from) : undefined;
            const b = edge ? NODE_BY_ID.get(edge.to) : undefined;
            const p = a && b && edge ? pointOnEdge(a, b, edge.bend, pulse.offset) : { x: 0, y: 0 };
            return (
              <circle
                key={pulse.edge}
                ref={(el) => {
                  pulses.current[index] = el;
                }}
                className="hero-graph-pulse"
                cx={p.x}
                cy={p.y}
                r="3.2"
                opacity="0"
              />
            );
          })}
        </g>
        {NODES.map((node) => {
          const label = node.labelKey ? copy[node.labelKey] : "";
          const lines = label ? splitLabel(label, node.lines) : [];
          const place = node.anchor ? labelPlacement(node.anchor, node.r) : null;
          const mono = node.labelKey === "project" || node.labelKey === "routing" || node.labelKey === "agents";
          return (
            <g
              key={node.id}
              ref={(el) => {
                groups.current[node.id] = el;
              }}
              className={`hero-graph-node is-${node.tone} is-${node.kind}`}
              transform={`translate(${node.x} ${node.y})`}
            >
              {node.kind !== "dust" && (
                <circle className="hero-graph-halo" r={node.r * 2.15} style={{ animationDelay: `${node.phase}s` }} />
              )}
              {node.kind === "center" && <circle className="hero-graph-orbit" r={node.r + 16} />}
              <circle className="hero-graph-dot" r={node.r} />
              {node.kind === "center" && label && (
                <text className="hero-graph-center-label" textAnchor="middle" dominantBaseline="central">
                  {label}
                </text>
              )}
              {place && lines.length > 0 && (
                <text
                  className={mono ? "hero-graph-label is-mono" : "hero-graph-label"}
                  textAnchor={place.textAnchor}
                  y={lines.length > 1 ? place.y - 8 : place.y}
                >
                  {lines.map((line, index) => (
                    <tspan key={`${node.id}-${index}`} x={place.x} dy={index === 0 ? 0 : 20}>
                      {line}
                    </tspan>
                  ))}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <ul className="hero-graph-legend">
        <li>
          <span className="hero-graph-swatch is-fact" aria-hidden />
          {copy.legendFacts}
        </li>
        <li>
          <span className="hero-graph-swatch is-story" aria-hidden />
          {copy.legendStories}
        </li>
        <li>
          <span className="hero-graph-swatch is-question" aria-hidden />
          {copy.legendQuestions}
        </li>
        <li>
          <span className="hero-graph-swatch is-confirm" aria-hidden />
          {copy.legendConfirm}
        </li>
      </ul>
    </figure>
  );
}
