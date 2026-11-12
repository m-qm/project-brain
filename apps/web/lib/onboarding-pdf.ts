import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import * as wawoff2 from "wawoff2";
import { onboardingGuide, type OnboardingGuide } from "./onboarding-guide";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 40;
const CONTENT_W = PAGE_W - M * 2;
const FOOTER_H = 36;

const ink = rgb(20 / 255, 34 / 255, 28 / 255);
const ink2 = rgb(77 / 255, 94 / 255, 86 / 255);
const ink3 = rgb(94 / 255, 111 / 255, 103 / 255);
const paper = rgb(243 / 255, 246 / 255, 244 / 255);
const white = rgb(1, 1, 1);
const accent = rgb(15 / 255, 92 / 255, 76 / 255);
const accentFg = rgb(244 / 255, 250 / 255, 247 / 255);
type Fonts = {
  regular: PDFFont;
  semibold: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
};

function fontFile(name: string): string {
  const candidates = [
    path.join(process.cwd(), "app/fonts", name),
    path.join(process.cwd(), "apps/web/app/fonts", name),
  ];
  const found = candidates.find((file) => existsSync(file));
  if (!found) throw new Error(`Onboarding guide font missing: ${name}`);
  return found;
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) current = next;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function drawPageChrome(page: PDFPage) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: paper });
  page.drawRectangle({ x: 0, y: PAGE_H - 7, width: PAGE_W, height: 7, color: accent });
}

function drawFooter(page: PDFPage, guide: OnboardingGuide, fonts: Fonts) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: FOOTER_H, color: accent });
  const size = 9;
  const y = 14;
  page.drawText(guide.nextLabel.toUpperCase(), {
    x: M,
    y,
    size,
    font: fonts.semibold,
    color: accentFg,
  });
  const labelW = fonts.semibold.widthOfTextAtSize(guide.nextLabel.toUpperCase(), size);
  page.drawText(guide.nextUrl, {
    x: M + labelW + 10,
    y,
    size: 10,
    font: fonts.semibold,
    color: white,
  });
  const packW = fonts.regular.widthOfTextAtSize(guide.samePack, 8.5);
  page.drawText(guide.samePack, {
    x: PAGE_W - M - packW,
    y,
    size: 8.5,
    font: fonts.regular,
    color: accentFg,
  });
}

/**
 * PDF viewers need TTF. The site ships WOFF2, so decompress before embed.
 * wawoff2 returns a view into WASM memory, so copy it before the next call.
 */
async function decompressWoff2(woff: Uint8Array): Promise<Uint8Array> {
  const mod = wawoff2 as {
    decompress?: (buffer: Uint8Array) => Promise<Uint8Array>;
    default?: { decompress?: (buffer: Uint8Array) => Promise<Uint8Array> };
  };
  const decode = mod.decompress ?? mod.default?.decompress;
  if (!decode) throw new Error("Could not decode the onboarding guide font.");
  return Uint8Array.from(await decode(woff));
}

async function readTTF(name: string): Promise<Uint8Array> {
  const woff = new Uint8Array(await readFile(fontFile(name)));
  return decompressWoff2(woff);
}

async function loadFonts(doc: PDFDocument): Promise<Fonts> {
  const regular = await readTTF("inter-latin-400-normal.woff2");
  const semibold = await readTTF("inter-latin-600-normal.woff2");
  const bold = await readTTF("inter-latin-800-normal.woff2");
  const italic = await readTTF("newsreader-latin-500-italic.woff2");
  doc.registerFontkit(fontkit);
  return {
    regular: await doc.embedFont(regular),
    semibold: await doc.embedFont(semibold),
    bold: await doc.embedFont(bold),
    italic: await doc.embedFont(italic),
  };
}

function paint(
  page: PDFPage,
  guide: OnboardingGuide,
  fonts: Fonts,
): void {
  drawPageChrome(page);
  let y = PAGE_H - 32;

  page.drawText(guide.brand, { x: M, y, size: 8, font: fonts.semibold, color: accent });
  const labelW = fonts.semibold.widthOfTextAtSize(guide.docLabel, 8);
  page.drawText(guide.docLabel, {
    x: PAGE_W - M - labelW,
    y,
    size: 8,
    font: fonts.semibold,
    color: ink3,
  });

  y -= 32;
  page.drawText(guide.title, { x: M, y, size: 26, font: fonts.bold, color: ink });
  y -= 30;
  page.drawText(guide.titleEm, { x: M, y, size: 26, font: fonts.italic, color: ink });

  y -= 22;
  for (const line of wrap(guide.lead, fonts.regular, 10.5, 470)) {
    page.drawText(line, { x: M, y, size: 10.5, font: fonts.regular, color: ink2 });
    y -= 14.5;
  }

  y -= 12;
  page.drawText(guide.stepsHeading, { x: M, y, size: 8, font: fonts.semibold, color: ink3 });
  y -= 16;

  for (const step of guide.steps) {
    const bodyLines = wrap(step.body, fonts.regular, 9.5, CONTENT_W - 32);
    const circleY = y + 3;
    page.drawCircle({ x: M + 8, y: circleY, size: 8, color: accent });
    const numW = fonts.semibold.widthOfTextAtSize(step.n, 8);
    page.drawText(step.n, {
      x: M + 8 - numW / 2,
      y: circleY - 2.8,
      size: 8,
      font: fonts.semibold,
      color: accentFg,
    });
    page.drawText(step.title, { x: M + 24, y, size: 11, font: fonts.semibold, color: ink });
    let lineY = y - 14;
    for (const line of bodyLines) {
      page.drawText(line, { x: M + 24, y: lineY, size: 9.5, font: fonts.regular, color: ink2 });
      lineY -= 12.5;
    }
    y = lineY - 8;
  }

  y -= 4;
  const gap = 14;
  const colW = (CONTENT_W - gap) / 2;
  const leftX = M;
  const rightX = M + colW + gap;

  const folderRows = guide.folder.map((row) => ({
    path: row.path,
    notes: wrap(row.note, fonts.regular, 8.5, colW - 20),
  }));
  const checkRows = guide.checks.map((check) => wrap(check, fonts.regular, 8.5, colW - 28));
  const folderH =
    28 + folderRows.reduce((sum, row) => sum + 12 + row.notes.length * 11 + 6, 0);
  const checksH = 28 + checkRows.reduce((sum, lines) => sum + lines.length * 11 + 7, 0);
  const cardH = Math.max(folderH, checksH);

  const cardTop = y + 8;
  const cardBottom = cardTop - cardH;
  for (const x of [leftX, rightX]) {
    page.drawRectangle({
      x,
      y: cardBottom,
      width: colW,
      height: cardH,
      color: white,
      borderColor: rgb(20 / 255, 34 / 255, 28 / 255),
      borderWidth: 0.6,
      opacity: 1,
      borderOpacity: 0.1,
    });
  }

  let fy = cardTop - 16;
  page.drawText(guide.folderHeading, { x: leftX + 12, y: fy, size: 8, font: fonts.semibold, color: ink3 });
  fy -= 16;
  for (const row of folderRows) {
    page.drawText(row.path, { x: leftX + 12, y: fy, size: 8.5, font: fonts.semibold, color: ink });
    fy -= 11;
    for (const note of row.notes) {
      page.drawText(note, { x: leftX + 12, y: fy, size: 8.5, font: fonts.regular, color: ink2 });
      fy -= 11;
    }
    fy -= 6;
  }

  let cy = cardTop - 16;
  page.drawText(guide.checksHeading, {
    x: rightX + 12,
    y: cy,
    size: 8,
    font: fonts.semibold,
    color: ink3,
  });
  cy -= 16;
    for (const lines of checkRows) {
    page.drawRectangle({
      x: rightX + 12,
      y: cy + 1,
      width: 4,
      height: 4,
      color: accent,
    });
    for (const line of lines) {
      page.drawText(line, {
        x: rightX + 22,
        y: cy,
        size: 8.5,
        font: fonts.regular,
        color: ink2,
      });
      cy -= 11;
    }
    cy -= 6;
  }

  y = cardBottom - 18;
  page.drawText(guide.cliHeading, { x: M, y, size: 8, font: fonts.semibold, color: ink3 });
  y -= 12;

  const longest = guide.cli.reduce((a, b) => (a.length > b.length ? a : b));
  let cliSize = 8.5;
  while (cliSize > 7 && fonts.regular.widthOfTextAtSize(longest, cliSize) > CONTENT_W - 28) {
    cliSize -= 0.25;
  }
  const cliH = 16 + guide.cli.length * (cliSize + 5);
  page.drawRectangle({
    x: M,
    y: y - cliH + 6,
    width: CONTENT_W,
    height: cliH,
    color: ink,
  });
  let cmdY = y - 8;
  for (const command of guide.cli) {
    page.drawText(command, {
      x: M + 14,
      y: cmdY,
      size: cliSize,
      font: fonts.regular,
      color: accentFg,
    });
    cmdY -= cliSize + 5;
  }

  drawFooter(page, guide, fonts);
}

const cache = new Map<string, Uint8Array>();

export async function renderOnboardingPdf(locale: string): Promise<{ bytes: Uint8Array; filename: string }> {
  const guide = onboardingGuide(locale);
  const hit = cache.get(guide.locale);
  if (hit) return { bytes: hit, filename: guide.filename };

  const doc = await PDFDocument.create();
  doc.setTitle(`${guide.title} ${guide.titleEm}`);
  doc.setAuthor("Agent KBase");
  doc.setSubject(guide.lead);
  doc.setCreator("Agent KBase");
  const fonts = await loadFonts(doc);
  const page = doc.addPage([PAGE_W, PAGE_H]);
  paint(page, guide, fonts);
  const bytes = await doc.save();
  cache.set(guide.locale, bytes);
  return { bytes, filename: guide.filename };
}
