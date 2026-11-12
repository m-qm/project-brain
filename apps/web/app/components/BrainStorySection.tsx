import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrainTreeGraph } from "./BrainTreeGraph";

export async function BrainStorySection() {
  const t = await getTranslations("story");
  const steps = [
    { kicker: t("band1Kicker"), title: t("step1Title"), body: t("step1Body") },
    { kicker: t("band2Kicker"), title: t("step2Title"), body: t("step2Body") },
    { kicker: t("band3Kicker"), title: t("step3Title"), body: t("step3Body") },
    { kicker: t("band4Kicker"), title: t("step4Title"), body: t("step4Body") },
  ];
  const faqs = [
    { q: t("faqMcpQ"), a: t("faqMcpA") },
    { q: t("faqGitQ"), a: t("faqGitA") },
    { q: t("faqLiveQ"), a: t("faqLiveA") },
  ];

  return (
    <section className="story-section" id="how-it-works">
      <div className="container">
        <div className="story-grid">
          <div className="story-copy">
            <p className="story-eyebrow">{t("eyebrow")}</p>
            <h2 className="story-title">{t.rich("title", { em: (chunks) => <em>{chunks}</em> })}</h2>
            <p className="story-lead">{t("lead1")}</p>
            <p className="story-lead">{t("lead2")}</p>
            <Link className="btn" href="/wizard">
              {t("start")}
            </Link>
          </div>
          <div className="story-visual">
            <BrainTreeGraph live />
          </div>
        </div>

        <ol className="story-bands">
          {steps.map((step) => (
            <li key={step.kicker}>
              <p className="story-band-kicker">{step.kicker}</p>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="audit-block" id="audit">
          <div className="audit-copy">
            <p className="story-eyebrow">{t("extractEyebrow")}</p>
            <h2 className="story-title audit-title">
              {t.rich("extractTitle", { em: (chunks) => <em>{chunks}</em> })}
            </h2>
            <p className="story-lead">{t("extractLead")}</p>
            <p className="story-lead muted">{t("extractMuted")}</p>
            <div className="btn-row" style={{ marginTop: "0.75rem" }}>
              <Link className="btn secondary" href="/learn/07-extract-from-website">
                {t("extractGuide")}
              </Link>
              <Link className="btn secondary" href="/company-brain">
                {t("knowledge")}
              </Link>
            </div>
          </div>
          <div className="audit-visual">
            <div className="audit-url-bar" aria-hidden>
              <span className="audit-url-label">URL</span>
              <span className="audit-url-value">https://auditamia.com/es</span>
              <span className="audit-url-badge">{t("extracted")}</span>
            </div>
            <BrainTreeGraph extractDemo highlightDomains={["facts", "gaps", "stories", "offers"]} />
          </div>
        </div>

        <div className="home-faq">
          <h2>{t("faqTitle")}</h2>
          {faqs.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
