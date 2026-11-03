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
