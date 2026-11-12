"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { buildPublishCheckCard, type PublishCheckCard } from "@/lib/publish-check-card";
import {
  loadWizardHostedProfileId,
  saveWizardHostedProfileId,
} from "@/lib/wizard-state";

export function PublishCheckForm() {
  const t = useTranslations("check");
  const locale = useLocale() as "en" | "es";
  const searchParams = useSearchParams();
  const [profileId, setProfileId] = useState("");
  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [card, setCard] = useState<PublishCheckCard | null>(null);

  useEffect(() => {
    const fromQuery = searchParams.get("id")?.trim() ?? "";
    const fromStorage = loadWizardHostedProfileId();
    setProfileId(fromQuery || fromStorage);
  }, [searchParams]);

  const onProfileBlur = useCallback(() => {
    if (profileId.trim()) saveWizardHostedProfileId(profileId.trim());
  }, [profileId]);

  const runCheck = async () => {
    const id = profileId.trim();
    const text = draft.trim();
    if (!id) {
      setError(t("needProfile"));
      return;
    }
    if (!text) {
      setError(t("needDraft"));
      return;
    }
    setLoading(true);
    setError("");
    setCard(null);
    saveWizardHostedProfileId(id);
    try {
      const res = await fetch("/api/eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: id,
          draft: text,
          title: title.trim() || undefined,
          checks: "all",
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        issues?: import("@agentkbase/core").DraftEvalIssue[];
        error?: string;
        errors?: string[];
      };
      if (!res.ok) {
        setError(data.error ?? data.errors?.join(" ") ?? t("checkFailed"));
        return;
      }
      setCard(buildPublishCheckCard(Boolean(data.ok), data.issues ?? [], locale));
    } catch {
      setError(t("checkFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card check-form">
      <p className="field-hint">{t("profileHint")}</p>
      <label htmlFor="check-profile">{t("profileLabel")}</label>
      <input
        id="check-profile"
        type="text"
        className="check-input"
        value={profileId}
        onChange={(e) => setProfileId(e.target.value)}
        onBlur={onProfileBlur}
        placeholder={t("profilePlaceholder")}
        autoComplete="off"
        spellCheck={false}
      />
      <p className="field-hint">
        {t("noProfile")}{" "}
        <Link href="/wizard">
          {t("wizardLink")}
        </Link>
      </p>

      <label htmlFor="check-title">{t("titleLabel")}</label>
      <input
        id="check-title"
        type="text"
        className="check-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("titlePlaceholder")}
      />

      <label htmlFor="check-draft">{t("draftLabel")}</label>
      <textarea
        id="check-draft"
        className="check-textarea"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={t("draftPlaceholder")}
        rows={12}
      />

      {error && (
        <ul className="error">
          <li>{error}</li>
        </ul>
      )}

      <div className="btn-row">
        <button type="button" className="btn" onClick={runCheck} disabled={loading}>
          {loading ? t("checking") : t("run")}
        </button>
      </div>

      {card && (
        <div
          className={`check-verdict check-verdict--${card.verdict}`}
          role="status"
          aria-live="polite"
        >
          <p className="check-verdict-label">
            {card.verdict === "ready" ? t("green") : t("red")}
          </p>
          <p className="check-verdict-headline">{card.headline}</p>
          {card.issues.length > 0 && (
            <ul className="check-issue-list">
              {card.issues.map((issue) => (
                <li key={`${issue.label}-${issue.detail.slice(0, 40)}`}>
                  <strong>{issue.label}</strong>
                  <p>{issue.detail}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="field-hint">{t("stillYou")}</p>
        </div>
      )}
    </div>
  );
}
