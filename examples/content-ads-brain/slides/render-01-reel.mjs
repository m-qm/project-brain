#!/usr/bin/env node
/**
 * Faceless 9:16 Reel from type only. Needs ImageMagick `magick` and ffmpeg.
 * Does not call Instagram. Does not add a face, voice, or stock b-roll.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "out");
const framesDir = join(outDir, "frames");
const FONT = "/System/Library/Fonts/Supplemental/Georgia.ttf";
const FONT_I = "/System/Library/Fonts/Supplemental/Georgia Italic.ttf";
const FONT_SANS = "/System/Library/Fonts/Supplemental/Arial.ttf";

const BEATS = [
  {
    file: "01.png",
    duration: 1.15,
    kicker: "01 / 07",
    title: "Your agent invented\nthe price.",
    italic: true,
    sub: "",
    hideFooter: true,
  },
  {
    file: "02.png",
    duration: 1.65,
    kicker: "02 / 07",
    title: "Fluent is not true.",
    sub: "If the offer is not in git, the model makes one up.",
  },
  {
    file: "03.png",
    duration: 1.65,
    kicker: "03 / 07",
    title: "Skills say what it can do.",
    sub: "MCP and prompts are capability. They are not memory.",
  },
  {
    file: "04.png",
    duration: 1.7,
    kicker: "04 / 07",
    title: "The brain says what is true.",
    sub: "brain/facts/project.md",
  },
  {
    file: "05.png",
    duration: 1.7,
    kicker: "05 / 07",
    title: "Approve, then publish.",
    sub: "pending  →  approved  →  live",
  },
  {
    file: "06.png",
    duration: 2.1,
    kicker: "06 / 07",
    title: "Workers that read the brain.",
    sub: "Ads only on winners. You approve.",
  },
  {
    file: "07.png",
    duration: 1.6,
    kicker: "07 / 07",
    title: "Your agent invented\nthe price.",
    italic: true,
    sub: "agentkbase.com/company-brain",
  },
];

function run(cmd, args) {
  const res = spawnSync(cmd, args, { encoding: "utf8" });
  if (res.status !== 0) {
    throw new Error(`${cmd} failed: ${res.stderr || res.stdout}`);
  }
}

function frame(beat) {
  const dest = join(framesDir, beat.file);
  const titleFont = beat.italic ? FONT_I : FONT;
  run("magick", [
    "-size",
    "1080x1920",
    "xc:#161618",
    "-fill",
    "#a1a1aa",
    "-font",
    FONT_SANS,
    "-pointsize",
    "26",
    "-gravity",
    "northwest",
    "-annotate",
    "+80+96",
    "AGENT KBASE",
    "-gravity",
    "northeast",
    "-annotate",
    "+80+96",
    beat.kicker,
    "-fill",
    "#fafafa",
    "-font",
    titleFont,
    "-pointsize",
    beat.title.includes("\n") ? "92" : beat.title.length > 28 ? "72" : "84",
    "-gravity",
    "center",
    "-annotate",
    "+0-80",
    beat.title,
    "-fill",
    "#a1a1aa",
    "-font",
    FONT_SANS,
    "-pointsize",
    "30",
    "-gravity",
    "center",
    "-annotate",
    "+0+220",
    beat.sub,
    dest,
  ]);
  if (!beat.hideFooter) {
    run("magick", [
      dest,
      "-fill",
      "#71717a",
      "-font",
      FONT_SANS,
      "-pointsize",
      "22",
      "-gravity",
      "south",
      "-annotate",
      "+0+80",
      "Not a promise of reach",
      dest,
    ]);
  }
}

await mkdir(framesDir, { recursive: true });
for (const beat of BEATS) frame(beat);

const concat = BEATS.flatMap((b) => [`file '${join(framesDir, b.file)}'`, `duration ${b.duration}`]);
concat.push(`file '${join(framesDir, BEATS[BEATS.length - 1].file)}'`);
const listPath = join(framesDir, "concat.txt");
await writeFile(listPath, `${concat.join("\n")}\n`);

const mp4 = join(outDir, "ig-d01.mp4");
run("ffmpeg", [
  "-y",
  "-f",
  "concat",
  "-safe",
  "0",
  "-i",
  listPath,
  "-vf",
  "fps=30,format=yuv420p",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
  "-an",
  mp4,
]);

const total = BEATS.reduce((s, b) => s + b.duration, 0);
console.log(`Wrote ${mp4} (${total.toFixed(1)}s, 1080x1920, silent, hard cuts)`);
