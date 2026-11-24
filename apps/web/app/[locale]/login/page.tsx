import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isAppLocale } from "@/i18n/routing";
import { pageMeta } from "@/lib/site";
import { GetStarted } from "../../components/GetStarted";
import { SiteNav } from "../../components/SiteNav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return pageMeta("/login", t("startTitle"), t("startLead"), isAppLocale(locale) ? locale : "en");
}

export default function LoginPage() {
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
