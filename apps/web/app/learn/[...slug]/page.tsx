import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LearnDocAnalytics } from "../../components/LearnDocAnalytics";
import { SiteNav } from "../../components/SiteNav";
import { learnMarkdownToHtml } from "@/lib/learn-markdown";
import { pageMeta } from "@/lib/site";
import { LEARN_DOCS } from "../learn-docs";

const ALLOWED = new Set(LEARN_DOCS.map((d) => d.slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug: parts } = await params;
  const slug = parts.join("/");
  const doc = LEARN_DOCS.find((d) => d.slug === slug);
  if (!doc) return {};
  return pageMeta(`/learn/${slug}`, `${doc.title} · Agent KBase`, doc.description);
}

export default async function LearnDocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug: parts } = await params;
  const slug = parts.join("/");
  if (!ALLOWED.has(slug)) notFound();

  const meta = LEARN_DOCS.find((d) => d.slug === slug);
  const path = join(process.cwd(), "public", "learn", `${slug}.md`);
  let md: string;
  try {
    md = readFileSync(path, "utf8");
  } catch {
    notFound();
  }

  const idx = LEARN_DOCS.findIndex((d) => d.slug === slug);
  const prev = idx > 0 ? LEARN_DOCS[idx - 1] : null;
  const next = idx >= 0 && idx < LEARN_DOCS.length - 1 ? LEARN_DOCS[idx + 1] : null;

  return (
    <div className="page-shell">
      <LearnDocAnalytics slug={slug} section={meta?.section} />
      <SiteNav ctaHref="/wizard" ctaLabel="Wizard" />
      <main className="learn-doc-shell container-narrow">
        <nav className="learn-doc-nav" aria-label="Breadcrumb">
          <Link href="/learn">Learn</Link>
          {meta && (
            <>
              <span aria-hidden>/</span>
              <span>{meta.section}</span>
            </>
          )}
        </nav>

        {meta && (
          <p className="learn-doc-eyebrow">
            {meta.section} · {meta.minutes} min read
          </p>
        )}

        <article
          className="learn-article"
          dangerouslySetInnerHTML={{ __html: learnMarkdownToHtml(md) }}
        />

        <footer className="learn-doc-footer">
          {prev ? (
            <Link className="learn-doc-pager prev" href={`/learn/${prev.slug}`}>
              <span className="learn-doc-pager-label">Previous</span>
              <span className="learn-doc-pager-title">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="learn-doc-pager next" href={`/learn/${next.slug}`}>
              <span className="learn-doc-pager-label">Next</span>
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
