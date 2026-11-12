import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { isAppLocale } from "@/i18n/routing";
import { pageMeta } from "@/lib/site";
import { PublishCheckForm } from "../../components/PublishCheckForm";
import { SiteNav } from "../../components/SiteNav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta(
    "/check",
    t("checkTitle"),
    t("checkDescription"),
    isAppLocale(locale) ? locale : "en",
  );
}

export default async function CheckPage() {
  const t = await getTranslations("check");

  return (
    <div className="page-shell">
      <SiteNav ctaHref="/wizard" ctaLabel={t("ctaWizard")} />
      <main className="page-main container-narrow">
        <h1 className="page-title">{t("title")}</h1>
        <p className="page-lead">{t("lead")}</p>
        <Suspense fallback={<p className="field-hint">{t("loading")}</p>}>
          <PublishCheckForm />
        </Suspense>
      </main>
    </div>
  );
}
