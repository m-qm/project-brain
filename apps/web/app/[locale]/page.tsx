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
    <div className="page-shell">
      <SiteNav />
      <section className="hero hero-minimal">
        <div className="hero-inner">
          <h1 className="hero-title hero-title-plain">{t("title")}</h1>
          <p className="hero-lead">{t("interface")}</p>
          <p className="hero-examples">{t("examples")}</p>
          <div className="hero-cta-row">
            <Link className="btn" href="/company-brain">
              {t("ctaPrimary")}
            </Link>
            <Link className="btn secondary" href="/wizard">
              {t("ctaSite")}
            </Link>
          </div>
          <p className="hero-meta">
            <Link href="/learn">{t("forDevelopers")}</Link>
            {" · "}
            <a
              href="https://github.com/m-qm/project-brain"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}