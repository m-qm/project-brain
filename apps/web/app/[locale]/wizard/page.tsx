"use client";

import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { BrainInput } from "@agentkbase/core/browser";
import {
  buildBrief,
  buildPackFiles,
  mergeExtractIntoBrain,
  slugify,
  validateBrainInputStrict,
  type WebsiteExtract,
} from "@agentkbase/core/browser";
import { ExtractScanLogPanel } from "../../components/ExtractScanLogPanel";
import { SiteNav } from "../../components/SiteNav";
import { WizardStepper } from "../../components/WizardStepper";
import { canExtractSiteUrl, normalizeSiteUrl } from "@/lib/normalize-site-url";
import {
  CLI_LLM_EXTRACT_HINT,
  CLI_LLM_GAP_HINT,
  wizardHostedLlmEnabled,
} from "@/lib/wizard-llm-ui";
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox";
import { Field, FieldLabel } from "@ui-sdk/react/field";
import { SiteButton } from "../../components/ui/site-button";
import { SiteInput, SiteTextarea } from "../../components/ui/site-text-control";
import {
  defaultWizardState,
  loadWizardHostedProfileId,
  loadWizardSiteUrl,
  loadWizardState,
  saveWizardHostedProfileId,
  saveWizardSiteUrl,
  saveWizardState,
} from "@/lib/wizard-state";

export default function WizardPage() {
  const t = useTranslations("wizard");
  const steps = [
    t("steps.project"),
    t("steps.facts"),
    t("steps.story"),
    t("steps.gaps"),
    t("steps.preview"),
    t("steps.export"),
  ];
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<BrainInput>(defaultWizardState);
  const [issues, setIssues] = useState<string[]>([]);
  const [brief, setBrief] = useState("");
  const [exporting, setExporting] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractNotes, setExtractNotes] = useState<string[]>([]);
  const [extractScanLog, setExtractScanLog] = useState<
    { step: string; message: string; usedLlm: boolean; llmProvider?: string }[]
  >([]);
  const [extractMode, setExtractMode] = useState<"single" | "multipage" | "deep">("single");
  const [gapSuggestions, setGapSuggestions] = useState<
    { question: string; draftAnswer: string; source: string }[]
  >([]);
  const [gapNotes, setGapNotes] = useState<string[]>([]);
  const [gapLoading, setGapLoading] = useState(false);
  const [hostedProfileId, setHostedProfileId] = useState("");
  const [hosting, setHosting] = useState(false);

  useEffect(() => {
    setInput(loadWizardState());
    setSiteUrl(loadWizardSiteUrl());
    setHostedProfileId(loadWizardHostedProfileId());
  }, []);

  useEffect(() => {
    saveWizardState(input);
  }, [input]);

  const validation = useMemo(() => validateBrainInputStrict(input), [input]);

  const agentsPreview = useMemo(() => {
    const files = buildPackFiles(input);
    return files.find((f) => f.path === "brain/AGENTS.md")?.content ?? "";
  }, [input]);

  const treePreview = useMemo(
    () => buildPackFiles(input).map((f) => f.path).join("\n"),
    [input],
  );

  const update = useCallback((patch: Partial<BrainInput>) => {
    setInput((prev) => ({ ...prev, ...patch }));
  }, []);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const extractReady = canExtractSiteUrl(siteUrl);

  const runExtract = async () => {
    const url = normalizeSiteUrl(siteUrl);
    if (!canExtractSiteUrl(siteUrl)) {
      setIssues([t("badUrl")]);
      return;
    }
    setSiteUrl(url);
    saveWizardSiteUrl(url);
    setExtracting(true);
    setExtractNotes([]);
    setExtractScanLog([]);
    setIssues([]);
    try {
      const res = await fetch("/api/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode: extractMode }),
      });
      const data = (await res.json()) as WebsiteExtract & { error?: string };
      if (!res.ok) {
        setIssues([data.error ?? t("extractFailed")]);
        return;
      }
      setInput((prev) => mergeExtractIntoBrain(prev, data, "replace"));
      const notes = [...(data.warnings ?? [])];
      if (data.method === "anthropic") {
        notes.unshift(t("noteAnthropic"));
      } else if (data.method === "openai") {
        notes.unshift(t("noteOpenai"));
      } else {
        notes.unshift(t("noteHeuristic"));
      }
      setExtractNotes(notes);
      setExtractScanLog(data.scanLog ?? []);
      track("wizard_extract", {
        method: data.method ?? "heuristic",
        scanMode: data.scanMode ?? "single",
      });
    } finally {
      setExtracting(false);
    }
  };

  const runExport = async () => {
    const v = validateBrainInputStrict(input);
    if (!v.ok) {
      setIssues(v.issues.filter((i) => i.level === "error").map((i) => i.message));
      return;
    }
    setExporting(true);
    setIssues([]);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = (await res.json()) as { errors?: string[] };
        setIssues(data.errors ?? [t("exportFailed")]);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slugify(input.projectName || "project")}-brain.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setBrief(buildBrief(input));
      track("wizard_export");
    } finally {
      setExporting(false);
    }
  };

  const runSaveHosted = async () => {
    const v = validateBrainInputStrict(input);
    if (!v.ok) {
      setIssues(v.issues.filter((i) => i.level === "error").map((i) => i.message));
      return;
    }
    setHosting(true);
    setIssues([]);
    try {
      const res = await fetch("/api/hosted-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brain: input,
          sourceUrl: siteUrl.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { profileId?: string; errors?: string[]; error?: string };
      if (!res.ok) {
        setIssues(data.errors ?? (data.error ? [data.error] : [t("hostFailed")]));
        return;
      }
      const id = data.profileId ?? "";
      setHostedProfileId(id);
      saveWizardHostedProfileId(id);
      track("wizard_hosted_save");
    } finally {
      setHosting(false);
    }
  };

  const claudeSnippet = hostedProfileId
    ? t("claudeSnippet", { id: hostedProfileId })
    : "";

  return (
    <div className="page-shell">
      <SiteNav hideCta />
      <main className="page-main container-narrow">
        <h1 className="page-title">{t("title")}</h1>
        <p className="page-lead">{t("lead")}</p>
        <WizardStepper steps={steps} current={step} onStepChange={setStep} />

        {step === 0 && (
          <div className="card">
            <Field>
              <FieldLabel htmlFor="site">{t("siteLabel")}</FieldLabel>
              <SiteInput
                id="site"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={siteUrl}
                onValueChange={(value) => {
                  setSiteUrl(value);
                  saveWizardSiteUrl(value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && extractReady && !extracting) {
                    e.preventDefault();
                    void runExtract();
                  }
                }}
                placeholder={t("sitePlaceholder")}
              />
            </Field>
            <p className="field-hint">
              {extractReady ? t("ready") : t("needUrl")}
            </p>
            <fieldset className="extract-mode-field">
              <legend className="extract-mode-legend">{t("scope")}</legend>
              <div className="extract-mode-list">
                <label
                  className={`extract-mode-option${
                    extractMode === "multipage" || extractMode === "deep"
                      ? " extract-mode-option--on"
                      : ""
                  }`}
                >
                  <Checkbox
                    className="extract-mode-input"
                    checked={extractMode === "multipage" || extractMode === "deep"}
                    onCheckedChange={(checked) => setExtractMode(checked === true ? "multipage" : "single")}
                  >
                    <CheckboxIndicator />
                  </Checkbox>
                  <span className="extract-mode-control" aria-hidden />
                  <span className="extract-mode-copy">
                    <span className="extract-mode-title">{t("scanTitle")}</span>
                    <span className="extract-mode-desc">{t("scanDesc")}</span>
                  </span>
                </label>
                {wizardHostedLlmEnabled ? (
                  <label
                    className={`extract-mode-option extract-mode-option--nested${
                      extractMode === "deep" ? " extract-mode-option--on" : ""
                    }${extractMode === "single" ? " extract-mode-option--disabled" : ""}`}
                  >
                    <Checkbox
                      className="extract-mode-input"
                      checked={extractMode === "deep"}
                      onCheckedChange={(checked) => setExtractMode(checked === true ? "deep" : "multipage")}
                      disabled={extractMode === "single"}
                    >
                      <CheckboxIndicator />
                    </Checkbox>
                    <span className="extract-mode-control" aria-hidden />
                    <span className="extract-mode-copy">
                      <span className="extract-mode-title">{t("deepTitle")}</span>
                      <span className="extract-mode-desc">{t("deepDesc")}</span>
                    </span>
                    <span className="extract-mode-badge">{t("llmBadge")}</span>
                  </label>
                ) : (
                  <div className="extract-mode-callout">
                    <p className="extract-mode-callout-title">{t("claudeTitle")}</p>
                    <p className="extract-mode-callout-body">{t("claudeBody")}</p>
                    <code className="extract-mode-callout-code">{CLI_LLM_EXTRACT_HINT}</code>
                    <p className="extract-mode-callout-body">{t("orCli")}</p>
                  </div>
                )}
              </div>
            </fieldset>
            <div className="btn-row" style={{ marginTop: 0 }}>
              <SiteButton
                type="button"
                variant="primary"
                onClick={runExtract}
                disabled={extracting || !extractReady}
                title={extractReady ? undefined : t("needUrlFirst")}
              >
                {extracting ? t("extracting") : t("extract")}
              </SiteButton>
            </div>
            <ExtractScanLogPanel entries={extractScanLog} loading={extracting} />
            {extractNotes.length > 0 && (
              <ul className="error" style={{ color: "var(--ink-2)", listStyle: "disc" }}>
                {extractNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
            <Field>
              <FieldLabel htmlFor="name">{t("projectName")}</FieldLabel>
              <SiteInput
                id="name"
                value={input.projectName}
                onValueChange={(value) => update({ projectName: value })}
                placeholder={t("projectPlaceholder")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="desc">{t("mission")}</FieldLabel>
              <SiteTextarea
                id="desc"
                value={input.projectDescription}
                onValueChange={(value) => update({ projectDescription: value })}
                placeholder={t("missionPlaceholder")}
              />
            </Field>
            <div className="btn-row">
              <SiteButton type="button" variant="primary" onClick={next}>
                {t("continue")}
              </SiteButton>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="card">
            <p className="page-lead" style={{ marginTop: 0 }}>
              {t("factsLead")}
            </p>
            {input.factBullets.map((fact, i) => (
              <SiteInput
                key={`fact-${i}`}
                value={fact}
                onValueChange={(value) => {
                  const factBullets = [...input.factBullets];
                  factBullets[i] = value;
                  update({ factBullets });
                }}
                placeholder={t("factPlaceholder", { n: i + 1 })}
              />
            ))}
            <SiteButton
              type="button"
              variant="secondary"
              onClick={() => update({ factBullets: [...input.factBullets, ""] })}
            >
              {t("addFact")}
            </SiteButton>
            <div className="btn-row">
              <SiteButton type="button" variant="secondary" onClick={back}>
                {t("back")}
              </SiteButton>
              <SiteButton type="button" variant="primary" onClick={next}>
                {t("continue")}
              </SiteButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <Field>
              <FieldLabel htmlFor="stitle">{t("storyTitle")}</FieldLabel>
              <SiteInput
                id="stitle"
                value={input.storyTitle}
                onValueChange={(value) => update({ storyTitle: value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="sprob">{t("problem")}</FieldLabel>
              <SiteTextarea
                id="sprob"
                value={input.storyProblem}
                onValueChange={(value) => update({ storyProblem: value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="sbuilt">{t("built")}</FieldLabel>
              <SiteTextarea
                id="sbuilt"
                value={input.storyBuilt}
                onValueChange={(value) => update({ storyBuilt: value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="sproof">{t("proof")}</FieldLabel>
              <SiteTextarea
                id="sproof"
                value={input.storyProof}
                onValueChange={(value) => update({ storyProof: value })}
              />
            </Field>
            <div className="btn-row">
              <SiteButton type="button" variant="secondary" onClick={back}>
                {t("back")}
              </SiteButton>
              <SiteButton type="button" variant="primary" onClick={next}>
                {t("continue")}
              </SiteButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card">
            <p className="page-lead" style={{ marginTop: 0 }}>
              {t("gapsLead")}
            </p>
            {input.openQuestions.map((q, i) => (
              <SiteInput
                key={`oq-${i}`}
                value={q}
                onValueChange={(value) => {
                  const openQuestions = [...input.openQuestions];
                  openQuestions[i] = value;
                  update({ openQuestions });
                }}
                placeholder={t("gapPlaceholder")}
              />
            ))}
            <SiteButton
              type="button"
              variant="secondary"
              onClick={() => update({ openQuestions: [...input.openQuestions, ""] })}
            >
              {t("addQuestion")}
            </SiteButton>
            {!wizardHostedLlmEnabled && (
              <div className="extract-mode-callout" style={{ marginTop: "0.75rem" }}>
                <p className="extract-mode-callout-title">{t("draftTitle")}</p>
                <p className="extract-mode-callout-body">{t("draftBody")}</p>
                <code className="extract-mode-callout-code">{CLI_LLM_GAP_HINT}</code>
              </div>
            )}
            <div className="btn-row">
              <SiteButton
                type="button"
                variant="secondary"
                disabled={gapLoading || !wizardHostedLlmEnabled}
                title={wizardHostedLlmEnabled ? undefined : t("gapDisabled")}
                onClick={async () => {
                  setGapLoading(true);
                  setGapNotes([]);
                  setGapSuggestions([]);
                  try {
                    const res = await fetch("/api/fill-gaps", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(input),
                    });
                    const data = (await res.json()) as {
                      suggestions?: typeof gapSuggestions;
                      warnings?: string[];
                      error?: string;
                    };
                    if (!res.ok) {
                      setGapNotes([data.error ?? t("gapFailed")]);
                      return;
                    }
                    setGapSuggestions(data.suggestions ?? []);
                    setGapNotes(data.warnings ?? []);
                    track("wizard_fill_gaps");
                  } finally {
                    setGapLoading(false);
                  }
                }}
              >
                {gapLoading ? t("suggesting") : t("suggest")}
              </SiteButton>
            </div>
            {gapNotes.length > 0 && (
              <ul className="error" style={{ color: "var(--ink-2)", listStyle: "disc" }}>
                {gapNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
            {gapSuggestions.length > 0 && (
              <ul className="gap-suggest-list">
                {gapSuggestions.map((s) => (
                  <li key={s.question}>
                    <strong>{s.question}</strong>
                    <p>{s.draftAnswer}</p>
                    <span className="field-hint">{t("source", { source: s.source })}</span>
                    <SiteButton
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        const openQuestions = [...input.openQuestions];
                        const idx = openQuestions.findIndex(
                          (q) => q.trim() === s.question.trim() || q.includes(s.question.slice(0, 20)),
                        );
                        const line = `[CONFIRM] ${s.draftAnswer}`;
                        if (idx >= 0) openQuestions[idx] = line;
                        else openQuestions.push(line);
                        update({ openQuestions });
                      }}
                    >
                      {t("apply")}
                    </SiteButton>
                  </li>
                ))}
              </ul>
            )}
            <div className="btn-row">
              <SiteButton type="button" variant="secondary" onClick={back}>
                {t("back")}
              </SiteButton>
              <SiteButton type="button" variant="primary" onClick={next}>
                {t("continue")}
              </SiteButton>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="card">
            {!validation.ok && (
              <ul className="error">
                {validation.issues
                  .filter((i) => i.level === "error")
                  .map((i) => (
                    <li key={i.message}>{i.message}</li>
                  ))}
              </ul>
            )}
            <h2>{t("fileTree")}</h2>
            <pre className="preview">{treePreview}</pre>
            <h2>brain/AGENTS.md</h2>
            <pre className="preview">{agentsPreview}</pre>
            <div className="btn-row">
              <SiteButton type="button" variant="secondary" onClick={back}>
                {t("back")}
              </SiteButton>
              <SiteButton type="button" variant="primary" onClick={next} disabled={!validation.ok}>
                {t("continueExport")}
              </SiteButton>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="card">
            <p className="page-lead" style={{ marginTop: 0 }}>
              {t("exportLead")}
            </p>
            {issues.length > 0 && (
              <ul className="error">
                {issues.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
            <SiteButton
              type="button"
              variant="primary"
              onClick={runExport}
              disabled={exporting || !validation.ok}
            >
              {exporting
                ? t("building")
                : t("download", { name: slugify(input.projectName || "project") })}
            </SiteButton>
            <p className="field-hint" style={{ marginTop: "1rem" }}>
              {t("exportAlso")}
            </p>
            <SiteButton
              type="button"
              variant="secondary"
              onClick={runSaveHosted}
              disabled={hosting || !validation.ok}
            >
              {hosting ? t("hosting") : t("saveOnline")}
            </SiteButton>
            {hostedProfileId && (
              <div className="hosted-card">
                <p className="field-hint">{t("sheetId")}</p>
                <code className="hosted-id">{hostedProfileId}</code>
                <div className="btn-row" style={{ marginTop: "0.75rem" }}>
                  <SiteButton
                    type="button"
                    variant="ghost"
                    onClick={() => navigator.clipboard.writeText(hostedProfileId)}
                  >
                    {t("copyId")}
                  </SiteButton>
                  <SiteButton variant="ghost" href={`/check?id=${encodeURIComponent(hostedProfileId)}`}>
                    {t("openCheck")}
                  </SiteButton>
                </div>
                <p className="field-hint">{t("checkHint")}</p>
                <SiteButton type="button" variant="ghost" onClick={() => navigator.clipboard.writeText(claudeSnippet)}>
                  {t("copyClaude")}
                </SiteButton>
                <pre className="preview hosted-snippet">{claudeSnippet}</pre>
              </div>
            )}
            {brief && (
              <>
                <h2 style={{ marginTop: "1.5rem" }}>{t("brief")}</h2>
                <SiteButton type="button" variant="secondary" onClick={() => navigator.clipboard.writeText(brief)}>
                  {t("copy")}
                </SiteButton>
                <pre className="preview">{brief}</pre>
              </>
            )}
            <div className="btn-row">
              <SiteButton type="button" variant="secondary" onClick={back}>
                {t("back")}
              </SiteButton>
            </div>
          </div>
        )}

        <p className="hero-meta" style={{ marginTop: "2rem" }}>
          {t("saved")}
        </p>
      </main>
    </div>
  );
}
