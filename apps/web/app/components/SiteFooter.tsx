"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FOOTER_LEGAL_LINKS } from "@/lib/site-footer";

const LABEL_KEYS = {
  "/legal/privacy": "privacy",
  "/legal/terms": "terms",
  "/legal/trust": "trust",
  "/legal/sla": "sla",
  "/legal/acknowledgements": "acknowledgements",
  "https://www.vercel-status.com/": "status",
} as const;

export function SiteFooter() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-product">
          <Link href="/">agentkbase.com</Link>
          {" · "}
          Agent KBase · {t("product")}{" "}
          <a href="https://skilltree.ai" target="_blank" rel="noopener noreferrer">
            SkillTree
          </a>
          {" · "}
          <a href="https://www.npmjs.com/package/@agentkbase/cli">npm</a>
          {" · "}
          <a href="https://github.com/m-qm/project-brain">GitHub</a>
        </p>
        <nav className="site-footer-legal" aria-label={t("legal")}>
          <span className="site-footer-copy">
            © {year} {t("copyright")}
          </span>
          {FOOTER_LEGAL_LINKS.map((link) => {
            const key = LABEL_KEYS[link.href as keyof typeof LABEL_KEYS];
            const label = key ? t(key) : link.label;
            return link.external ? (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ) : (
              <Link key={link.href} href={link.href}>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}
