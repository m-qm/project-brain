import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isAppLocale } from "@/i18n/routing";
import { pageMeta } from "@/lib/site";
import { SiteNav } from "../components/SiteNav";

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
          <div className="hero-how" aria-labelledby="home-how-title">
            <p id="home-how-title" className="hero-how-title">
              {t("howTitle")}
            </p>
            <ol className="hero-how-list">
              <li>{t("how1")}</li>
              <li>{t("how2")}</li>
              <li>{t("how3")}</li>
            </ol>
          </div>
          <p className="hero-examples">{t("examples")}</p>
          <p className="hero-pricing-note">{t("pricingNote")}</p>
          <div className="hero-cta-row">
            <Link className="btn" href="/company-brain">
              {t("ctaPrimary")}
            </Link>
          </div>
          <p className="hero-meta">
            <Link href="/wizard">{t("ctaSite")}</Link>
            {" · "}
            <Link href="/learn">{t("forDevelopers")}</Link>
          </p>
        </div>
      </section>
    </div>
  );
}