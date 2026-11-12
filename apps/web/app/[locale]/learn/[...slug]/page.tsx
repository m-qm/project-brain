import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { isAppLocale } from "@/i18n/routing";
import { learnMarkdownToHtml } from "@/lib/learn-markdown";
import { readPublicMarkdown } from "@/lib/locale-markdown";
import { pageMeta } from "@/lib/site";
import { LearnDocAnalytics } from "../../../components/LearnDocAnalytics";
import { SiteNav } from "../../../components/SiteNav";
import { LEARN_DOCS, LEARN_SECTION_ES, learnText } from "../learn-docs";

const ALLOWED = new Set(LEARN_DOCS.map((d) => d.slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}): Promise<Metadata> {
  const { locale, slug: parts } = await params;
  const slug = parts.join("/");
  const doc = LEARN_DOCS.find((d) => d.slug === slug);
  if (!doc) return {};
  const copy = learnText(doc, locale);
  return pageMeta(
    `/learn/${slug}`,
    `${copy.title} · Agent KBase`,
    copy.description,
    isAppLocale(locale) ? locale : "en",
  );
}

export default async function LearnDocPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug: parts } = await params;
  const slug = parts.join("/");
  if (!ALLOWED.has(slug)) notFound();

  const meta = LEARN_DOCS.find((d) => d.slug === slug);
  const copy = meta ? learnText(meta, locale) : null;
  const md = readPublicMarkdown(locale, "learn", slug);
  if (!md) notFound();

  const t = await getTranslations("learn");
  const nav = await getTranslations("nav");
  const idx = LEARN_DOCS.findIndex((d) => d.slug === slug);
  const prev = idx > 0 ? learnText(LEARN_DOCS[idx - 1], locale) : null;
  const next = idx >= 0 && idx < LEARN_DOCS.length - 1 ? learnText(LEARN_DOCS[idx + 1], locale) : null;
  const section =
    meta && locale === "es" ? LEARN_SECTION_ES[meta.section] : meta?.section;

  return (
    <div className="page-shell">
      <LearnDocAnalytics slug={slug} section={meta?.section} />
      <SiteNav ctaHref="/wizard" ctaLabel={nav("wizard")} />
      <main className="learn-doc-shell container-narrow">
        <nav className="learn-doc-nav" aria-label={t("breadcrumb")}>
          <Link href="/learn">{nav("learn")}</Link>
          {section && (
            <>
              <span aria-hidden>/</span>
              <span>{section}</span>
            </>
          )}
        </nav>

        {copy && meta && (
          <p className="learn-doc-eyebrow">
            {section} · {t("read", { count: meta.minutes })}
          </p>
        )}

        <article
          className="learn-article"
          dangerouslySetInnerHTML={{ __html: learnMarkdownToHtml(md, { diagrams: true }) }}
        />

        <footer className="learn-doc-footer">
          {prev ? (
            <Link className="learn-doc-pager prev" href={`/learn/${prev.slug}`}>
              <span className="learn-doc-pager-label">{t("previous")}</span>
              <span className="learn-doc-pager-title">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="learn-doc-pager next" href={`/learn/${next.slug}`}>
              <span className="learn-doc-pager-label">{t("next")}</span>
              <span className="learn-doc-pager-title">{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </footer>
      </main>
    </div>
  );
}
