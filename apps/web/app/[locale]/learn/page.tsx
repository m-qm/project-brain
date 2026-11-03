import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isAppLocale } from "@/i18n/routing";
import { pageMeta } from "@/lib/site";
import { LearnDocAnalytics } from "../../components/LearnDocAnalytics";
import { SiteNav } from "../../components/SiteNav";
import { LEARN_DOCS, LEARN_SECTIONS, LEARN_SECTION_ES, learnText } from "./learn-docs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta("/learn", t("learnTitle"), t("learnDescription"), isAppLocale(locale) ? locale : "en");
}

export default async function LearnIndexPage() {
  const t = await getTranslations("learn");
  const locale = await getLocale();

  return (
    <div className="page-shell">
      <LearnDocAnalytics slug="index" section="hub" />
      <SiteNav ctaHref="/wizard" ctaLabel={t("tryWizard")} />
      <header className="learn-hero">
        <div className="container learn-hero-inner">
          <p className="learn-eyebrow">{t("eyebrow")}</p>
          <h1 className="learn-title">{t.rich("title", { em: (chunks) => <em>{chunks}</em> })}</h1>
          <p className="learn-lead">{t("lead")}</p>
          <div className="learn-hero-actions">
            <Link className="btn" href="/learn/12-what-you-sell">
              {t("forStudio")}
            </Link>
            <Link className="btn secondary" href="/learn/01-first-brain">
              {t("install")}
            </Link>
            <Link className="btn secondary" href="/wizard">
              {t("openWizard")}
            </Link>
          </div>
        </div>
      </header>

      <main className="learn-main container">
        {LEARN_SECTIONS.map((section) => {
          const items = LEARN_DOCS.filter((d) => d.section === section);
          if (items.length === 0) return null;
          const heading = locale === "es" ? LEARN_SECTION_ES[section] : section;
          return (
            <section key={section} className="learn-section">
              <h2 className="learn-section-title">{heading}</h2>
              <ul className="learn-grid">
                {items.map((doc, i) => {
                  const copy = learnText(doc, locale);
                  return (
                    <li key={doc.slug}>
                      <Link href={`/learn/${doc.slug}`} className="learn-card">
                        <span className="learn-card-index">{String(i + 1).padStart(2, "0")}</span>
                        <span className="learn-card-body">
                          <span className="learn-card-title">{copy.title}</span>
                          <span className="learn-card-desc">{copy.description}</span>
                        </span>
                        <span className="learn-card-meta">{t("min", { count: doc.minutes })}</span>
                        <span className="learn-card-arrow" aria-hidden>
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </main>
    </div>
  );
}
