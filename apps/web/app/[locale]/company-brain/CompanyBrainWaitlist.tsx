"use client";

import { track } from "@vercel/analytics";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const SETUP_CALL_URL =
  process.env.NEXT_PUBLIC_SETUP_CALL_URL?.trim() || "mailto:hello@agentkbase.com?subject=Company%20Brain%20setup";

type Props = {
  source: string;
};

export function CompanyBrainWaitlist({ source }: Props) {
  const t = useTranslations("waitlist");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    track("company_brain_view", { source });
  }, [source]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await res.json()) as {
        error?: string;
        stored?: boolean;
        subscriberNotified?: boolean;
      };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? t("fallbackError"));
        return;
      }
      track("company_brain_waitlist", {
        source,
        stored: data.stored ? "resend" : "none",
        confirmation: data.subscriberNotified ? "yes" : "no",
      });
      setStatus("ok");
      setMessage(data.subscriberNotified ? t("okConfirmed") : t("okPending"));
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(t("network"));
    }
  }

  return (
    <div className="company-brain-cta">
      <form className="company-brain-form" onSubmit={onSubmit}>
        <label htmlFor="waitlist-email" className="company-brain-form-label">
          {t("label")}
        </label>
        <div className="company-brain-form-row">
          <input
            id="waitlist-email"
            type="email"
            autoComplete="email"
            required
            placeholder={t("placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
          />
          <button type="submit" className="btn" disabled={status === "loading"}>
            {status === "loading" ? t("sending") : t("join")}
          </button>
        </div>
        {message && (
          <p className={`company-brain-form-msg${status === "error" ? " company-brain-form-msg--error" : ""}`}>
            {message}
          </p>
        )}
      </form>
      <a
        className="btn secondary company-brain-setup-call"
        href={SETUP_CALL_URL}
        onClick={() => track("company_brain_setup_call", { source })}
      >
        {t("book")}
      </a>
    </div>
  );
}
