"use client";

import { track } from "@vercel/analytics";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { BrainInput } from "@project-brain/core/browser";
import {
  buildBrief,
  buildPackFiles,
  mergeExtractIntoBrain,
  slugify,
  validateBrainInputStrict,
  type WebsiteExtract,
} from "@project-brain/core/browser";
import { SiteNav } from "../components/SiteNav";
import { WizardStepper } from "../components/WizardStepper";
import { canExtractSiteUrl, normalizeSiteUrl } from "@/lib/normalize-site-url";
import {
  defaultWizardState,
  loadWizardSiteUrl,
  loadWizardState,
  saveWizardSiteUrl,
  saveWizardState,
} from "@/lib/wizard-state";

const STEPS = ["Project", "Facts", "Story", "Gaps", "Preview", "Export"] as const;

export default function WizardPage() {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<BrainInput>(defaultWizardState);
  const [issues, setIssues] = useState<string[]>([]);
  const [brief, setBrief] = useState("");
  const [exporting, setExporting] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractNotes, setExtractNotes] = useState<string[]>([]);

  useEffect(() => {
    setInput(loadWizardState());
    setSiteUrl(loadWizardSiteUrl());
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

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const extractReady = canExtractSiteUrl(siteUrl);

  const runExtract = async () => {
    const url = normalizeSiteUrl(siteUrl);
    if (!canExtractSiteUrl(siteUrl)) {
      setIssues(["Paste a public site URL (https://… or auditamia.com/es)."]);
      return;
    }
    setSiteUrl(url);
    saveWizardSiteUrl(url);
    setExtracting(true);
    setExtractNotes([]);
    setIssues([]);
    try {
      const res = await fetch("/api/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as WebsiteExtract & { error?: string };
      if (!res.ok) {
        setIssues([data.error ?? "Extract failed"]);
        return;
      }
      setInput((prev) => mergeExtractIntoBrain(prev, data, "replace"));
      const notes = [...(data.warnings ?? [])];
      if (data.method === "openai") {
        notes.unshift("Analysis enriched with OpenAI (still review before export).");
      } else {
        notes.unshift("Heuristic analysis from page headings and body (not meta alone).");
      }
      setExtractNotes(notes);
      track("wizard_extract", { method: data.method ?? "heuristic" });
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
        setIssues(data.errors ?? ["Export failed"]);
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

  return (
    <div className="page-shell">
      <SiteNav ctaHref="/" ctaLabel="Home" />
      <main className="page-main container-narrow">
        <h1 className="page-title">Brain wizard</h1>
        <p className="page-lead">
          Step by step ground truth for your repo. Export is blocked until required
          fields pass validation.
        </p>
        <WizardStepper steps={STEPS} current={step} onStepChange={setStep} />

        {step === 0 && (
          <div className="card">
            <label htmlFor="site">Public website (for extract)</label>
            <input
              id="site"
              type="text"
              inputMode="url"
              autoComplete="url"
              value={siteUrl}
              onChange={(e) => {
                setSiteUrl(e.target.value);
                saveWizardSiteUrl(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && extractReady && !extracting) {
                  e.preventDefault();
                  void runExtract();
                }
              }}
              placeholder="https://auditamia.com/es or yourproduct.com"
            />
            <p className="field-hint">
              {extractReady
                ? "Ready — we add https:// automatically if you omit it."
                : "Paste a URL above to enable extract."}
            </p>
            <div className="btn-row" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn secondary"
                onClick={runExtract}
                disabled={extracting || !extractReady}
                aria-disabled={extracting || !extractReady}
                title={extractReady ? undefined : "Enter a public website URL first"}
              >
                {extracting ? "Extracting…" : "Extract from website"}
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  const example = "https://auditamia.com/es";
                  setSiteUrl(example);
                  saveWizardSiteUrl(example);
                }}
              >
                Use example URL
              </button>
            </div>
            {extractNotes.length > 0 && (
              <ul className="error" style={{ color: "var(--ink-2)", listStyle: "disc" }}>
                {extractNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
            <label htmlFor="name">Project name</label>
            <input
              id="name"
              value={input.projectName}
              onChange={(e) => update({ projectName: e.target.value })}
              placeholder="My SaaS"
            />
            <label htmlFor="desc">Mission (one or two sentences)</label>
            <textarea
              id="desc"
              value={input.projectDescription}
              onChange={(e) => update({ projectDescription: e.target.value })}
              placeholder="What does this project do?"
            />
            <div className="btn-row">
              <button type="button" className="btn" onClick={next}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="card">
            <p className="page-lead" style={{ marginTop: 0 }}>
              Ground truth facts. The agent must not invent beyond this list.
            </p>
            {input.factBullets.map((fact, i) => (
              <input
                key={`fact-${i}`}
                value={fact}
                onChange={(e) => {
                  const factBullets = [...input.factBullets];
                  factBullets[i] = e.target.value;
                  update({ factBullets });
                }}
                placeholder={`Fact ${i + 1}`}
              />
            ))}
            <button
              type="button"
              className="btn secondary"
              onClick={() => update({ factBullets: [...input.factBullets, ""] })}
            >
              Add fact
            </button>
            <div className="btn-row">
              <button type="button" className="btn secondary" onClick={back}>
                Back
              </button>
              <button type="button" className="btn" onClick={next}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <label htmlFor="stitle">Story title</label>
            <input
              id="stitle"
              value={input.storyTitle}
              onChange={(e) => update({ storyTitle: e.target.value })}
            />
            <label htmlFor="sprob">Problem</label>
            <textarea
              id="sprob"
              value={input.storyProblem}
              onChange={(e) => update({ storyProblem: e.target.value })}
            />
            <label htmlFor="sbuilt">What you built</label>
            <textarea
              id="sbuilt"
              value={input.storyBuilt}
              onChange={(e) => update({ storyBuilt: e.target.value })}
            />
            <label htmlFor="sproof">How you know it works</label>
            <textarea
              id="sproof"
              value={input.storyProof}
              onChange={(e) => update({ storyProof: e.target.value })}
            />
            <div className="btn-row">
              <button type="button" className="btn secondary" onClick={back}>
                Back
              </button>
              <button type="button" className="btn" onClick={next}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card">
            <p className="page-lead" style={{ marginTop: 0 }}>
              Items the agent must not guess. We prefix with [CONFIRM] on export.
            </p>
            {input.openQuestions.map((q, i) => (
              <input
                key={`oq-${i}`}
                value={q}
                onChange={(e) => {
                  const openQuestions = [...input.openQuestions];
                  openQuestions[i] = e.target.value;
                  update({ openQuestions });
                }}
                placeholder="e.g. pricing model"
              />
            ))}
            <button
              type="button"
              className="btn secondary"
              onClick={() => update({ openQuestions: [...input.openQuestions, ""] })}
            >
              Add question
            </button>
            <div className="btn-row">
              <button type="button" className="btn secondary" onClick={back}>
                Back
              </button>
              <button type="button" className="btn" onClick={next}>
                Continue →
              </button>
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
            <h2>File tree</h2>
            <pre className="preview">{treePreview}</pre>
            <h2>brain/AGENTS.md</h2>
            <pre className="preview">{agentsPreview}</pre>
            <div className="btn-row">
              <button type="button" className="btn secondary" onClick={back}>
                Back
              </button>
              <button type="button" className="btn" onClick={next} disabled={!validation.ok}>
                Continue to export →
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="card">
            <p className="page-lead" style={{ marginTop: 0 }}>
              Unzip at your project root. Open in Cursor and read brain/AGENTS.md first.
            </p>
            {issues.length > 0 && (
              <ul className="error">
                {issues.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="btn"
              onClick={runExport}
              disabled={exporting || !validation.ok}
            >
              {exporting
                ? "Building…"
                : `Download ${slugify(input.projectName || "project")}-brain.zip`}
            </button>
            {brief && (
              <>
                <h2 style={{ marginTop: "1.5rem" }}>Context brief</h2>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => navigator.clipboard.writeText(brief)}
                >
                  Copy to clipboard
                </button>
                <pre className="preview">{brief}</pre>
              </>
            )}
            <div className="btn-row">
              <button type="button" className="btn secondary" onClick={back}>
                Back
              </button>
            </div>
          </div>
        )}

        <p className="hero-meta" style={{ marginTop: "2rem" }}>
          Draft saved in this browser only.{" "}
          <Link href="/learn/01-first-brain">Learn more →</Link>
        </p>
      </main>
    </div>
  );
}
