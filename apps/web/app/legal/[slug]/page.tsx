import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "../../components/SiteNav";
import { learnMarkdownToHtml } from "@/lib/learn-markdown";
import { pageMeta } from "@/lib/site";
import { FOOTER_LEGAL_LINKS } from "@/lib/site-footer";
import { LEGAL_DOCS, LEGAL_SLUGS } from "../legal-docs";

export async function generateStaticParams() {
  return LEGAL_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = LEGAL_DOCS.find((d) => d.slug === slug);
  if (!doc) return {};
  return pageMeta(`/legal/${slug}`, `${doc.title} · Agent KBase`, doc.description);
}

export default async function LegalDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!LEGAL_SLUGS.has(slug)) notFound();

  const meta = LEGAL_DOCS.find((d) => d.slug === slug);
  const path = join(process.cwd(), "public", "legal", `${slug}.md`);
  let md: string;
  try {
    md = readFileSync(path, "utf8");
  } catch {
    notFound();
  }

  return (
    <div className="page-shell">
      <SiteNav ctaHref="/wizard" ctaLabel="Wizard" />
      <main className="learn-doc-shell container-narrow">
        <nav className="learn-doc-nav" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden>/</span>
          <span>Legal</span>
        </nav>

        {meta && <p className="learn-doc-eyebrow">Legal</p>}

        <article
          className="learn-article"
          dangerouslySetInnerHTML={{ __html: learnMarkdownToHtml(md) }}
        />

        <nav className="legal-doc-links" aria-label="Legal documents">
          {FOOTER_LEGAL_LINKS.filter((l) => !l.external).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.href === `/legal/${slug}` ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
