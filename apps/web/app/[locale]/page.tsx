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
                  {t("ctaPrimary")}
                </Link>
                <Link className="btn secondary" href="/check">
                  {t("ctaSecondary")}
                </Link>
              </div>
              <p className="hero-meta">
                {t("mcpHint")}{" "}
                <Link href="/learn/14-claude-mcp">{t("mcpHintLink")}</Link>
              </p>
            </div>
          </div>
          <div className="perk-box">
            <ul>
              <li>
                <strong>{t("pillar1Title")}</strong> {t("pillar1Body")}
              </li>
              <li>
                <strong>{t("pillar2Title")}</strong> {t("pillar2Body")}
              </li>
              <li>
                <strong>{t("pillar3Title")}</strong> {t("pillar3Body")}
              </li>
            </ul>
          </div>
        </div>
      </section>
      <BrainStorySection />
    </div>
  );
}
