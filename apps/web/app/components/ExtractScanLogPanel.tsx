"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export type ScanLogEntry = {
  step: string;
  message: string;
  usedLlm: boolean;
  llmProvider?: string;
};

const STEP_KEYS: Record<string, "fetch" | "discover" | "plan" | "merge" | "draft" | "enrich"> = {
  fetch: "fetch",
  discover: "discover",
  llm_plan: "plan",
  merge: "merge",
  heuristic: "draft",
  llm_enrich: "enrich",
};

type Props = {
  entries: ScanLogEntry[];
  loading: boolean;
};

export function ExtractScanLogPanel({ entries, loading }: Props) {
  const t = useTranslations("wizard");
  const placeholders = [t("placeholderFetch"), t("placeholderDiscover"), t("placeholderMerge")];
  const [visibleCount, setVisibleCount] = useState(0);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (entries.length === 0) {
      setVisibleCount(0);
      return;
    }
    setRunId((n) => n + 1);
    setVisibleCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    entries.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleCount(i + 1);
        }, 160 + i * 240),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [entries]);

  if (!loading && entries.length === 0) return null;

  const visible = entries.slice(0, visibleCount);
  const complete = !loading && visibleCount >= entries.length && entries.length > 0;

  return (
    <div
      className={`extract-scan-log${loading ? " extract-scan-log--loading" : ""}${complete ? " extract-scan-log--complete" : ""}`}
      aria-live="polite"
      aria-busy={loading || visibleCount < entries.length}
    >
      <div className="extract-scan-log-header">
        <p className="extract-scan-log-title">{t("scanLog")}</p>
        {loading && entries.length === 0 && (
          <span className="extract-scan-pulse">{t("scanning")}</span>
        )}
        {complete && <span className="extract-scan-done">{t("scanDone")}</span>}
      </div>

      <ol className="extract-scan-timeline" key={runId}>
        {loading && entries.length === 0 &&
          placeholders.map((label, i) => (
            <li
              key={label}
              className="extract-scan-item extract-scan-item--placeholder"
              style={{ animationDelay: `${i * 0.35}s` }}
            >
              <span className="extract-scan-dot" aria-hidden />
              <div className="extract-scan-body">
                <span className="extract-scan-step-name">{label}</span>
                <span className="extract-scan-shimmer" />
              </div>
            </li>
          ))}

        {visible.map((entry, i) => (
          <li
            key={`${entry.step}-${i}-${entry.message.slice(0, 24)}`}
            className="extract-scan-item extract-scan-item--in"
            style={{ animationDelay: "0ms" }}
          >
            <span
              className={`extract-scan-dot${entry.usedLlm ? " extract-scan-dot--llm" : ""}`}
              aria-hidden
            />
            <div className="extract-scan-body">
              <div className="extract-scan-meta">
                <span className="extract-scan-step-name">
                  {STEP_KEYS[entry.step] ? t(STEP_KEYS[entry.step]) : entry.step}
                </span>
                <span
                  className={
                    entry.usedLlm ? "extract-scan-badge extract-scan-badge--llm" : "extract-scan-badge"
                  }
                >
                  {entry.usedLlm
                    ? entry.llmProvider === "openai"
                      ? "OpenAI"
                      : entry.llmProvider === "anthropic"
                        ? "Anthropic"
                        : "LLM"
                    : t("noLlm")}
                </span>
              </div>
              <p className="extract-scan-msg">{entry.message}</p>
            </div>
          </li>
        ))}

        {loading && entries.length > 0 && visibleCount < entries.length && (
          <li className="extract-scan-item extract-scan-item--placeholder extract-scan-item--tail">
            <span className="extract-scan-dot extract-scan-dot--pulse" aria-hidden />
            <span className="extract-scan-step-name">{t("nextStep")}</span>
          </li>
        )}
      </ol>
    </div>
  );
}
