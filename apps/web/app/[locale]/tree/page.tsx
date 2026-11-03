"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrainTreeGraph } from "../../components/BrainTreeGraph";
import { SiteNav } from "../../components/SiteNav";
import { loadWizardState } from "@/lib/wizard-state";
import { treeFromWizard } from "@/lib/brain-tree-data";

export default function TreePage() {
  const t = useTranslations("tree");
  const [live, setLive] = useState(true);
  const preview = treeFromWizard(live ? loadWizardState() : null);

  return (
    <div className="page-shell">
      <SiteNav ctaHref="/wizard" ctaLabel={t("cta")} />
      <main className="page-main container">
        <div className="tree-page-header">
          <div>
            <h1 className="page-title">{t("title")}</h1>
            <p className="page-lead" style={{ marginBottom: "1rem" }}>
              {t("lead")}
            </p>
            <label className="tree-toggle">
              <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
              {t("toggle")}
            </label>
            {!preview.isLive && live && (
              <p className="tree-empty-hint">
                {t("empty")} <Link href="/wizard">{t("fill")}</Link> {t("orDemo")}
              </p>
            )}
          </div>
          <Link className="btn secondary" href="/#how-it-works">
            {t("story")}
          </Link>
        </div>
        <div className="tree-page-canvas">
          <BrainTreeGraph live={live} />
        </div>
      </main>
    </div>
  );
}
