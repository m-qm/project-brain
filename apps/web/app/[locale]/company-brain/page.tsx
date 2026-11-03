import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isAppLocale } from "@/i18n/routing";
import { pageMeta } from "@/lib/site";
import { SiteNav } from "../../components/SiteNav";
import { CompanyBrainWaitlist } from "./CompanyBrainWaitlist";

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

  return (
    <div className="page-shell">
      <SiteNav ctaHref="/wizard" ctaLabel={t("navCta")} />
      <main className="page-main container-narrow">
        <p className="story-eyebrow">{t("eyebrow")}</p>
        <h1 className="page-title">
          {t.rich("title", {
            em: (chunks) => (
              <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>{chunks}</em>
            ),
          })}
        </h1>
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
          <p className="field-hint">
            {t("validLine")} <Link href="/learn/12-what-you-sell">{t("readGuide")}</Link>
            {" · "}
            <Link href="/wizard">{t("openWizard")}</Link>.
          </p>
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
        </div>

        <div className="card company-brain-card">
          <h2 className="company-brain-card-title">{t("openCore")}</h2>
          <ul className="company-brain-list">
            <li>{t("core1")}</li>
            <li>{t("core2")}</li>
            <li>{t("core3")}</li>
            <li>{t("core4")}</li>
          </ul>
          <p className="field-hint">{t("coreHint")}</p>
        </div>

        <div className="card company-brain-card">
          <h2 className="company-brain-card-title">{t("twoWays")}</h2>
          <div className="company-brain-tier-grid">
            <div className="company-brain-tier">
              <p className="company-brain-tier-name">{t("dfyName")}</p>
              <p className="company-brain-tier-price">{t("dfyPrice")}</p>
              <p className="company-brain-tier-desc">{t("dfyDesc")}</p>
            </div>
            <div className="company-brain-tier">
              <p className="company-brain-tier-name">{t("actName")}</p>
              <p className="company-brain-tier-price">{t("actPrice")}</p>
              <p className="company-brain-tier-desc">{t("actDesc")}</p>
            </div>
          </div>
          <CompanyBrainWaitlist source="company-brain-page" />
        </div>

        <p className="field-hint" style={{ marginTop: "1.5rem" }}>
          {t("freeToday")} <Link href="/learn/12-what-you-sell">{t("guideLink")}</Link>
          {", "}
          <Link href="/wizard">{t("wizardLink")}</Link>
          {", "}
          <Link href="/learn/11-content-ads-workers">{t("workersLink")}</Link>
          {", "}
          <Link href="/learn/10-mcp">{t("mcpLink")}</Link>.
        </p>
      </main>
    </div>
  );
}
