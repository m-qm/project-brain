import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { isAppLocale } from "@/i18n/routing";
import { learnMarkdownToHtml } from "@/lib/learn-markdown";
import { readPublicMarkdown } from "@/lib/locale-markdown";
import { pageMeta } from "@/lib/site";
import { FOOTER_LEGAL_LINKS } from "@/lib/site-footer";
import { SiteNav } from "../../../components/SiteNav";
import { LEGAL_DOCS, LEGAL_SLUGS, legalText } from "../legal-docs";

export async function generateStaticParams() {
  return LEGAL_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = LEGAL_DOCS.find((d) => d.slug === slug);
  if (!doc) return {};
  const copy = legalText(doc, locale);
  return pageMeta(
    `/legal/${slug}`,
    `${copy.title} · Agent KBase`,
    copy.description,
    isAppLocale(locale) ? locale : "en",
  );
}

export default async function LegalDocPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!LEGAL_SLUGS.has(slug)) notFound();

  const md = readPublicMarkdown(locale, "legal", slug);
  if (!md) notFound();

  const t = await getTranslations("legal");
  const footer = await getTranslations("footer");
  const labels: Record<string, string> = {
    "/legal/privacy": footer("privacy"),
    "/legal/terms": footer("terms"),
    "/legal/trust": footer("trust"),
    "/legal/sla": footer("sla"),
    "/legal/acknowledgements": footer("acknowledgements"),
  };

  return (
    <div className="page-shell">
      <SiteNav ctaHref="/wizard" ctaLabel={t("cta")} />
      <main className="learn-doc-shell container-narrow">
        <nav className="learn-doc-nav" aria-label={t("breadcrumb")}>
          <Link href="/">{t("home")}</Link>
          <span aria-hidden>/</span>
          <span>{t("crumb")}</span>
        </nav>

        <p className="learn-doc-eyebrow">{t("crumb")}</p>
        {locale === "es" && <p className="field-hint">{t("governs")}</p>}

        <article
          className="learn-article"
          dangerouslySetInnerHTML={{ __html: learnMarkdownToHtml(md) }}
        />

        <nav className="legal-doc-links" aria-label={t("documents")}>
          {FOOTER_LEGAL_LINKS.filter((link) => !link.external).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.href === `/legal/${slug}` ? "page" : undefined}
            >
              {labels[link.href] ?? link.label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
