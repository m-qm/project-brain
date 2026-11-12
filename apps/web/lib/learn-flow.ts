/**
 * Small flowchart subset for learn articles (`flowchart` / `graph`, TD or LR).
 * Subgraphs become side-by-side columns. A second disconnected chain sits in a row
 * under the main graph. Anything else returns null so the caller can keep the fence.
 */

type Dir = "TD" | "LR";

type NodeRec = {
  id: string;
  label: string;
  column: number;
};

type EdgeRec = {
  from: string;
  to: string;
  dashed: boolean;
  label?: string;
};

type ColumnRec = {
  title: string;
};

type Box = {
  id: string;
  lines: string[];
  x: number;
  y: number;
  w: number;
  h: number;
};

type Kicker = {
  text: string;
  x: number;
  y: number;
};

type Scene = {
  boxes: Box[];
  kickers: Kicker[];
  edges: EdgeRec[];
  width: number;
  height: number;
};

const FONT = 13;
const LINE = 17;
const PAD_X = 14;
const PAD_Y = 10;
const MIN_W = 96;
const ROW_GAP = 44;
const SIB_GAP = 14;
const COL_GAP = 48;
const KICKER = 22;
const PAGE_PAD = 8;

function xml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function charWidth(ch: string): number {
  if (ch === " ") return 3.6;
  if ("ilj.,'`|!".includes(ch)) return 3.6;
  if ("frtI".includes(ch)) return 4.6;
  if ("mw".includes(ch)) return 10.2;
  if ("MW@#%&".includes(ch)) return 11;
  if (ch === "/") return 4.4;
  return 7.35;
}

function textWidth(s: string): number {
  let w = 0;
  for (const ch of s) w += charWidth(ch);
  return w * 1.08;
}

function wrapLabel(label: string, maxW: number): string[] {
  const lines: string[] = [];
  for (const part of label.split("\n")) {
    const words = part.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    let cur = "";
    for (const word of words) {
      const next = cur ? `${cur} ${word}` : word;
      if (textWidth(next) <= maxW || !cur) cur = next;
      else {
        lines.push(cur);
        cur = word;
      }
    }
    if (cur) lines.push(cur);
  }
  return lines.length > 0 ? lines : [""];
}

function boxSize(lines: string[]): { w: number; h: number } {
  const widest = lines.reduce((m, line) => Math.max(m, textWidth(line)), 0);
  return {
    w: Math.max(MIN_W, Math.ceil(widest) + PAD_X * 2),
    h: lines.length * LINE + PAD_Y * 2,
  };
}

function maxText(siblings: number): number {
  if (siblings <= 1) return 230;
  if (siblings === 2) return 200;
  const gaps = (siblings - 1) * SIB_GAP;
  const pads = siblings * PAD_X * 2;
  return Math.max(128, Math.floor((572 - gaps - pads) / siblings));
}

function parseNodeToken(raw: string): { id: string; label?: string } | null {
  const m = raw
    .trim()
    .match(/^([A-Za-z][\w-]*)(?:\["([^"]*)"\]|\[([^\]]*)\]|\("([^"]*)"\))?$/);
  if (!m) return null;
  const label = (m[2] ?? m[3] ?? m[4])?.replace(/<br\s*\/?>/gi, "\n");
  return { id: m[1]!, label };
}

type Graph = {
  dir: Dir;
  caption: string;
  nodes: Map<string, NodeRec>;
  edges: EdgeRec[];
  columns: ColumnRec[];
};

function scanEdges(
  line: string,
  define: (id: string, label: string | undefined) => void,
  edges: EdgeRec[],
): boolean {
  const parts: { id: string; label?: string }[] = [];
  const arrows: { dashed: boolean; label?: string }[] = [];
  let rest = line.trim();
  while (rest) {
    const m = rest.match(/^(.*?)(-->|-\.->)\s*(?:\|([^|]*)\|\s*)?([\s\S]*)$/);
    if (!m) {
      const last = parseNodeToken(rest);
      if (!last) return false;
      parts.push(last);
      rest = "";
      break;
    }
    const left = parseNodeToken((m[1] ?? "").trim());
    if (!left) return false;
    parts.push(left);
    arrows.push({ dashed: m[2] === "-.->", label: m[3]?.trim() || undefined });
    rest = (m[4] ?? "").trim();
  }
  if (parts.length < 2 || arrows.length !== parts.length - 1) return false;
  for (const part of parts) define(part.id, part.label);
  for (let i = 0; i < arrows.length; i++) {
    edges.push({
      from: parts[i]!.id,
      to: parts[i + 1]!.id,
      dashed: arrows[i]!.dashed,
      label: arrows[i]!.label,
    });
  }
  return true;
}

function parseFlowClean(source: string): Graph | null {
  const nodes = new Map<string, NodeRec>();
  const edges: EdgeRec[] = [];
  const columns: ColumnRec[] = [];
  const captions: string[] = [];
  let dir: Dir | null = null;
  let column = -1;
  let open = false;
  let sawColumn = false;

  const define = (id: string, label: string | undefined) => {
    const existing = nodes.get(id);
    if (!existing) {
      if (!sawColumn) {
        if (columns.length === 0) columns.push({ title: "" });
        nodes.set(id, { id, label: label ?? id, column: 0 });
        return;
      }
      const col = column >= 0 ? column : columns.length;
      if (column < 0 && col === columns.length) columns.push({ title: "" });
      nodes.set(id, { id, label: label ?? id, column: col });
      return;
    }
    if (label && existing.label === id) existing.label = label;
  };

  for (const rawLine of source.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("%%")) {
      const note = line.slice(2).trim();
      if (note) captions.push(note);
      continue;
    }
    if (!dir) {
      const head = line.match(/^(?:flowchart|graph)\s+(TD|TB|LR)$/i);
      if (!head) return null;
      dir = head[1]!.toUpperCase() === "LR" ? "LR" : "TD";
      continue;
    }
    if (/^direction\s+(TB|TD|LR|RL)$/i.test(line)) continue;
    const sub = line.match(/^subgraph\s+([A-Za-z][\w-]*)(?:\s+\[(?:"([^"]*)"|([^\]]*))\])?\s*$/);
    if (sub) {
      if (open) return null;
      open = true;
      sawColumn = true;
      column = columns.length;
      columns.push({ title: (sub[2] ?? sub[3] ?? sub[1] ?? "").trim() });
      continue;
    }
    if (line === "end") {
      if (!open) return null;
      open = false;
      column = -1;
      continue;
    }
    if (line.includes("-->") || line.includes("-.->")) {
      if (!scanEdges(line, define, edges)) return null;
      continue;
    }
    const node = parseNodeToken(line);
    if (!node) return null;
    define(node.id, node.label);
  }

  if (open || !dir || nodes.size === 0) return null;
  // Drop a placeholder column created before any subgraph.
  if (sawColumn) {
    for (const node of nodes.values()) {
      if (!columns[node.column]) return null;
    }
  }
  return { dir, caption: captions.join(" "), nodes, edges, columns };
}

function columnGroups(graph: Graph): string[][] {
  const groups: string[][] = graph.columns.map(() => []);
  const order = [...graph.nodes.values()];
  for (const node of order) {
    if (!groups[node.column]) groups[node.column] = [];
    groups[node.column]!.push(node.id);
  }
  return groups.filter((ids) => ids.length > 0);
}

function hasSubgraphs(graph: Graph): boolean {
  return graph.columns.some((col) => col.title.length > 0);
}

function topo(ids: string[], edges: EdgeRec[]): string[] {
  const set = new Set(ids);
  const incoming = new Map<string, number>(ids.map((id) => [id, 0]));
  const next = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const edge of edges) {
    if (!set.has(edge.from) || !set.has(edge.to) || edge.from === edge.to) continue;
    incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1);
    next.get(edge.from)!.push(edge.to);
  }
  const queue = ids.filter((id) => incoming.get(id) === 0);
  const out: string[] = [];
  const seen = new Set<string>();
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    for (const nxt of next.get(id) ?? []) {
      const left = (incoming.get(nxt) ?? 1) - 1;
      incoming.set(nxt, left);
      if (left === 0) queue.push(nxt);
    }
  }
  for (const id of ids) if (!seen.has(id)) out.push(id);
  return out;
}

function makeBox(id: string, label: string, siblings: number): Box {
  const lines = wrapLabel(label, maxText(siblings));
  const size = boxSize(lines);
  return { id, lines, x: 0, y: 0, w: size.w, h: size.h };
}

function connectedComponents(ids: string[], edges: EdgeRec[]): string[][] {
  const set = new Set(ids);
  const adj = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const edge of edges) {
    if (!set.has(edge.from) || !set.has(edge.to)) continue;
    adj.get(edge.from)!.push(edge.to);
    adj.get(edge.to)!.push(edge.from);
  }
  const seen = new Set<string>();
  const components: string[][] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    const comp: string[] = [];
    const stack = [id];
    seen.add(id);
    while (stack.length > 0) {
      const cur = stack.pop()!;
      comp.push(cur);
      for (const nxt of adj.get(cur) ?? []) {
        if (seen.has(nxt)) continue;
        seen.add(nxt);
        stack.push(nxt);
      }
    }
    components.push(comp);
  }
  return components;
}

function isChain(ids: string[], edges: EdgeRec[]): boolean {
  const set = new Set(ids);
  const inn = new Map<string, number>(ids.map((id) => [id, 0]));
  const out = new Map<string, number>(ids.map((id) => [id, 0]));
  let n = 0;
  for (const edge of edges) {
    if (!set.has(edge.from) || !set.has(edge.to)) continue;
    inn.set(edge.to, (inn.get(edge.to) ?? 0) + 1);
    out.set(edge.from, (out.get(edge.from) ?? 0) + 1);
    n++;
  }
  if (n !== ids.length - 1) return false;
  return ids.every((id) => (inn.get(id) ?? 0) <= 1 && (out.get(id) ?? 0) <= 1);
}

function layoutColumns(graph: Graph): Scene {
  const groups = columnGroups(graph).map((ids) => topo(ids, graph.edges));
  const boxes = new Map<string, Box>();
  for (const ids of groups) {
    for (const id of ids) {
      boxes.set(id, makeBox(id, graph.nodes.get(id)!.label, 1));
    }
  }

  const kickers: Kicker[] = [];
  let cursorX = 0;
  groups.forEach((ids, index) => {
    const title = graph.columns[index]?.title ?? "";
    const titleW = title ? Math.ceil(textWidth(title)) + 4 : 0;
    const width = Math.max(titleW, ...ids.map((id) => boxes.get(id)!.w));
    let y = title ? KICKER : 0;
    for (const id of ids) {
      const box = boxes.get(id)!;
      box.w = width;
      box.x = cursorX;
      box.y = y;
      y += box.h + ROW_GAP;
    }
    if (title) {
      kickers.push({ text: title, x: cursorX, y: 2 });
    }
    cursorX += width + COL_GAP;
  });

  // Pull a column down so a cross-edge meets its target, instead of stretching a long arrow.
  const shifts = new Map<number, number>();
  for (const edge of graph.edges) {
    const from = boxes.get(edge.from);
    const to = boxes.get(edge.to);
    if (!from || !to) continue;
    const fromCol = graph.nodes.get(edge.from)!.column;
    const toCol = graph.nodes.get(edge.to)!.column;
    if (fromCol === toCol) continue;
    const delta = from.y + from.h / 2 - (to.y + to.h / 2);
    const prev = shifts.get(toCol);
    shifts.set(toCol, prev === undefined ? delta : (prev + delta) / 2);
  }
  for (const [col, delta] of shifts) {
    if (Math.abs(delta) < 1) continue;
    for (const node of graph.nodes.values()) {
      if (node.column !== col) continue;
      boxes.get(node.id)!.y += delta;
    }
    const title = graph.columns[col]?.title;
    if (title) {
      const kicker = kickers.find((item) => item.text === title);
      if (kicker) kicker.y += delta;
    }
  }

  return finishScene([...boxes.values()], kickers, graph.edges);
}

function layoutRanks(graph: Graph, ids: string[], row: boolean): { boxes: Box[]; width: number; height: number } {
  const boxes = new Map<string, Box>();
  if (row || graph.dir === "LR") {
    const order = topo(ids, graph.edges);
    let x = 0;
    let height = 0;
    for (const id of order) {
      const box = makeBox(id, graph.nodes.get(id)!.label, order.length);
      box.x = x;
      box.y = 0;
      boxes.set(id, box);
      x += box.w + 40;
      height = Math.max(height, box.h);
    }
    for (const box of boxes.values()) {
      box.y = (height - box.h) / 2;
    }
    return { boxes: [...boxes.values()], width: Math.max(0, x - 40), height };
  }

  const rank = new Map<string, number>();
  const visiting = new Set<string>();
  const incoming = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const edge of graph.edges) {
    if (incoming.has(edge.to) && incoming.has(edge.from)) incoming.get(edge.to)!.push(edge.from);
  }
  const dfs = (id: string): number => {
    const known = rank.get(id);
    if (known !== undefined) return known;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    let value = 0;
    for (const parent of incoming.get(id) ?? []) value = Math.max(value, dfs(parent) + 1);
    visiting.delete(id);
    rank.set(id, value);
    return value;
  };
  for (const id of ids) dfs(id);

  const sourceIndex = new Map([...graph.nodes.keys()].map((id, index) => [id, index]));
  const byRank = new Map<number, string[]>();
  for (const id of ids) {
    const r = rank.get(id) ?? 0;
    const list = byRank.get(r) ?? [];
    list.push(id);
    byRank.set(r, list);
  }
  for (const list of byRank.values()) {
    list.sort((a, b) => (sourceIndex.get(a) ?? 0) - (sourceIndex.get(b) ?? 0));
  }
  const ranks = [...byRank.keys()].sort((a, b) => a - b);
  let y = 0;
  let width = 0;
  const placed: Box[][] = [];
  for (const r of ranks) {
    const rowIds = byRank.get(r)!;
    const rowBoxes = rowIds.map((id) => makeBox(id, graph.nodes.get(id)!.label, rowIds.length));
    const w = Math.max(...rowBoxes.map((box) => box.w));
    const h = Math.max(...rowBoxes.map((box) => box.h));
    for (const box of rowBoxes) {
      box.w = w;
      box.h = h;
    }
    const rowW = rowBoxes.length * w + (rowBoxes.length - 1) * SIB_GAP;
    width = Math.max(width, rowW);
    placed.push(rowBoxes);
    for (const box of rowBoxes) box.y = y;
    y += h + ROW_GAP;
  }
  placed.forEach((rowBoxes) => {
    const rowW = rowBoxes.length * rowBoxes[0]!.w + (rowBoxes.length - 1) * SIB_GAP;
    let x = (width - rowW) / 2;
    for (const box of rowBoxes) {
      box.x = x;
      boxes.set(box.id, box);
      x += box.w + SIB_GAP;
    }
  });
  const height = Math.max(0, y - ROW_GAP);
  return { boxes: [...boxes.values()], width, height };
}

function finishScene(boxes: Box[], kickers: Kicker[], edges: EdgeRec[]): Scene {
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;
  const consider = (x: number, y: number, w = 0, h = 0) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  };
  for (const box of boxes) consider(box.x, box.y, box.w, box.h);
  for (const kicker of kickers) consider(kicker.x, kicker.y, textWidth(kicker.text), 16);
  const dx = PAGE_PAD - minX;
  const dy = PAGE_PAD - minY;
  for (const box of boxes) {
    box.x += dx;
    box.y += dy;
  }
  for (const kicker of kickers) {
    kicker.x += dx;
    kicker.y += dy;
  }
  return {
    boxes,
    kickers,
    edges,
    width: Math.ceil(maxX - minX + PAGE_PAD * 2),
    height: Math.ceil(maxY - minY + PAGE_PAD * 2),
  };
}

function layoutGraph(graph: Graph): Scene {
  if (hasSubgraphs(graph)) return layoutColumns(graph);
  const ids = [...graph.nodes.keys()];
  const components = connectedComponents(ids, graph.edges);
  const scenes = components.map((comp, index) =>
    layoutRanks(graph, comp, index > 0 && isChain(comp, graph.edges)),
  );
  let y = 0;
  const boxes: Box[] = [];
  let width = 0;
  for (const scene of scenes) width = Math.max(width, scene.width);
  for (const scene of scenes) {
    const dx = (width - scene.width) / 2;
    for (const box of scene.boxes) {
      box.x += dx;
      box.y += y;
      boxes.push(box);
    }
    y += scene.height + 36;
  }
  return finishScene(boxes, [], graph.edges);
}

function route(a: Box, b: Box): string {
  const acx = a.x + a.w / 2;
  const acy = a.y + a.h / 2;
  const bcx = b.x + b.w / 2;
  const bcy = b.y + b.h / 2;
  const dx = bcx - acx;
  const dy = bcy - acy;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const x1 = dx >= 0 ? a.x + a.w : a.x;
    const x2 = dx >= 0 ? b.x : b.x + b.w;
    const y1 = acy;
    const y2 = bcy;
    if (Math.abs(y1 - y2) < 2) return `M ${n(x1)} ${n(y1)} H ${n(x2)}`;
    const mid = (x1 + x2) / 2;
    return `M ${n(x1)} ${n(y1)} H ${n(mid)} V ${n(y2)} H ${n(x2)}`;
  }
  const y1 = dy >= 0 ? a.y + a.h : a.y;
  const y2 = dy >= 0 ? b.y : b.y + b.h;
  if (Math.abs(acx - bcx) < 2) return `M ${n(acx)} ${n(y1)} V ${n(y2)}`;
  const mid = (y1 + y2) / 2;
  return `M ${n(acx)} ${n(y1)} V ${n(mid)} H ${n(bcx)} V ${n(y2)}`;
}

function n(value: number): string {
  return String(Math.round(value * 10) / 10);
}

function edgeMarkup(scene: Scene, marker: string): string {
  const byId = new Map(scene.boxes.map((box) => [box.id, box]));
  const used = new Set<number>();
  const parts: string[] = [];

  const grouped = new Map<string, EdgeRec[]>();
  for (const edge of scene.edges) {
    const list = grouped.get(edge.from) ?? [];
    list.push(edge);
    grouped.set(edge.from, list);
  }

  for (const [from, edges] of grouped) {
    const source = byId.get(from);
    if (!source) continue;
    const targets = edges
      .map((edge) => ({ edge, box: byId.get(edge.to) }))
      .filter((item): item is { edge: EdgeRec; box: Box } => Boolean(item.box));
    const fan =
      targets.length >= 2 &&
      targets.every(
        (item) =>
          !item.edge.dashed &&
          !item.edge.label &&
          item.box.y >= source.y + source.h - 1 &&
          Math.abs(item.box.y - targets[0]!.box.y) < 2,
      );
    if (fan) {
      const busY = source.y + source.h + (targets[0]!.box.y - (source.y + source.h)) * 0.55;
      const xs = [source.x + source.w / 2, ...targets.map((item) => item.box.x + item.box.w / 2)];
      const left = Math.min(...xs);
      const right = Math.max(...xs);
      parts.push(
        `<path class="learn-flow-edge" d="M ${n(source.x + source.w / 2)} ${n(source.y + source.h)} V ${n(busY)} H ${n(left)} H ${n(right)}" />`,
      );
      for (const item of targets) {
        const x = item.box.x + item.box.w / 2;
        parts.push(
          `<path class="learn-flow-edge" d="M ${n(x)} ${n(busY)} V ${n(item.box.y)}" marker-end="url(#${marker})" />`,
        );
        used.add(scene.edges.indexOf(item.edge));
      }
    }
  }

  scene.edges.forEach((edge, index) => {
    if (used.has(index)) return;
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) return;
    const klass = edge.dashed ? "learn-flow-edge is-dashed" : "learn-flow-edge";
    parts.push(`<path class="${klass}" d="${route(from, to)}" marker-end="url(#${marker})" />`);
    if (edge.label) {
      const x = (from.x + from.w / 2 + to.x + to.w / 2) / 2;
      const y = (from.y + from.h / 2 + to.y + to.h / 2) / 2 - 6;
      parts.push(
        `<text class="learn-flow-edge-label" x="${n(x)}" y="${n(y)}" text-anchor="middle">${xml(edge.label)}</text>`,
      );
    }
  });
  return parts.join("");
}

function boxMarkup(box: Box): string {
  const block = box.lines.length * LINE;
  let y = box.y + (box.h - block) / 2 + LINE / 2;
  const x = box.x + box.w / 2;
  const lines = box.lines
    .map((line) => {
      const tsp = `<tspan x="${n(x)}" y="${n(y)}">${xml(line)}</tspan>`;
      y += LINE;
      return tsp;
    })
    .join("");
  return (
    `<rect class="learn-flow-node" x="${n(box.x)}" y="${n(box.y)}" width="${n(box.w)}" height="${n(box.h)}" rx="8" />` +
    `<text class="learn-flow-label" text-anchor="middle">${lines}</text>`
  );
}

export function mermaidFlowToSvg(source: string, idBase = "flow"): string | null {
  const graph = parseFlowClean(source);
  if (!graph) return null;
  const scene = layoutGraph(graph);
  if (scene.boxes.length === 0) return null;
  const marker = `learn-flow-marker-${idBase}`;
  const titleId = `learn-flow-title-${idBase}`;
  const label =
    graph.caption ||
    scene.boxes
      .map((box) => box.lines.join(" "))
      .join(", ");
  const kickers = scene.kickers
    .map(
      (kicker) =>
        `<text class="learn-flow-kicker" x="${n(kicker.x)}" y="${n(kicker.y + 12)}">${xml(kicker.text)}</text>`,
    )
    .join("");
  return (
    `<figure class="learn-flow">` +
    `<svg role="img" aria-labelledby="${titleId}" width="${scene.width}" height="${scene.height}" viewBox="0 0 ${scene.width} ${scene.height}" xmlns="http://www.w3.org/2000/svg">` +
    `<title id="${titleId}">${xml(label)}</title>` +
    `<defs><marker id="${marker}" viewBox="0 0 10 10" markerWidth="7" markerHeight="7" refX="9" refY="5" orient="auto">` +
    `<path d="M 0 0 L 10 5 L 0 10 z" class="learn-flow-arrow" /></marker></defs>` +
    kickers +
    scene.boxes.map(boxMarkup).join("") +
    edgeMarkup(scene, marker) +
    `</svg></figure>`
  );
}
