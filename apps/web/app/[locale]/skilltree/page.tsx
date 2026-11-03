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
    "/skilltree",
    t("skilltreeTitle"),
    t("skilltreeDescription"),
    isAppLocale(locale) ? locale : "en",
  );
}

export default async function SkillTreePage() {
  const t = await getTranslations("skilltree");

  return (
    <div className="page-shell">
      <SiteNav />
      <main className="page-main container-narrow">
        <h1 className="page-title">
          {t.rich("title", {
            em: (chunks) => (
              <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>{chunks}</em>
            ),
          })}
        </h1>
        <p className="page-lead">{t("lead")}</p>
        <div className="card">
          <ol style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--ink-2)" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              {t.rich("step1", {
                wizard: (chunks) => <Link href="/wizard">{chunks}</Link>,
              })}
            </li>
            <li style={{ marginBottom: "0.5rem" }}>{t("step2")}</li>
            <li style={{ marginBottom: "0.5rem" }}>{t("step3")}</li>
            <li>{t("step4")}</li>
          </ol>
          <p style={{ marginTop: "1.25rem" }}>
            <Link className="btn secondary" href="/learn/04-import-skills-skilltree">
              {t("guide")}
            </Link>
          </p>
        </div>
        <div className="card company-brain-card" style={{ marginTop: "1rem" }}>
          <h2 className="company-brain-card-title">{t("afterTitle")}</h2>
          <p className="field-hint" style={{ marginBottom: "1rem" }}>
            {t("afterBody")}
          </p>
          <Link className="btn" href="/company-brain">
            {t("knowledge")}
          </Link>
        </div>
      </main>
    </div>
  );
}
