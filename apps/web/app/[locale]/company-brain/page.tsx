import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isAppLocale } from "@/i18n/routing";
import { pageMeta } from "@/lib/site";
import { SiteNav } from "../../components/SiteNav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta(
    "/company-brain",
    t("companyTitle"),
    t("companyDescription"),
    isAppLocale(locale) ? locale : "en",
  );
}

export default async function CompanyBrainPage() {
  const t = await getTranslations("company");
  const nav = await getTranslations("nav");
  const mailto = `mailto:hello@agentkbase.com?subject=${encodeURIComponent(nav("writeSubject"))}`;

  return (
    <div className="page-shell">
      <SiteNav />
      <main className="page-main container-narrow">
        <p className="story-eyebrow">{t("eyebrow")}</p>
        <h1 className="page-title">{t("title")}</h1>
        <p className="page-lead">{t("lead")}</p>

        <div className="card company-brain-card" id="guide">
          <p className="story-eyebrow">{t("stepsEyebrow")}</p>
          <h2 className="company-brain-card-title">{t("stepsTitle")}</h2>
          <ol className="company-brain-list company-brain-checks">
            <li>{t("step1")}</li>
            <li>{t("step2")}</li>
            <li>{t("step3")}</li>
            <li>{t("step4")}</li>
            <li>{t("step5")}</li>
          </ol>
        </div>

        <div className="card company-brain-card" id="revision">
          <p className="story-eyebrow">{t("checksEyebrow")}</p>
          <h2 className="company-brain-card-title">{t("checksTitle")}</h2>
          <p className="company-brain-checks-lead">{t("checksLead")}</p>
          <ol className="company-brain-list company-brain-checks">
            <li>{t("check1")}</li>
            <li>{t("check2")}</li>
            <li>{t("check3")}</li>
            <li>{t("check4")}</li>
            <li>{t("check5")}</li>
          </ol>
          <p className="field-hint">
            {t("firstArticle")}{" "}
            <Link href="/blog/stop-fake-prices">{t("articleTitle")}</Link>
            .
          </p>
          <p className="field-hint" style={{ marginTop: "1rem" }}>
            {t("selfCheck")}{" "}
            <Link href="/check">{t("checkPage")}</Link>
          </p>
        </div>

        <div className="card company-brain-card">
          <h2 className="company-brain-card-title">{t("openCore")}</h2>
          <ul className="company-brain-list">
            <li>{t("core1")}</li>
            <li>{t("core2")}</li>
            <li>{t("core3")}</li>
          </ul>
          <p className="field-hint">{t("price")}</p>
          <p className="field-hint">{t("connectors")}</p>
          <a className="btn" href={mailto}>
            {t("write")}
          </a>
        </div>
      </main>
    </div>
  );
}
