import { getTranslations } from "next-intl/server";
import { SiteButton } from "../components/ui/site-button";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="page-shell">
      <main className="page-main container-narrow" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <h1 className="page-title">{t("title")}</h1>
        <p className="page-lead">{t("lead")}</p>
        <SiteButton href="/" variant="primary">
          {t("home")}
        </SiteButton>
      </main>
    </div>
  );
}
