"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  EXTRACT_DEMO_INPUT,
  layoutBrainTree,
  treeFromWizard,
  type TreeDomain,
} from "@/lib/brain-tree-data";
import { loadWizardState } from "@/lib/wizard-state";
import { BrainTreeGraphSvg } from "./BrainTreeGraphSvg";
import { BrainTreeGraphGLErrorBoundary } from "./BrainTreeGraphGLErrorBoundary";

const BrainTreeGraphGL = dynamic(
  () => import("./BrainTreeGraphGL").then((m) => m.BrainTreeGraphGL),
  {
    ssr: false,
    loading: () => (
      <div className="brain-tree-gl brain-tree-gl--loading" aria-hidden>
        <span className="brain-tree-gl-shimmer" />
      </div>
    ),
  },
);

export type BrainTreeGraphProps = {
  live?: boolean;
  extractDemo?: boolean;
  highlightDomains?: string[];
  className?: string;
  centerLabel?: string;
  domains?: TreeDomain[];
  /** Force SVG (e.g. reduced motion). */
  preferSvg?: boolean;
};

export function BrainTreeGraph({
  live = false,
  extractDemo = false,
  highlightDomains = [],
  className = "",
  centerLabel: centerLabelProp,
  domains: domainsProp,
  preferSvg = false,
}: BrainTreeGraphProps) {
  const t = useTranslations("story");
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [useSvg, setUseSvg] = useState(preferSvg);

  const [liveTree, setLiveTree] = useState(() => {
    if (extractDemo) return treeFromWizard(EXTRACT_DEMO_INPUT);
    return treeFromWizard(null);
  });
  const [liveReady, setLiveReady] = useState(!live);

  useEffect(() => {
    if (preferSvg) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setUseSvg(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [preferSvg]);

  useEffect(() => {
    if (!live) return;
    const refresh = () => {
      setLiveTree(treeFromWizard(loadWizardState()));
      setLiveReady(true);
    };
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key?.includes("project-brain-wizard")) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("project-brain-wizard-save", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("project-brain-wizard-save", refresh);
    };
  }, [live]);

  const centerLabel = centerLabelProp ?? liveTree.center;
  const domains = domainsProp ?? liveTree.domains;
  const { nodes, edges } = useMemo(() => layoutBrainTree(domains), [domains]);

  const graphClass = [
    "brain-tree-graph",
    extractDemo ? "brain-tree-graph--extract" : "",
    useSvg ? "brain-tree-graph--svg" : "brain-tree-graph--gl",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <figure className={graphClass} aria-label={t("mapLabel")}>
      {useSvg ? (
        <BrainTreeGraphSvg
          nodes={nodes}
          edges={edges}
          centerLabel={centerLabel}
          extractDemo={extractDemo}
          highlightDomains={highlightDomains}
          activeDomain={activeDomain}
          onActiveDomain={setActiveDomain}
          live={live}
          liveReady={liveReady}
        />
      ) : (
        <BrainTreeGraphGLErrorBoundary
          fallback={
            <BrainTreeGraphSvg
              nodes={nodes}
              edges={edges}
              centerLabel={centerLabel}
              extractDemo={extractDemo}
              highlightDomains={highlightDomains}
              activeDomain={activeDomain}
              onActiveDomain={setActiveDomain}
              live={live}
              liveReady={liveReady}
            />
          }
        >
          <BrainTreeGraphGL
            layoutNodes={nodes}
            layoutEdges={edges}
            centerLabel={centerLabel}
            extractDemo={extractDemo}
            highlightDomains={highlightDomains}
          />
        </BrainTreeGraphGLErrorBoundary>
      )}
      {live && liveReady && liveTree.isLive && (
        <figcaption className="brain-tree-caption live">{t("synced")}</figcaption>
      )}
      {!live && extractDemo && (
        <figcaption className="brain-tree-caption extract">
          {t("sample")} <Link href="/wizard">{t("tryUrl")}</Link>
        </figcaption>
      )}
      {!live && !extractDemo && (
        <figcaption className="brain-tree-caption">
          {t("demo")} <Link href="/wizard">{t("demoLink")}</Link> {t("demoRest")}
        </figcaption>
      )}
    </figure>
  );
}
