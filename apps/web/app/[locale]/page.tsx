import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isAppLocale } from "@/i18n/routing";
import { pageMeta } from "@/lib/site";
import { BrainStorySection } from "../components/BrainStorySection";
import { HeroShowcase } from "../components/HeroShowcase";
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
      <section className="hero">
        <div className="hero-badge">{t("badge")}</div>
        <h1 className="hero-title">{t.rich("title", { em: (chunks) => <em>{chunks}</em> })}</h1>
        <p className="hero-lead">{t("lead")}</p>
        <div className="hero-cta-row">
          <Link className="btn" href="/wizard">
            {t("paste")}
          </Link>
          <a
            className="btn secondary"
            href="https://github.com/m-qm/project-brain"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("github")}
          </a>
          <a
            className="btn secondary"
            href="https://www.npmjs.com/package/@agentkbase/cli"
            target="_blank"
            rel="noopener noreferrer"
          >
            npm
          </a>
        </div>
        <div className="hero-install learn-code-block" aria-label={t("installLabel")}>
          <div className="learn-code-label">{t("installLabel")}</div>
          <pre className="learn-code">
            <code>npm install -g @agentkbase/cli</code>
          </pre>
        </div>
        <div className="perk-box">
          <ul>
            <li>{t("perkCut")}</li>
            <li>{t("perkYes")}</li>
            <li>{t("perkAfter")}</li>
            <li>{t("perkSame")}</li>
            <li>{t("perkSkills")}</li>
          </ul>
        </div>
        <p className="hero-meta">
          {t("browsing")} <Link href="/learn/12-what-you-sell">{t("fiveSteps")}</Link>
        </p>
      </section>
      <HeroShowcase />
      <BrainStorySection />
    </div>
  );
}
