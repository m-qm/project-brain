/** Legal and trust links shown site-wide (MIOSA-style footer row). */

export type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

export const FOOTER_LEGAL_LINKS: FooterLink[] = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/trust", label: "Trust Center" },
  { href: "https://www.vercel-status.com/", label: "Status", external: true },
  { href: "/legal/sla", label: "SLA" },
  { href: "/legal/acknowledgements", label: "Acknowledgements" },
];

/** Project name only — not a registered company (see /legal/privacy). */
export const FOOTER_COPYRIGHT = "Agent KBase project";
export const FOOTER_CONTACT = "hello@agentkbase.com";
