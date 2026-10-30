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

export function learnMarkdownToHtml(md: string): string {
  const lines = md.split("\n");
  let inCode = false;
  let codeLang = "command";
  const codeLines: string[] = [];
  const out: string[] = [];
  let listType: "ul" | "ol" | null = null;

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
    out.push(
      `<div class="learn-code-block">` +
        `<div class="learn-code-label">${escape(codeLang)}</div>` +
        `<pre class="learn-code"><code>${body}</code></pre>` +
        `</div>`,
    );
  };

  for (const line of lines) {
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
      codeLines.push(escape(line));
      continue;
    }

    if (line.startsWith("# ")) {
      flushList();
      out.push(`<h1 class="learn-doc-h1">${escape(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      out.push(`<h2 class="learn-doc-h2">${escape(line.slice(3))}</h2>`);
      continue;
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
    out.push(`<p class="learn-p">${inlineMd(escape(line))}</p>`);
  }

  flushList();
  if (inCode) flushCode();

  return out.join("\n");
}
