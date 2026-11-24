"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-copy">{t("copyrightLine")}</p>
        <nav className="site-footer-legal" aria-label={t("legal")}>
          <Link href="/blog">{t("blog")}</Link>
          <Link href="/legal/privacy">{t("privacyPolicy")}</Link>
          <Link href="/legal/terms">{t("termsOfService")}</Link>
        </nav>
      </div>
    </footer>
  );
}
