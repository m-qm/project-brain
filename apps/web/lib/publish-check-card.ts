import type { DraftEvalIssue } from "@agentkbase/core";

export type PublishCheckVerdict = "ready" | "stop";

export type PublishCheckCard = {
  verdict: PublishCheckVerdict;
  headline: string;
  issues: { label: string; detail: string }[];
};

const ISSUE_LABELS: Record<string, { en: string; es: string }> = {
  invented_price: {
    en: "Price not in your company sheet",
    es: "Precio que no está en tu ficha",
  },
  linkedin_new_price: {
    en: "Caption invents a price",
    es: "La caption inventa un precio",
  },
  builder_title: {
    en: "Title sounds like a tech tutorial, not your business",
    es: "El título suena a tutorial técnico, no a tu negocio",
  },
  invented_proof: {
    en: "Proof (ranking, clients, visits) not in your sheet",
    es: "Prueba social (ranking, clientes, visitas) no está en la ficha",
  },
  missing_sources: {
    en: "Missing Sources section with a link or file",
    es: "Falta sección Fuentes con enlace o archivo",
  },
  unsafe_cta: {
    en: "Unsafe call to action (invoice, password, personal phone)",
    es: "Llamada a la acción insegura (factura, contraseña, móvil personal)",
  },
};

export function buildPublishCheckCard(
  ok: boolean,
  issues: DraftEvalIssue[],
  locale: "en" | "es",
): PublishCheckCard {
  const lang = locale === "es" ? "es" : "en";
  if (ok) {
    return {
      verdict: "ready",
      headline:
        lang === "es"
          ? "Listo para revisar contigo — no inventa precios según tu ficha."
          : "Ready for your review — no invented prices against your sheet.",
      issues: [],
    };
  }
  return {
    verdict: "stop",
    headline:
      lang === "es"
        ? "No publiques todavía — corrige lo marcado."
        : "Do not publish yet — fix what is marked.",
    issues: issues.map((issue) => ({
      label: ISSUE_LABELS[issue.code]?.[lang] ?? issue.code,
      detail: issue.detail,
    })),
  };
}
