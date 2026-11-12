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
    title: "What you can say on your site",
    description:
      "Five steps from your public page. A draft of what you sell, who it is for, and what must stay marked until you confirm it.",
    section: "Start",
    minutes: 12,
  },
  {
    slug: "01-first-brain",
    title: "The first folder in 15 minutes",
    description: "Install the CLI, the program on your computer, then check and export the folder.",
    section: "Start",
    minutes: 15,
  },
  {
    slug: "07-extract-from-website",
    title: "A draft from your page",
    description: "Read a public page into a draft, then correct it before you export.",
    section: "Start",
    minutes: 10,
  },
  {
    slug: "02-facts-vs-stories",
    title: "A fact and a story",
    description: "What is a fact you can stand behind, and what is a story.",
    section: "Structure",
    minutes: 8,
  },
  {
    slug: "03-open-questions",
    title: "What you have not decided",
    description: "Mark what the program must not guess with [CONFIRM].",
    section: "Structure",
    minutes: 6,
  },
  {
    slug: "05-engram",
    title: "Memory across chats",
    description: "Engram keeps other sessions. The notes from your site stay in the folder.",
    section: "Integrate",
    minutes: 12,
  },
  {
    slug: "06-application-mode",
    title: "Use the notes in a proposal",
    description: "Use the folder when you write a proposal or answer a client.",
    section: "Integrate",
    minutes: 8,
  },
  {
    slug: "08-multi-page-extract",
    title: "Several pages of the same site",
    description: "Read related pages on the same site so the draft is fuller.",
    section: "Integrate",
    minutes: 8,
  },
  {
    slug: "09-guided-gap-filling",
    title: "Fill a gap",
    description: "The program suggests a draft answer. You approve it before export.",
    section: "Integrate",
    minutes: 8,
  },
  {
    slug: "10-mcp",
    title: "Read the notes from chat",
    description: "MCP is the read-only plug. It looks at the notes and does not publish.",
    section: "Integrate",
    minutes: 10,
  },
  {
    slug: "14-claude-mcp",
    title: "Claude and remote MCP",
    description: "Scan your site, get what you can claim, and check drafts before publish — from Claude.",
    section: "Integrate",
    minutes: 12,
  },
  {
    slug: "13-mastra",
    title: "Chain the draft",
    description: "Mastra is the program that orders the steps. The tools stay read-only.",
    section: "Integrate",
    minutes: 8,
  },
  {
    slug: "11-content-ads-workers",
    title: "The article, the post, and your yes",
    description: "What the operated loop sends you, and what waits until you approve.",
    section: "Integrate",
    minutes: 8,
  },
  {
    slug: "advanced/eval-and-routing",
    title: "Check a draft before you send it",
    description: "How a draft is checked for a price or a claim that is not in the notes.",
    section: "Advanced",
    minutes: 20,
  },
];

export const LEARN_GROUPS = [
  {
    id: "owner",
    heading: "ownerHeading",
    slugs: [
      "12-what-you-sell",
      "07-extract-from-website",
      "02-facts-vs-stories",
      "03-open-questions",
      "11-content-ads-workers",
    ],
  },
  {
    id: "install",
    heading: "installHeading",
    slugs: [
      "01-first-brain",
      "08-multi-page-extract",
      "09-guided-gap-filling",
      "10-mcp",
      "14-claude-mcp",
      "05-engram",
      "06-application-mode",
      "13-mastra",
      "advanced/eval-and-routing",
    ],
  },
] as const;

const LEARN_ES: Record<string, { title: string; description: string }> = {
  "12-what-you-sell": {
    title: "Qué puedes decir en tu web",
    description:
      "Cinco pasos desde tu página. Un borrador de lo que vendes, para quién, y qué queda marcado hasta que lo confirmes.",
  },
  "01-first-brain": {
    title: "La primera carpeta en 15 minutos",
    description: "Instala la CLI, el programa del ordenador, y exporta la carpeta.",
  },
  "07-extract-from-website": {
    title: "Sacar un borrador de tu página",
    description: "Lee una página pública y corrige el borrador antes de exportar.",
  },
  "02-facts-vs-stories": {
    title: "Qué es un dato y qué es una historia",
    description: "Qué puedes sostener como dato y qué es un relato.",
  },
  "03-open-questions": {
    title: "Lo que aún no has decidido",
    description: "Marca lo que el programa no debe adivinar con [CONFIRM].",
  },
  "05-engram": {
    title: "Memoria entre charlas",
    description: "Engram guarda otras sesiones. Las notas de tu web siguen en la carpeta.",
  },
  "06-application-mode": {
    title: "Usar las notas al escribir una propuesta",
    description: "Usa la carpeta cuando escribes una propuesta o contestas a un cliente.",
  },
  "08-multi-page-extract": {
    title: "Leer varias páginas de la misma web",
    description: "Lee páginas relacionadas del mismo sitio para un borrador más completo.",
  },
  "09-guided-gap-filling": {
    title: "Rellenar huecos",
    description: "El programa propone una respuesta. Tú la apruebas antes de exportar.",
  },
  "10-mcp": {
    title: "Leer las notas desde el chat",
    description: "El MCP es el enchufe de solo lectura. Mira las notas y no las publica.",
  },
  "14-claude-mcp": {
    title: "Claude y MCP remoto",
    description: "Escanea tu web, qué puedes afirmar y comprueba borradores — desde Claude.",
  },
  "13-mastra": {
    title: "Encadenar el borrador",
    description: "Mastra es el programa que ordena los pasos. Las herramientas no publican.",
  },
  "11-content-ads-workers": {
    title: "El artículo, el post y tu sí",
    description: "Qué te llega en el circuito montado, y qué espera a que lo apruebes.",
  },
  "advanced/eval-and-routing": {
    title: "Comprobar un borrador antes de enviarlo",
    description: "Cómo se revisa un borrador si trae un precio o una frase que no está en las notas.",
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
