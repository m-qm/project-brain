import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  buildClaimsIndex,
  parseClaimsFromMarkdown,
  searchBrainWithClaims,
  searchClaims,
} from "../dist/claims.js";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

test("parseClaims marks CONFIRM and sections", () => {
  const md = `# Facts

## Ground truth

* Price: on request
* [CONFIRM] SLA not set
`;
  const claims = parseClaimsFromMarkdown("brain/facts/project.md", md);
  assert.equal(claims.length, 2);
  assert.equal(claims[0].status, "confirmed");
  assert.equal(claims[1].status, "confirm");
  assert.equal(claims[0].section, "Ground truth");
});

test("buildClaimsIndex on monorepo brain", async () => {
  const claims = await buildClaimsIndex(repoRoot);
  assert.ok(claims.length > 5);
  assert.ok(claims.some((c) => c.path === "brain/facts/project.md"));
  assert.ok(claims.some((c) => c.status === "confirm"));
});

test("searchClaims prefers facts matches", () => {
  const claims = [
    {
      text: "Remote MCP on /mcp",
      path: "brain/facts/distribution.md",
      line: 10,
      status: "confirmed",
      section: "Remote",
    },
    {
      text: "Remote MCP mentioned in learn",
      path: "brain/stories/learn/en/14-claude-mcp.md",
      line: 5,
      status: "confirmed",
      section: "",
    },
  ];
  const hits = searchClaims(claims, "remote mcp");
  assert.ok(hits[0].path.includes("facts/"));
});

test("searchBrainWithClaims returns claims and hits", async () => {
  const result = await searchBrainWithClaims(repoRoot, "OAuth");
  assert.match(result.query, /OAuth/i);
  assert.ok(result.claims.length >= 1 || result.hits.length >= 1);
});
