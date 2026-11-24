import assert from "node:assert/strict";
import { test } from "node:test";
import {
  sanitizeExtractSuggestion,
  synthesizeBrainFromPage,
} from "../dist/synthesize-from-page.js";

test("mission follows meta description, not invoice template", () => {
  const out = synthesizeBrainFromPage({
    lang: "en",
    sourceUrl: "https://agentkbase.com",
    title: "Agent KBase · The Knowledge Layer Every Agent Reads",
    siteName: "Agent KBase",
    metaDescription:
      "Agent KBase is the knowledge layer for a studio or a small consultancy. Paste your site, correct the draft, and every agent reads the same base.",
    h1: ["The knowledge layer every agent reads."],
    h2: [],
    h3: [],
    paragraphs: [
      "For a studio or a small consultancy. Paste your site. Correct the draft until you recognise what you sell.",
      "Upload invoices, get a fixed scope report and three prioritized actions within 48 hours.",
    ],
    listItems: [],
  });
  assert.match(out.projectMission, /knowledge layer/i);
  assert.doesNotMatch(out.projectMission, /control AI tool spend before renewals/i);
  assert.doesNotMatch(out.projectMission, /from invoices and an optional member export/i);
});

test("invoice workflow sites use page copy, not a generic boilerplate mission", () => {
  const out = synthesizeBrainFromPage({
    lang: "en",
    sourceUrl: "https://example.com",
    title: "Spend audit",
    metaDescription: "Control AI tool spend before renewals from your invoices.",
    h1: ["Stop renewing AI tools blind"],
    h2: [],
    h3: [],
    paragraphs: [
      "We read the period invoice and match each person to tools. Optional member export. We never log into vendor accounts.",
    ],
    listItems: [],
  });
  assert.match(out.projectMission, /control AI tool spend before renewals/i);
  assert.match(out.projectMission, /invoice/i);
});

test("sanitize strips LLM-style Hatchpad mission for unrelated sites", () => {
  const signals = {
    lang: "en",
    sourceUrl: "https://google.com",
    title: "Google",
    metaDescription: "Search the world's information.",
    h1: [],
    h2: [],
    h3: [],
    paragraphs: [],
    listItems: [],
  };
  const toxic = {
    projectName: "Google",
    projectMission:
      "Google helps teams control AI tool spend before renewals, from invoices and an optional member export, without logging into vendor accounts.",
    projectDescription:
      "Google helps teams control AI tool spend before renewals, from invoices and an optional member export, without logging into vendor accounts.",
  };
  const clean = sanitizeExtractSuggestion(signals, toxic);
  assert.doesNotMatch(clean.projectMission, /AI tool spend before renewals/i);
  assert.match(clean.projectMission, /Search the world's information/i);
});

test("auditamia-style pages keep mission short; sample and method go to facts", () => {
  const out = synthesizeBrainFromPage({
    lang: "es",
    sourceUrl: "https://auditamia.com/es",
    title: "Auditamia · Informe 99 € en 48 h",
    metaDescription:
      "Auditoría de gasto en herramientas antes de renovar. Sin entrar en cuentas de proveedores.",
    h1: ["Controla el gasto en IA antes de renovar"],
    h2: [],
    h3: [],
    paragraphs: [
      "Primero ves una muestra Hatchpad ficticia; después pides el informe real.",
      "Leemos la factura del periodo y, cuando llega, el export de miembros.",
      "Nunca entramos en tus cuentas de proveedor.",
    ],
    listItems: [],
  });
  assert.doesNotMatch(out.projectMission, /;/);
  assert.doesNotMatch(out.projectMission, /hatchpad/i);
  assert.doesNotMatch(out.projectMission, /leemos la factura/i);
  const facts = (out.factBullets ?? []).join("\n");
  assert.match(facts, /muestra|hatchpad|sample/i);
  assert.ok(
    (out.openQuestions ?? []).some((q) => /fictici|muestra|sample/i.test(q)),
    "expected sample vs live open question",
  );
});

test("Spanish pages without invoice-audit copy avoid Hatchpad mission boilerplate", () => {
  const out = synthesizeBrainFromPage({
    lang: "es",
    sourceUrl: "https://www.google.com/intl/es/",
    title: "Google",
    h1: [],
    h2: [],
    h3: [],
    paragraphs: [],
    listItems: [],
  });
  assert.doesNotMatch(out.projectMission, /controlar el gasto en herramientas de ia/i);
  assert.doesNotMatch(out.projectMission, /facturas y export opcional/i);
});
