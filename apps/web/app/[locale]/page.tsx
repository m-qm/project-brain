import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isAppLocale } from "@/i18n/routing";
import { pageMeta } from "@/lib/site";
import { SiteNav } from "../components/SiteNav";
import { StartOnWhatsApp } from "../components/StartOnWhatsApp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta("/", t("homeTitle"), t("homeDescription"), isAppLocale(locale) ? locale : "en");
}

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div className="page-shell page-shell-minimal">
      <SiteNav />
      <section className="hero hero-minimal">
        <div className="hero-inner hero-inner-narrow">
          <h1 className="hero-title hero-title-plain">{t("title")}</h1>
          <p className="hero-lead">{t("interface")}</p>
          <p className="hero-examples">{t("examples")}</p>
          <p className="hero-pricing-note">{t("pricingNote")}</p>
          <StartOnWhatsApp
            copy={{
              cta: t("ctaPrimary"),
              phoneLabel: t("phoneLabel"),
              placeholder: t("phonePlaceholder"),
              invalid: t("phoneInvalid"),
              opening: t("openingChat"),
            }}
          />
        </div>
      </section>
    </div>
  );
}
