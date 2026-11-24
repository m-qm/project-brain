"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

type Copy = {
  cta: string;
  phoneLabel: string;
  placeholder: string;
  invalid: string;
  opening: string;
};

export function StartOnWhatsApp({ copy }: { copy: Copy }) {
  const locale = useLocale();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/whatsapp/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, locale }),
      });
      const data = (await res.json()) as { waUrl?: string; error?: string };
      if (!res.ok || !data.waUrl) {
        setError(copy.invalid);
        setPending(false);
        return;
      }
      window.location.assign(data.waUrl);
    } catch {
      setError(copy.invalid);
      setPending(false);
    }
  }

  return (
    <form className="wa-start" onSubmit={onSubmit}>
      <label className="wa-start-label" htmlFor="wa-phone">
        {copy.phoneLabel}
      </label>
      <input
        id="wa-phone"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={copy.placeholder}
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        required
      />
      {error ? <p className="wa-start-error">{error}</p> : null}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? copy.opening : copy.cta}
      </button>
    </form>
  );
}
