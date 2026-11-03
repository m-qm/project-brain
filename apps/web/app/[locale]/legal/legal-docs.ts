export type LegalDoc = {
  slug: string;
  title: string;
  description: string;
};

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    description: "How agentkbase.com handles personal data, analytics, and waitlist signups.",
  },
  {
    slug: "terms",
    title: "Terms of Service",
    description: "Rules for using the Agent KBase website, wizard, and waitlist.",
  },
  {
    slug: "trust",
    title: "Trust Center",
    description: "Security contact, data boundaries, and how we run the public site.",
  },
  {
    slug: "sla",
    title: "Service level",
    description: "Availability expectations for the free hosted wizard and site.",
  },
  {
    slug: "acknowledgements",
    title: "Acknowledgements",
    description: "Open source software that powers Agent KBase.",
  },
];

export const LEGAL_SLUGS = new Set(LEGAL_DOCS.map((d) => d.slug));

const LEGAL_ES: Record<string, { title: string; description: string }> = {
  privacy: {
    title: "Política de privacidad",
    description: "Cómo agentkbase.com trata los datos personales, la analítica y la lista de espera.",
  },
  terms: {
    title: "Términos del servicio",
    description: "Reglas para usar la web, el asistente y la lista de espera de Agent KBase.",
  },
  trust: {
    title: "Centro de confianza",
    description: "Contacto de seguridad, límites de datos y cómo funciona la web pública.",
  },
  sla: {
    title: "Nivel de servicio",
    description: "Qué disponibilidad esperar del asistente alojado y de la web, que son gratis.",
  },
  acknowledgements: {
    title: "Agradecimientos",
    description: "Software de código abierto que hace funcionar Agent KBase.",
  },
};

export function legalText(doc: LegalDoc, locale: string): LegalDoc {
  if (locale !== "es") return doc;
  const copy = LEGAL_ES[doc.slug];
  return copy ? { ...doc, ...copy } : doc;
}
