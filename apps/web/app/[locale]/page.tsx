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
        <div className="hero-stage">
          <div className="hero-copy">
            <p className="hero-kicker">{t("interface")}</p>
            <h1 className="hero-title hero-title-plain">{t("title")}</h1>
            <p className="hero-examples">{t("examples")}</p>
            <Link className="btn home-text-cta" href="/login">
              {t("textCta")}
            </Link>
            <p className="hero-pricing-note">{t("pricingNote")}</p>
          </div>
          <figure className="home-thread">
            <figcaption className="home-thread-caption">Telegram</figcaption>
            <p className="home-bubble home-bubble-you">{t("previewYouHello")}</p>
            <p className="home-bubble home-bubble-bot">{t("previewBotHello")}</p>
            <p className="home-bubble home-bubble-you">{t("previewYouSite")}</p>
            <p className="home-bubble home-bubble-bot">{t("previewBotSite")}</p>
          </figure>
        </div>
      </section>
    </div>
  );
}
