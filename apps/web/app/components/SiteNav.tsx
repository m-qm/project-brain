"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const LINK_DEFS = [
  { href: "/learn", key: "learn" },
  { href: "/blog", key: "blog" },
  { href: "/check", key: "check" },
  { href: "/company-brain", key: "knowledge" },
  { href: "/wizard", key: "wizard" },
] as const;

type SiteNavProps = {
  ctaHref?: string;
  ctaLabel?: string;
  hideCta?: boolean;
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

function CtaLink({ href, label, className }: { href: string; label: string; className: string }) {
  if (href.startsWith("mailto:") || href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a className={className} href={href}>
        {label}
      </a>
    );
  }
  return (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}

export function SiteNav({ ctaHref, ctaLabel, hideCta = false }: SiteNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const href = ctaHref ?? "/wizard";
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
          {hideCta ? null : <CtaLink className="btn nav-menu-cta" href={href} label={label} />}
        </nav>
        <div className="nav-actions">
          <LocaleSwitch />
          {hideCta ? null : <CtaLink className="btn" href={href} label={label} />}
        </div>
      </div>
    </header>
  );
}
