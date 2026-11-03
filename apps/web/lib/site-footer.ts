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

export const FOOTER_OPERATOR = "Agent KBase";
export const FOOTER_CONTACT = "hello@agentkbase.com";
