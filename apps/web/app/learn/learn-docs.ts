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
    title: "Paste your site. Check what you sell.",
    description:
      "Five steps for a studio or small consultancy: a draft from your URL, then an article and a LinkedIn post you approve.",
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
