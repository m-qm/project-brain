import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isAppLocale } from "@/i18n/routing";
import { pageMeta } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta(
    "/wizard",
    t("wizardTitle"),
    t("wizardDescription"),
    isAppLocale(locale) ? locale : "en",
  );
}

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
