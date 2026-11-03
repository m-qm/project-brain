"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const LINK_DEFS = [
  { href: "/learn", key: "learn" },
  { href: "/blog", key: "blog" },
  { href: "/company-brain", key: "knowledge" },
  { href: "/skilltree", key: "skilltree" },
  { href: "/tree", key: "brainMap" },
  { href: "/wizard", key: "wizard" },
] as const;

type SiteNavProps = {
  ctaHref?: string;
  ctaLabel?: string;
};

function LocaleSwitch() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="locale-switch" role="group" aria-label={t("language")}>
      <Link href={pathname} locale="en" hrefLang="en" aria-current={locale === "en" ? "true" : undefined}>
        EN
      </Link>
      <span aria-hidden>·</span>
      <Link href={pathname} locale="es" hrefLang="es" aria-current={locale === "es" ? "true" : undefined}>
        ES
      </Link>
    </div>
  );
}

export function SiteNav({ ctaHref = "/wizard", ctaLabel }: SiteNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const label = ctaLabel ?? t("tryWizard");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          <img src="/brand-mark.svg" alt="" className="brand-mark" width={28} height={28} />
          Agent KBase
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? t("close") : t("menu")}
        </button>
        <nav id="site-nav" className={`nav-links${open ? " is-open" : ""}`} aria-label={t("primary")}>
          <LocaleSwitch />
          {LINK_DEFS.map((item) => (
            <Link key={item.href} href={item.href}>
              {t(item.key)}
            </Link>
          ))}
          <a href="https://github.com/m-qm/project-brain" target="_blank" rel="noopener noreferrer">
            {t("github")}
          </a>
          <Link className="btn nav-menu-cta" href={ctaHref}>
            {label}
          </Link>
        </nav>
        <div className="nav-actions">
          <LocaleSwitch />
          <Link className="btn" href={ctaHref}>
            {label}
          </Link>
        </div>
      </div>
    </header>
  );
}
