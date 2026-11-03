export type LearnDoc = {
  slug: string;
  title: string;
  description: string;
  section: "Start" | "Structure" | "Integrate" | "Advanced";
  minutes: number;
};

export const LEARN_DOCS: LearnDoc[] = [
  {
    slug: "12-what-you-sell",
    title: "The knowledge layer every agent reads",
    description:
      "Five steps for a studio or small consultancy: a draft from your URL that every agent must read before anything goes live.",
    section: "Start",
    minutes: 12,
  },
  {
    slug: "01-first-brain",
    title: "First brain in 15 minutes",
    description: "Setup CLI, validate, and export your first agent knowledge base.",
    section: "Start",
    minutes: 15,
  },
  {
    slug: "07-extract-from-website",
    title: "Extract from website",
    description: "Draft facts from a public URL, then review before export.",
    section: "Start",
    minutes: 10,
  },
  {
    slug: "02-facts-vs-stories",
    title: "Facts vs stories",
    description: "What belongs in ground truth vs narrative for agents.",
    section: "Structure",
    minutes: 8,
  },
  {
    slug: "03-open-questions",
    title: "Open questions",
    description: "Mark what the model must not guess with [CONFIRM].",
    section: "Structure",
    minutes: 6,
  },
  {
    slug: "04-import-skills-skilltree",
    title: "SkillTree import",
    description: "Pair skills (how) with brain/ (what is true).",
    section: "Integrate",
    minutes: 10,
  },
  {
    slug: "05-engram",
    title: "Engram + brain",
    description: "Parallel layers: git truth and cross session memory.",
    section: "Integrate",
    minutes: 12,
  },
  {
    slug: "06-application-mode",
    title: "Application mode",
    description: "Using a brain while applying to roles or client work.",
    section: "Integrate",
    minutes: 8,
  },
  {
    slug: "08-multi-page-extract",
    title: "Multi-page extract",
    description: "Scan related pages on the same site for richer drafts.",
    section: "Integrate",
    minutes: 8,
  },
  {
    slug: "09-guided-gap-filling",
    title: "Guided gap filling",
    description: "Suggest draft answers for open questions; you approve before export.",
    section: "Integrate",
    minutes: 8,
  },
  {
    slug: "10-mcp",
    title: "Agent KBase MCP",
    description: "Read-only MCP tools for brief, validate, and search brain/.",
    section: "Integrate",
    minutes: 10,
  },
  {
    slug: "11-content-ads-workers",
    title: "Content and ads workers",
    description: "Paid Act layer: WhatsApp HITL, Instagram after approve, ads from winners. MCP stays read-only.",
    section: "Integrate",
    minutes: 8,
  },
  {
    slug: "advanced/eval-and-routing",
    title: "Eval and routing",
    description: "Validation gates and routing patterns for agent tasks.",
    section: "Advanced",
    minutes: 20,
  },
];

export const LEARN_SECTIONS: LearnDoc["section"][] = [
  "Start",
  "Structure",
  "Integrate",
  "Advanced",
];

const LEARN_ES: Record<string, { title: string; description: string }> = {
  "12-what-you-sell": {
    title: "La capa de conocimiento que lee cada agente",
    description:
      "Cinco pasos para un estudio o una consultoría pequeña: un borrador desde tu URL que cada agente debe leer antes de que nada salga.",
  },
  "01-first-brain": {
    title: "El primer brain en 15 minutos",
    description: "Configura la CLI, valida y exporta tu primera base de conocimiento para agentes.",
  },
  "07-extract-from-website": {
    title: "Extraer desde la web",
    description: "Redacta hechos desde una URL pública y revísalos antes de exportar.",
  },
  "02-facts-vs-stories": {
    title: "Hechos frente a historias",
    description: "Qué va en la verdad de base y qué va en la narrativa para los agentes.",
  },
  "03-open-questions": {
    title: "Preguntas abiertas",
    description: "Marca lo que el modelo no debe adivinar con [CONFIRM].",
  },
  "04-import-skills-skilltree": {
    title: "Importar SkillTree",
    description: "Empareja las skills (el cómo) con brain/ (qué es verdad).",
  },
  "05-engram": {
    title: "Engram + brain",
    description: "Capas en paralelo: la verdad en git y la memoria entre sesiones.",
  },
  "06-application-mode": {
    title: "Modo aplicación",
    description: "Usar un brain al presentarte a un puesto o a un trabajo de cliente.",
  },
  "08-multi-page-extract": {
    title: "Extracción de varias páginas",
    description: "Lee páginas relacionadas del mismo sitio para un borrador más rico.",
  },
  "09-guided-gap-filling": {
    title: "Relleno guiado de huecos",
    description: "Sugiere respuestas en borrador para las preguntas abiertas; tú apruebas antes de exportar.",
  },
  "10-mcp": {
    title: "MCP de Agent KBase",
    description: "Herramientas MCP de solo lectura para brief, validate y buscar en brain/.",
  },
  "11-content-ads-workers": {
    title: "Workers de contenido y anuncios",
    description:
      "Capa Act de pago: HITL por WhatsApp, Instagram tras aprobar, anuncios desde lo que ya funcionó. El MCP sigue en solo lectura.",
  },
  "advanced/eval-and-routing": {
    title: "Evaluación y enrutado",
    description: "Puertas de validación y patrones de enrutado para tareas de agentes.",
  },
};

export const LEARN_SECTION_ES: Record<LearnDoc["section"], string> = {
  Start: "Empezar",
  Structure: "Estructura",
  Integrate: "Integrar",
  Advanced: "Avanzado",
};

export function learnText(doc: LearnDoc, locale: string): LearnDoc {
  if (locale !== "es") return doc;
  const copy = LEARN_ES[doc.slug];
  return copy ? { ...doc, ...copy } : doc;
}
