"use client";

import { track } from "@vercel/analytics";
import { useLocale, useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { onboardingGuide, onboardingPdfPath } from "@/lib/onboarding-guide";

type Props = {
  source: string;
  appearance?: "card" | "primary" | "secondary";
  label?: string;
};

export function GuideSignup({ source, appearance = "card", label }: Props) {
  const t = useTranslations("guideSignup");
  const locale = useLocale();
  const guide = onboardingGuide(locale);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const emailId = useId();
  const tickId = useId();
  const [email, setEmail] = useState("");
  const [mailingList, setMailingList] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const buttonLabel = label ?? t("open");

  function open() {
    setEmail("");
    setMailingList(false);
    setStatus("idle");
    setMessage("");
    dialogRef.current?.showModal();
    emailRef.current?.focus();
  }

  function close() {
    dialogRef.current?.close();
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mailingList, locale, source }),
      });
      const data = (await res.json()) as { error?: string; mailingList?: boolean };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? t("fallbackError"));
        return;
      }
      track("guide_signup", {
        source,
        mailing: data.mailingList ? "yes" : "no",
      });
      const link = document.createElement("a");
      link.href = onboardingPdfPath(locale);
      link.download = guide.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      close();
    } catch {
      setStatus("error");
      setMessage(t("network"));
    }
  }

  return (
    <>
      {appearance === "card" ? (
        <button type="button" className="guide-cta" onClick={open}>
          <span className="guide-cta-kicker">{t("kicker")}</span>
          <span className="guide-cta-title">{buttonLabel}</span>
          <span className="guide-cta-meta">{t("meta")}</span>
        </button>
      ) : (
        <button
          type="button"
          className={appearance === "secondary" ? "btn secondary" : "btn"}
          onClick={open}
        >
          {buttonLabel}
        </button>
      )}
      <dialog
        ref={dialogRef}
        className="guide-dialog"
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <form onSubmit={onSubmit}>
          <h2 id={titleId}>{t.rich("ask", { em: (chunks) => <em>{chunks}</em> })}</h2>
          <p className="guide-dialog-lead">{t("askLead")}</p>
          <label htmlFor={emailId}>{t("email")}</label>
          <input
            ref={emailRef}
            id={emailId}
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder={t("placeholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={status === "loading"}
          />
          <label className="guide-signup-tick" htmlFor={tickId}>
            <input
              id={tickId}
              type="checkbox"
              name="mailingList"
              checked={mailingList}
              onChange={(event) => setMailingList(event.target.checked)}
              disabled={status === "loading"}
            />
            <span>{t("tick")}</span>
          </label>
          {message ? (
            <p className={`guide-signup-msg${status === "error" ? " is-error" : ""}`} role="status">
              {message}
            </p>
          ) : null}
          <div className="guide-dialog-actions">
            <button type="submit" className="btn" disabled={status === "loading"}>
              {status === "loading" ? t("sending") : t("submit")}
            </button>
            <button type="button" className="btn secondary" onClick={close} disabled={status === "loading"}>
              {t("cancel")}
            </button>
          </div>
          <p className="guide-signup-note">{t("note")}</p>
        </form>
      </dialog>
    </>
  );
}
