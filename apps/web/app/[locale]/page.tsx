import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isAppLocale } from "@/i18n/routing";
import { pageMeta } from "@/lib/site";
import { BrainStorySection } from "../components/BrainStorySection";
import { HeroKnowledgeGraph } from "../components/HeroKnowledgeGraph";
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
  const g = await getTranslations("graph");

  return (
    <div className="page-shell">
      <SiteNav />
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-layout">
            <div className="hero-intro">
              <div className="hero-badge">{t("badge")}</div>
              <h1 className="hero-title">{t.rich("title", { em: (chunks) => <em>{chunks}</em> })}</h1>
            </div>
            <HeroKnowledgeGraph
              copy={{
                caption: g("label"),
                legendFacts: g("legendFacts"),
                legendStories: g("legendStories"),
                legendQuestions: g("legendQuestions"),
                legendConfirm: g("legendConfirm"),
                center: g("center"),
                facts: g("facts"),
                stories: g("stories"),
                questions: g("questions"),
                confirm: g("confirm"),
                agents: g("agents"),
                project: g("project"),
                routing: g("routing"),
                voice: g("voice"),
                offers: g("offers"),
                constraints: g("constraints"),
                client: g("client"),
                audience: g("audience"),
                price: g("price"),
                deadline: g("deadline"),
              }}
            />
            <div className="hero-actions">
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
              <p className="hero-meta">
                {t("browsing")} <Link href="/learn/12-what-you-sell">{t("fiveSteps")}</Link>
              </p>
            </div>
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
        </div>
      </section>
      <BrainStorySection />
    </div>
  );
}
