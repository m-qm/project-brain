import assert from "node:assert/strict";
import { test } from "node:test";
import { discoverSameOriginLinks } from "../dist/discover-same-origin-links.js";
import { mergePageSignals } from "../dist/merge-page-signals.js";

const seed = "https://example.com/";

test("discovers same-origin about/pricing links", () => {
  const html = `
    <html><body>
      <a href="/about">About</a>
      <a href="https://example.com/pricing">Pricing</a>
      <a href="https://other.com/x">External</a>
    </body></html>
  `;
  const links = discoverSameOriginLinks(seed, html);
  assert.ok(links.some((u) => u.includes("/about")));
  assert.ok(links.some((u) => u.includes("/pricing")));
  assert.ok(!links.some((u) => u.includes("other.com")));
});

test("mergePageSignals dedupes headings", () => {
  const merged = mergePageSignals([
    {
      lang: "en",
      sourceUrl: seed,
      h1: ["Alpha"],
      h2: ["Beta"],
      h3: [],
      paragraphs: ["One"],
      listItems: [],
    },
    {
      lang: "en",
      sourceUrl: `${seed}about`,
      h1: ["Alpha"],
      h2: ["Gamma"],
      h3: [],
      paragraphs: ["Two"],
      listItems: [],
    },
  ]);
  assert.equal(merged.h1.length, 1);
  assert.equal(merged.h2.length, 2);
  assert.equal(merged.paragraphs.length, 2);
});
