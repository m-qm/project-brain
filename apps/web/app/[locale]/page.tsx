import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isAppLocale } from "@/i18n/routing";
import { pageMeta } from "@/lib/site";
import { SiteNav } from "../components/SiteNav";
import { GetStarted } from "../components/GetStarted";

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
  return (
    <div className="page-shell page-shell-minimal">
      <SiteNav />
      <section className="hero hero-minimal">
        <div className="hero-inner hero-inner-narrow">
          <GetStarted />
        </div>
      </section>
    </div>
  );
}
