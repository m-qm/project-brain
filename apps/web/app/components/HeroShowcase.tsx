import { getTranslations } from "next-intl/server";

export async function HeroShowcase() {
  const t = await getTranslations("showcase");

  return (
    <div className="showcase-wrap">
      <div className="showcase">
        <div className="showcase-dots" aria-hidden />
        <div className="showcase-chrome">
          <span className="showcase-tab active">{t("facts")}</span>
          <span className="showcase-tab">{t("stories")}</span>
          <span className="showcase-tab">{t("validate")}</span>
        </div>
        <div className="showcase-body">
          <div className="showcase-search">{t("search")}</div>
          <div className="showcase-grid">
            <div className="showcase-node">
              brain/facts
              <strong>project.md</strong>
            </div>
            <div className="showcase-node">
              brain/stories
              <strong>routing.md</strong>
            </div>
            <div className="showcase-node">
              brain
              <strong>AGENTS.md</strong>
            </div>
            <div className="showcase-node">
              {t("openQuestions")}
              <strong>[CONFIRM]</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
