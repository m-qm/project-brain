import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isAppLocale } from "@/i18n/routing";
import { onboardingGuide } from "@/lib/onboarding-guide";
import { pageMeta } from "@/lib/site";
import { GuideSignup } from "../../components/GuideSignup";
import { SiteNav } from "../../components/SiteNav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta(
    "/onboarding",
    t("onboardingTitle"),
    t("onboardingDescription"),
    isAppLocale(locale) ? locale : "en",
  );
}

export default async function OnboardingPage() {
  const t = await getTranslations("onboarding");
  const locale = await getLocale();
  const guide = onboardingGuide(locale);

  return (
    <div className="page-shell">
      <SiteNav ctaHref="/wizard" ctaLabel={t("paste")} />
      <header className="learn-hero">
        <div className="container learn-hero-inner">
          <p className="learn-eyebrow">{guide.docLabel}</p>
          <h1 className="learn-title">
            {guide.title} <em>{guide.titleEm}</em>
          </h1>
          <p className="learn-lead">{guide.lead}</p>
          <div className="learn-hero-actions" id="guide">
            <GuideSignup source="onboarding" appearance="primary" label={t("download")} />
            <Link className="btn secondary" href="/wizard">
              {t("paste")}
            </Link>
          </div>
        </div>
      </header>

      <main className="onboarding-main">
        <section className="onboarding-block" aria-labelledby="onboarding-steps">
          <h2 id="onboarding-steps">{guide.stepsHeading}</h2>
          <ol className="onboarding-steps">
            {guide.steps.map((step) => (
              <li key={step.n}>
                <span className="onboarding-num">{step.n}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="onboarding-split">
          <section className="onboarding-card" aria-labelledby="onboarding-folder">
            <h2 id="onboarding-folder">{guide.folderHeading}</h2>
            <ul className="onboarding-folder">
              {guide.folder.map((file) => (
                <li key={file.path}>
                  <span className="onboarding-path">{file.path}</span>
                  <span>{file.note}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="onboarding-card" aria-labelledby="onboarding-checks">
            <h2 id="onboarding-checks">{guide.checksHeading}</h2>
            <ul className="onboarding-checks">
              {guide.checks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="onboarding-block" aria-labelledby="onboarding-cli">
          <h2 id="onboarding-cli">{guide.cliHeading}</h2>
          <div className="learn-code-block">
            <pre className="learn-code">
              <code>{guide.cli.join("\n")}</code>
            </pre>
          </div>
        </section>

        <p className="onboarding-next">
          <span>{guide.nextLabel}</span>
          <Link href="/wizard">{guide.nextUrl}</Link>
          <span className="onboarding-next-note">{guide.samePack}</span>
        </p>
      </main>
    </div>
  );
}
