import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="page-shell">
      <main className="page-main container-narrow" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <h1 className="page-title">{t("title")}</h1>
        <p className="page-lead">{t("lead")}</p>
        <Link className="btn" href="/">
          {t("home")}
        </Link>
      </main>
    </div>
  );
}
