"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { HeaderMenuToggle } from "./HeaderMenuToggle";
import { SiteButton } from "./ui/site-button";

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
  const locale = useLocale() as "en" | "es";
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SegmentedControl
      className="locale-switch-ui"
      value={locale}
      onValueChange={(next) => {
        if (next === "en" || next === "es") router.replace(pathname, { locale: next });
      }}
      aria-label={t("language")}
    >
      <SegmentedControlIndicator />
      <SegmentedControlItem value="en">EN</SegmentedControlItem>
      <SegmentedControlItem value="es">ES</SegmentedControlItem>
    </SegmentedControl>
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
        <HeaderMenuToggle
          open={open}
          onToggle={() => setOpen((value) => !value)}
          menuLabel={t("menu")}
          closeLabel={t("close")}
          controlsId="site-nav"
        />
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
          {hideCta ? null : <SiteButton className="nav-menu-cta" href={href} variant="primary">{label}</SiteButton>}
        </nav>
        <div className="nav-actions">
          <LocaleSwitch />
          {hideCta ? null : <SiteButton href={href} variant="primary">{label}</SiteButton>}
        </div>
      </div>
    </header>
  );
}