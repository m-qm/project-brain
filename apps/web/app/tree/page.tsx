"use client";

import { useState } from "react";
import Link from "next/link";
import { BrainTreeGraph } from "../components/BrainTreeGraph";
import { SiteNav } from "../components/SiteNav";
import { loadWizardState } from "@/lib/wizard-state";
import { treeFromWizard } from "@/lib/brain-tree-data";

export default function TreePage() {
  const [live, setLive] = useState(true);
  const preview = treeFromWizard(live ? loadWizardState() : null);

  return (
    <div className="page-shell">
      <SiteNav ctaHref="/wizard" ctaLabel="Wizard" />
      <main className="page-main container">
        <div className="tree-page-header">
          <div>
            <h1 className="page-title">Brain map</h1>
            <p className="page-lead" style={{ marginBottom: "1rem" }}>
              Real radial layout: one center node, eight spokes, three leaves each. Hover to
              highlight a domain. Toggle live data from your wizard draft.
            </p>
            <label className="tree-toggle">
              <input
                type="checkbox"
                checked={live}
                onChange={(e) => setLive(e.target.checked)}
              />
              Use wizard draft from this browser
            </label>
            {!preview.isLive && live && (
              <p className="tree-empty-hint">
                No wizard draft yet.{" "}
                <Link href="/wizard">Fill the wizard</Link> or turn off live mode for the demo
                map.
              </p>
            )}
          </div>
          <Link className="btn secondary" href="/#how-it-works">
            Read the story →
          </Link>
        </div>
        <div className="tree-page-canvas">
          <BrainTreeGraph live={live} />
        </div>
      </main>
    </div>
  );
}
