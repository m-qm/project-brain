import { mermaidFlowToSvg } from "./learn-flow";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inlineMd(s: string): string {
  return s
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function isTableRow(line: string): boolean {
  const t = line.trim();
  return t.startsWith("|") && t.endsWith("|");
}

function parseTableCells(line: string): string[] {
  return line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((c) => c.trim());
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c.replace(/\s/g, "")));
}

type TableParse = { rows: string[][]; nextIndex: number };

function readTable(lines: string[], start: number): TableParse | null {
  if (!isTableRow(lines[start] ?? "")) return null;
  const rows: string[][] = [];
  let i = start;
  while (i < lines.length && isTableRow(lines[i]!)) {
    const cells = parseTableCells(lines[i]!);
    if (rows.length === 1 && isSeparatorRow(cells)) {
      i++;
      continue;
    }
    rows.push(cells);
    i++;
  }
  if (rows.length === 0) return null;
  return { rows, nextIndex: i };
}

function renderMentalModelTable(rows: string[][]): string {
  const [header, ...body] = rows;
  const headA = header?.[0]?.toLowerCase() ?? "";
  const headB = header?.[1]?.toLowerCase() ?? "";
  const isLayerTable =
    header?.length === 2 &&
    (headA === "layer" || headA === "capa") &&
    (headB === "where" || headB === "dónde" || headB === "donde");

  if (!isLayerTable) {
    return renderGenericTable(rows);
  }

  const title = headA === "capa" ? "Modelo mental" : "Mental model";

  const items = body
    .map(
      (cells) =>
        `<li class="learn-mental-model-row">` +
        `<span class="learn-mental-model-layer">${inlineMd(escape(cells[0] ?? ""))}</span>` +
        `<span class="learn-mental-model-where">${inlineMd(escape(cells[1] ?? ""))}</span>` +
        `</li>`,
    )
    .join("\n");

  return (
    `<div class="learn-mental-model" role="region" aria-label="Agent knowledge layers">` +
    `<p class="learn-mental-model-title">${title}</p>` +
    `<ul class="learn-mental-model-stack">${items}</ul>` +
    `</div>`
  );
}

function renderGenericTable(rows: string[][]): string {
  const [header, ...body] = rows;
  const headHtml =
    header?.map((c) => `<th scope="col">${inlineMd(escape(c))}</th>`).join("") ?? "";
  const bodyHtml = body
    .map(
      (cells) =>
        `<tr>${cells.map((c) => `<td>${inlineMd(escape(c))}</td>`).join("")}</tr>`,
    )
    .join("");
  return (
    `<div class="learn-table-wrap">` +
    `<table class="learn-table"><thead><tr>${headHtml}</tr></thead>` +
    `<tbody>${bodyHtml}</tbody></table></div>`
  );
}

function renderTable(rows: string[][]): string {
  const [header] = rows;
  const isLayerTable =
    header?.length === 2 &&
    header[0]?.toLowerCase() === "layer" &&
    header[1]?.toLowerCase() === "where";
  if (isLayerTable) return renderMentalModelTable(rows);
  return renderGenericTable(rows);
}

export function learnMarkdownToHtml(md: string, options?: { diagrams?: boolean }): string {
  const lines = md.split("\n");
  let inCode = false;
  let codeLang = "command";
  const codeLines: string[] = [];
  const out: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let diagramIndex = 0;

  const flushList = () => {
    if (listType) {
      out.push(listType === "ul" ? "</ul>" : "</ol>");
      listType = null;
    }
  };

  const flushCode = () => {
    if (!inCode) return;
    const body = codeLines.join("\n");
    codeLines.length = 0;
    inCode = false;
    if (options?.diagrams && codeLang.toLowerCase() === "mermaid") {
      const svg = mermaidFlowToSvg(body, `d${diagramIndex++}`);
      if (svg) {
        out.push(svg);
        return;
      }
    }
    out.push(
      `<div class="learn-code-block">` +
        `<div class="learn-code-label">${escape(codeLang)}</div>` +
        `<pre class="learn-code"><code>${escape(body)}</code></pre>` +
        `</div>`,
    );
  };

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]!;
    if (line.startsWith("```")) {
      if (inCode) {
        flushCode();
      } else {
        flushList();
        inCode = true;
        codeLang = line.slice(3).trim() || "command";
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith("# ")) {
      flushList();
      out.push(`<h1 class="learn-doc-h1">${escape(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      const heading = line.slice(3).trim();
      if (heading.toLowerCase() === "mental model") {
        continue;
      }
      out.push(`<h2 class="learn-doc-h2">${escape(heading)}</h2>`);
      continue;
    }
    if (isTableRow(line)) {
      flushList();
      const parsed = readTable(lines, lineIndex);
      if (parsed) {
        out.push(renderTable(parsed.rows));
        lineIndex = parsed.nextIndex - 1;
        continue;
      }
    }
    if (line.startsWith("* ") || line.startsWith("- ")) {
      if (listType !== "ul") {
        flushList();
        out.push('<ul class="learn-list">');
        listType = "ul";
      }
      out.push(`<li>${inlineMd(escape(line.slice(2)))}</li>`);
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      if (listType !== "ol") {
        flushList();
        out.push('<ol class="learn-list">');
        listType = "ol";
      }
      out.push(`<li>${inlineMd(escape(line.replace(/^\d+\.\s/, "")))}</li>`);
      continue;
    }
    if (line.trim() === "") {
      flushList();
      continue;
    }
    flushList();
    const trimmed = line.trim();
    if (/^do not store secrets/i.test(trimmed)) {
      out.push(`<p class="learn-mental-model-note">${inlineMd(escape(trimmed))}</p>`);
      continue;
    }
    out.push(`<p class="learn-p">${inlineMd(escape(line))}</p>`);
  }

  flushList();
  if (inCode) flushCode();

  return out.join("\n");
}
