"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

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

export function SiteNav() {
  const t = useTranslations("nav");
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          <img src="/brand-mark.svg" alt="" className="brand-mark" width={28} height={28} />
          Agent KBase
        </Link>
        <div className="nav-actions">
          <LocaleSwitch />
          <Link className="nav-login" href="/login">
            {t("login")}
          </Link>
        </div>
      </div>
    </header>
  );
}
