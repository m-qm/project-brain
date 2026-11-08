import type { BrainInput } from "./types.js";
import type { PageSignals } from "./extract-page-signals.js";
import { toThirdPersonEn, toThirdPersonEs } from "./agent-voice.js";
import { isMostlyContained, splitSentences, uniqueSentences } from "./text-dedupe.js";

function brandName(signals: PageSignals): string {
  if (signals.siteName) {
    return signals.siteName.charAt(0).toUpperCase() + signals.siteName.slice(1);
  }
  const t = signals.title ?? "";
  const afterDot = t.split("·").pop()?.trim();
  if (afterDot && afterDot.length < 40) return afterDot;
  try {
    const host = new URL(signals.sourceUrl).hostname.replace(/^www\./, "");
    return host.split(".")[0].charAt(0).toUpperCase() + host.split(".")[0].slice(1);
  } catch {
    return "Project";
  }
}

function normalizeSpaces(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function firstSentence(text: string): string {
  const m = text.match(/^[^.!?]+[.!?]/);
  return (m ? m[0] : text).trim();
}

function heroBody(signals: PageSignals): string | undefined {
  const h1 = signals.h1[0]?.trim();
  const p = signals.paragraphs[0]?.trim();
  if (!p) return undefined;
  if (h1 && p.startsWith(h1)) return p.slice(h1.length).trim().replace(/^[.:]\s*/, "");
  return p;
}

function missionFromTitle(title?: string): string | undefined {
  if (!title) return undefined;
  const beforeDot = title.split("·")[0]?.trim();
  if (beforeDot && beforeDot.length > 12 && beforeDot.length < 120) return beforeDot;
  return undefined;
}

function uniqueLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const key = line.toLowerCase().slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

function extractConstraints(text: string): string[] {
  const found: string[] = [];
  const patterns = [
    /sin entrar en[^.]+/gi,
    /no entramos en[^.]+/gi,
    /without access to[^.]+/gi,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) found.push(m[0].trim());
  }
  const deduped: string[] = [];
  for (const line of found) {
    const norm = line.toLowerCase().replace(/no entramos|sin entrar/g, "no-access");
    if (deduped.some((d) => d.toLowerCase().replace(/no entramos|sin entrar/g, "no-access") === norm)) {
      continue;
    }
    deduped.push(line);
  }
  return deduped;
}

function extractSkuLine(text: string): string | undefined {
  const flat = text.replace(/\s+/g, " ");
  const m = flat.match(/\d+\s*€[^.]{0,80}/i);
  return m?.[0]?.trim();
}

function extractDeliverableSentence(hero: string): string | undefined {
  const sentences = splitSentences(hero);
  return sentences.find((s) => /informe|veredict|gasto por herramienta|tres acciones/i.test(s));
}

function extractHypothesisSentence(hero: string): string | undefined {
  return splitSentences(hero).find((s) => /hipótesis|hypothesis|sin export/i.test(s));
}

function paragraphMatching(signals: PageSignals, re: RegExp): string | undefined {
  return signals.paragraphs.find((p) => re.test(p));
}

function looksLikeSkuTagline(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.length < 90 &&
    (/\d+\s*€|€\s*\d+|\$\d+/.test(t) || /\b48\s*h|\b48 hours|\breport in\b/.test(t))
  );
}

/** Title tagline before "·" — often too short to be the full company mission. */
function titleNeedsExpansion(titleMission: string | undefined): boolean {
  if (!titleMission) return true;
  if (looksLikeSkuTagline(titleMission)) return true;
  const words = titleMission.split(/\s+/).length;
  return words <= 8;
}

function pageCorpus(signals: PageSignals): string {
  return [signals.metaDescription ?? "", ...signals.h1, ...signals.paragraphs.slice(0, 8)].join(
    "\n",
  );
}

function mentionsInvoiceWorkflow(corpus: string): boolean {
  return (
    /invoice|facturas/i.test(corpus) &&
    (/member export|export de miembros|gasto en herramientas|AI tool spend|renovar contratos|before renewals/i.test(
      corpus,
    ) ||
      /classify spend|leemos la factura|read the period invoice/i.test(corpus))
  );
}

function missionLead(brand: string, signals: PageSignals): string {
  const isEs = signals.lang === "es";
  const titleMission = missionFromTitle(signals.title);
  const meta = signals.metaDescription?.trim();
  if (meta && meta.length >= 20) {
    return firstSentence(meta);
  }
  const titleTail = signals.title?.split("·").pop()?.trim();
  if (titleTail && titleTail.length >= 12 && !looksLikeSkuTagline(titleTail)) {
    return `${brand}: ${titleTail}.`;
  }
  if (titleMission && !titleNeedsExpansion(titleMission)) {
    return `${brand}: ${titleMission}.`;
  }
  const h1 = signals.h1[0]?.replace(/^[¿?]+|[?]+$/g, "").trim();
  if (h1) {
    return isEs ? `${brand}: ${h1}.` : `${brand}: ${h1}.`;
  }
  return `${brand} (confirm mission from the live site).`;
}

function buildMission(brand: string, signals: PageSignals): string {
  const isEs = signals.lang === "es";
  const corpus = pageCorpus(signals);
  const privacyFromMeta =
    signals.metaDescription?.match(/never log[^.]+/i)?.[0] ??
    signals.metaDescription?.match(/no accedemos[^.]+/i)?.[0];
  const privacyFromBody = paragraphMatching(
    signals,
    /do not log into|never log into|sin acceder|no entramos en cuentas/i,
  );
  const privacy = privacyFromMeta
    ? firstSentence(privacyFromMeta)
    : privacyFromBody
      ? firstSentence(privacyFromBody)
      : undefined;

  const processHint = paragraphMatching(
    signals,
    /sample|muestra|hatchpad|first you see|primero ves/i,
  );
  const methodHint = paragraphMatching(
    signals,
    /classify spend|match each person|leemos la factura|read the period invoice/i,
  );

  if (mentionsInvoiceWorkflow(corpus)) {
    const parts = isEs
      ? [
          `${brand} ayuda a equipos a controlar el gasto en herramientas de IA antes de renovar contratos`,
          processHint ? "con un flujo muestra → datos reales → informe" : "",
          /facturas/i.test(corpus) ? "a partir de facturas y export opcional de miembros" : "",
          privacy
            ? `(${privacy.charAt(0).toLowerCase()}${privacy.slice(1).replace(/\.$/, "")})`
            : privacyFromBody || /sin acceder|no entramos/i.test(corpus)
              ? "sin acceder a las cuentas del cliente"
              : "",
        ]
      : [
          `${brand} helps teams control AI tool spend before renewals`,
          processHint
            ? "using a sample-first flow then a report on the customer's figures"
            : "",
          /invoice/i.test(corpus) ? "from invoices and an optional member export" : "",
          privacy
            ? privacy.replace(/\.$/, "").replace(/^never/i, "We never")
            : privacyFromBody || /without access|do not log into/i.test(corpus)
              ? "without logging into vendor accounts"
              : "",
        ];
    const filtered = parts.filter(Boolean);
    if (filtered.length > 1) {
      return `${filtered[0]}, ${filtered.slice(1).join(", ")}.`;
    }
  }

  let mission = missionLead(brand, signals);
  const extras: string[] = [];
  if (processHint) {
    extras.push(firstSentence(processHint));
  }
  if (methodHint) {
    extras.push(firstSentence(methodHint));
  }
  if (privacy) {
    const p = privacy.replace(/\.$/, "");
    extras.push(isEs ? p : p.replace(/^never/i, "We never"));
  }
  if (extras.length === 0) {
    return mission.endsWith(".") ? mission : `${mission}.`;
  }
  mission = mission.replace(/\.$/, "");
  return `${mission} (${extras.join("; ")}).`;
}

export function synthesizeBrainFromPage(signals: PageSignals): Partial<BrainInput> {
  const brand = brandName(signals);
  const isEs = signals.lang === "es";
  const to3p = isEs ? (s: string) => toThirdPersonEs(s, brand) : (s: string) => toThirdPersonEn(s, brand);
  const hero = heroBody(signals);
  const corpus = [
    signals.metaDescription ?? "",
    ...signals.h1,
    ...signals.paragraphs,
  ].join("\n");

  const projectMission = buildMission(brand, signals);
  const constraints = extractConstraints(corpus);
  const sku = extractSkuLine(corpus);
  const deliverableRaw = hero ? extractDeliverableSentence(hero) : undefined;
  const hypothesisRaw = hero ? extractHypothesisSentence(hero) : undefined;

  function customerInputsFact(): string | undefined {
    if (!hero) return undefined;
    if (isEs && /facturas/i.test(hero) && /export/i.test(hero)) {
      return "El cliente envía facturas y, opcionalmente, export de miembros.";
    }
    if (!isEs && /invoice/i.test(hero) && /export/i.test(hero)) {
      return "The customer sends invoices and, optionally, a member export.";
    }
    return to3p(firstSentence(hero));
  }

  const funnel = paragraphMatching(
    signals,
    /first you see|sample|then you try|then you order|muestra|después pides/i,
  );
  const method = paragraphMatching(
    signals,
    /classify spend|match each person|read the period invoice|leemos la factura/i,
  );
  const insight = paragraphMatching(
    signals,
    /savings aren|agents run|overlapping|costs rarely come/i,
  );
  const sampleNote = paragraphMatching(signals, /fictional|ficticio|hatchpad/i);

  const listFacts = signals.listItems
    .filter(
      (li) =>
        !/cookie|privacy policy|terms of/i.test(li) &&
        !/^figures\s*\d|^report\s*\d|^step\s*\d/i.test(li) &&
        !/open form|open the short report/i.test(li),
    )
    .slice(0, 2)
    .map((li) => {
      const cleaned = li.replace(/^(figures|report)\s*\d+\s*/i, "").trim();
      return isEs ? `Detalle (web): ${to3p(cleaned)}` : `Site detail: ${to3p(cleaned)}`;
    });

  const factBullets = uniqueLines(
    [
      signals.h1[0]
        ? isEs
          ? `Problema (público): ${signals.h1[0]}`
          : `Public problem: ${signals.h1[0]}`
        : "",
      (() => {
        const inputs = customerInputsFact();
        if (!inputs) return "";
        return isEs ? `Entradas del cliente: ${inputs}` : `Customer inputs: ${inputs}`;
      })(),
      funnel
        ? isEs
          ? `Proceso (web): ${to3p(funnel)}`
          : `Process (site): ${to3p(funnel)}`
        : "",
      method
        ? isEs
          ? `Método: ${to3p(method)}`
          : `Method: ${to3p(method)}`
        : "",
      deliverableRaw
        ? isEs
          ? `Entregable: ${to3p(deliverableRaw)}`
          : `Deliverable: ${to3p(deliverableRaw)}`
        : "",
      hypothesisRaw
        ? isEs
          ? `Datos: ${to3p(hypothesisRaw)}`
          : `Data rule: ${to3p(hypothesisRaw)}`
        : "",
      insight
        ? isEs
          ? `Por qué importa: ${to3p(firstSentence(insight))}`
          : `Why it matters: ${to3p(firstSentence(insight))}`
        : "",
      sampleNote
        ? isEs
          ? `Muestra: ${to3p(firstSentence(sampleNote))}`
          : `Sample: ${to3p(firstSentence(sampleNote))}`
        : "",
      ...constraints.map((x) =>
        isEs ? `Privacidad: ${to3p(x)}` : `Privacy: ${to3p(x)}`,
      ),
      sku
        ? isEs
          ? `Oferta visible en web: ${sku}`
          : `Visible offer on site: ${sku}`
        : "",
      ...listFacts,
      `Source: ${signals.sourceUrl}`,
    ].filter(Boolean),
  ).slice(0, 12);

  const storyProblem =
    signals.h1[0] ??
    (signals.metaDescription ? firstSentence(signals.metaDescription) : undefined) ??
    (isEs
      ? "Confirmar el problema público desde la web."
      : "Confirm the public problem from the site.");

  const storyBlocks = [
    funnel,
    method,
    deliverableRaw ? to3p(deliverableRaw) : "",
    sampleNote ? to3p(firstSentence(sampleNote)) : "",
  ].filter((b): b is string => Boolean(b));

  const storyFlow = uniqueSentences(
    storyBlocks.flatMap((block) => splitSentences(block)),
  ).filter((s) => !isMostlyContained(s, projectMission));

  const storyBuilt =
    storyFlow.slice(0, 4).join(" ").slice(0, 520) ||
    uniqueSentences(
      (hero ? splitSentences(hero).map((s) => to3p(s)) : []).filter(
        (s) => !isMostlyContained(s, projectMission),
      ),
    )
      .slice(0, 3)
      .join(" ")
      .slice(0, 480);

  const invoiceWorkflow = mentionsInvoiceWorkflow(corpus);
  const openQuestions = isEs
    ? [
        sampleNote
          ? "¿Qué partes de la muestra pública son ficticias vs replicables con datos reales?"
          : "¿Hay demo o muestra pública antes de comprar?",
        ...(invoiceWorkflow
          ? ["¿Qué campos del export de miembros son obligatorios vs opcionales?"]
          : ["¿Qué ofertas y precios públicos requieren confirmación antes de citarlos?"]),
        "¿Qué frases de marketing no deben citarse como garantía?",
        "¿Qué skills de Cursor/SkillTree debe cargar el agente (este extract no genera skills)?",
      ]
    : [
        sampleNote
          ? "Which parts of the public sample are fictional vs reproducible with real customer data?"
          : "Is there a public sample before purchase?",
        ...(invoiceWorkflow
          ? ["Which member-export fields are required vs optional?"]
          : ["Which public offers and prices need confirmation before quoting?"]),
        "Which marketing lines must not be quoted as guarantees?",
        "Which Cursor/SkillTree skills should agents load (extract does not create skills)?",
      ];

  return {
    projectName: brand,
    projectMission,
    projectDescription: projectMission,
    factBullets,
    storyTitle: isEs ? "Flujo de entrega" : "Delivery flow",
    storyProblem: firstSentence(storyProblem),
    storyBuilt: storyBuilt || projectMission,
    storyProof: isEs
      ? "Basado en HTML público de la landing (oct 2026). Validar con el fundador antes de uso comercial o legal."
      : "Based on public landing HTML. Validate with the founder before commercial or legal use.",
    openQuestions,
  };
}
