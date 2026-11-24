"use client";

import { track } from "@vercel/analytics";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui-sdk/react/dialog";
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox";
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import { onboardingGuide, onboardingPdfPath } from "@/lib/onboarding-guide";
import { Button } from "@ui-sdk/react/button";
import { SiteButton } from "./ui/site-button";

type Props = {
  source: string;
  appearance?: "card" | "primary" | "secondary";
  label?: string;
};

export function GuideSignup({ source, appearance = "card", label }: Props) {
  const t = useTranslations("guideSignup");
  const locale = useLocale();
  const guide = onboardingGuide(locale);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [mailingList, setMailingList] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const buttonLabel = label ?? t("open");

  function resetForm() {
    setEmail("");
    setMailingList(false);
    setStatus("idle");
    setMessage("");
  }

  function openDialog() {
    resetForm();
    setOpen(true);
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
      setOpen(false);
      resetForm();
    } catch {
      setStatus("error");
      setMessage(t("network"));
    }
  }

  const trigger =
    appearance === "card" ? (
      <Button type="button" className="guide-cta" onClick={openDialog}>
        <span className="guide-cta-kicker">{t("kicker")}</span>
        <span className="guide-cta-title">{buttonLabel}</span>
        <span className="guide-cta-meta">{t("meta")}</span>
      </Button>
    ) : (
      <SiteButton
        variant={appearance === "secondary" ? "secondary" : "primary"}
        onClick={openDialog}
      >
        {buttonLabel}
      </SiteButton>
    );

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : setOpen(false))}>
        <DialogBackdrop />
        <DialogContent className="guide-dialog">
          <form onSubmit={onSubmit}>
            <DialogTitle className="guide-dialog-title">
              {t.rich("ask", { em: (chunks) => <em>{chunks}</em> })}
            </DialogTitle>
            <DialogDescription className="guide-dialog-lead">{t("askLead")}</DialogDescription>
            <Field>
              <FieldLabel>{t("email")}</FieldLabel>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder={t("placeholder")}
                value={email}
                onValueChange={setEmail}
                disabled={status === "loading"}
              />
            </Field>
            <label className="guide-signup-tick">
              <Checkbox
                checked={mailingList}
                onCheckedChange={(checked) => setMailingList(checked === true)}
                disabled={status === "loading"}
              >
                <CheckboxIndicator />
              </Checkbox>
              <span>{t("tick")}</span>
            </label>
            {message ? (
              <p className={`guide-signup-msg${status === "error" ? " is-error" : ""}`} role="status">
                {message}
              </p>
            ) : null}
            <div className="guide-dialog-actions">
              <SiteButton type="submit" variant="primary" disabled={status === "loading"}>
                {status === "loading" ? t("sending") : t("submit")}
              </SiteButton>
              <SiteButton
                type="button"
                variant="secondary"
                disabled={status === "loading"}
                onClick={() => setOpen(false)}
              >
                {t("cancel")}
              </SiteButton>
            </div>
            <FieldDescription className="guide-signup-note">{t("note")}</FieldDescription>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}