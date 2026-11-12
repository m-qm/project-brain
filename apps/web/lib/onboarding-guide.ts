export type OnboardingGuide = {
  locale: "en" | "es";
  filename: string;
  brand: string;
  docLabel: string;
  title: string;
  titleEm: string;
  lead: string;
  stepsHeading: string;
  steps: { n: string; title: string; body: string }[];
  folderHeading: string;
  folder: { path: string; note: string }[];
  checksHeading: string;
  checks: string[];
  cliHeading: string;
  cli: string[];
  nextLabel: string;
  nextUrl: string;
  samePack: string;
};

const CLI = [
  "npm install -g @agentkbase/cli",
  'brain setup -n "My Product" --url https://yourproduct.com ~/path/to/your-repo',
  "brain validate --dir ~/path/to/your-repo",
];

const EN: OnboardingGuide = {
  locale: "en",
  filename: "agent-kbase-onboarding.pdf",
  brand: "AGENT KBASE",
  docLabel: "ONBOARDING GUIDE",
  title: "The knowledge layer",
  titleEm: "every agent reads.",
  lead: "For a studio or a small consultancy. Paste your site. Correct the draft until you recognise what you sell, who it is for, and what must not be said. Every agent that speaks for the business reads that same base.",
  stepsHeading: "FIVE STEPS",
  steps: [
    {
      n: "1",
      title: "Paste the site",
      body: "Open the wizard, paste the public URL, and extract a draft. The draft is a guess from that page. It is not a new offer.",
    },
    {
      n: "2",
      title: "Cross out what you do not sell",
      body: "Delete any service, price, or deadline that is not on the page and that you will not honour. A fluent sentence is not a fact.",
    },
    {
      n: "3",
      title: "Write who you serve",
      body: "Keep one answer for who the work is for, and what you will not claim. Leave gaps as [CONFIRM]. Do not fill them to make the file look finished.",
    },
    {
      n: "4",
      title: "Ask something a client would ask",
      body: '“What do you do, and what does it cost?” The reply is valid only when every claim is in the base you just edited, or still marked [CONFIRM].',
    },
    {
      n: "5",
      title: "Export. Every agent reads that base",
      body: "Unzip brain.zip at the repo root. An article or a LinkedIn post comes after, and only when you say yes.",
    },
  ],
  folderHeading: "THE FOLDER",
  folder: [
    { path: "brain/AGENTS.md", note: "The next chat reads this first." },
    { path: "brain/facts/project.md", note: "What you sell, and who it is for." },
    { path: "brain/facts/offers.md", note: "A price the page does not say stays out." },
    { path: "brain/open-questions.md", note: "What you cannot show stays as [CONFIRM]." },
  ],
  checksHeading: "BEFORE ANYTHING GOES LIVE",
  checks: [
    "A line is valid when it is in your files, marked [CONFIRM], or cut.",
    "Nothing goes live until you say yes.",
    "A price, a client, or a ranking you cannot show is not invented.",
  ],
  cliHeading: "OR FROM THE TERMINAL",
  cli: CLI,
  nextLabel: "Next",
  nextUrl: "agentkbase.com/wizard",
  samePack: "Same pack from the wizard or the CLI.",
};

const ES: OnboardingGuide = {
  locale: "es",
  filename: "agent-kbase-guia.pdf",
  brand: "AGENT KBASE",
  docLabel: "GUÍA DE INICIO",
  title: "La capa de conocimiento",
  titleEm: "que lee cada agente.",
  lead: "Para un estudio o una consultoría pequeña. Pega tu web. Corrige el borrador hasta que reconozcas qué vendes, para quién, y qué no se puede decir. Cada agente que habla por el negocio lee esa misma base.",
  stepsHeading: "CINCO PASOS",
  steps: [
    {
      n: "1",
      title: "Pega la web",
      body: "Abre el asistente, pega la URL pública y extrae un borrador. El borrador sale de esa página. No es una oferta nueva.",
    },
    {
      n: "2",
      title: "Tacha lo que no vendes",
      body: "Borra cualquier servicio, precio o plazo que no esté en la página y que no vayas a cumplir. Una frase fluida no es un dato.",
    },
    {
      n: "3",
      title: "Escribe a quién sirves",
      body: "Deja una respuesta para quién es el trabajo, y qué no vas a afirmar. Los huecos se quedan en [CONFIRM]. No los rellenes para que el archivo parezca terminado.",
    },
    {
      n: "4",
      title: "Pregunta lo que preguntaría un cliente",
      body: "“¿Qué hacéis y cuánto cuesta?” La respuesta vale solo cuando cada afirmación está en la base que acabas de editar, o sigue en [CONFIRM].",
    },
    {
      n: "5",
      title: "Exporta. Cada agente lee esa base",
      body: "Descomprime brain.zip en la raíz del repo. Un artículo o un post de LinkedIn llega después, y solo cuando tú dices que sí.",
    },
  ],
  folderHeading: "LA CARPETA",
  folder: [
    { path: "brain/AGENTS.md", note: "El siguiente chat lee esto primero." },
    { path: "brain/facts/project.md", note: "Qué vendes, y para quién." },
    { path: "brain/facts/offers.md", note: "Un precio que la página no dice se queda fuera." },
    { path: "brain/open-questions.md", note: "Lo que no puedes mostrar se queda en [CONFIRM]." },
  ],
  checksHeading: "ANTES DE QUE NADA SALGA",
  checks: [
    "Una línea vale si está en tus archivos, marcada [CONFIRM], o cortada.",
    "Nada sale hasta que tú dices que sí.",
    "Un precio, un cliente o un ranking que no puedes mostrar no se inventa.",
  ],
  cliHeading: "O DESDE LA TERMINAL",
  cli: CLI,
  nextLabel: "Siguiente",
  nextUrl: "agentkbase.com/wizard",
  samePack: "La misma base, desde el asistente o la CLI.",
};

export function onboardingGuide(locale: string): OnboardingGuide {
  return locale === "es" ? ES : EN;
}

/** Public path of the PDF. English stays unprefixed. */
export function onboardingPdfPath(locale: string): string {
  return locale === "es" ? "/es/onboarding/pdf" : "/onboarding/pdf";
}
