import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "../../components/SiteNav";
import { learnMarkdownToHtml } from "@/lib/learn-markdown";
import { pageMeta } from "@/lib/site";
import { BLOG_POSTS } from "../blog-docs";

const ALLOWED = new Set(BLOG_POSTS.map((d) => d.slug));

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((d) => d.slug === slug);
  if (!post) return {};
  return pageMeta(`/blog/${slug}`, `${post.title} · Agent KBase`, post.description);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!ALLOWED.has(slug)) notFound();

  const meta = BLOG_POSTS.find((d) => d.slug === slug);
  const path = join(process.cwd(), "public", "blog", `${slug}.md`);
  let md: string;
  try {
    md = readFileSync(path, "utf8");
  } catch {
    notFound();
  }

  return (
    <div className="page-shell">
      <SiteNav ctaHref="/company-brain" ctaLabel="Workers" />
      <main className="learn-doc-shell container-narrow">
        <nav className="learn-doc-nav" aria-label="Breadcrumb">
          <Link href="/blog">Blog</Link>
          {meta && (
            <>
              <span aria-hidden>/</span>
              <span>{meta.date}</span>
            </>
          )}
        </nav>

        {meta && <p className="learn-doc-eyebrow">JOURNAL · {meta.date}</p>}

        <article
          className="learn-article"
          dangerouslySetInnerHTML={{ __html: learnMarkdownToHtml(md) }}
        />

        <p className="field-hint" style={{ marginTop: "2rem" }}>
          Written with the same five checks.{" "}
          <Link href="/company-brain">See the list</Link>
          {" · "}
          <Link href="/blog">All posts</Link>.
        </p>
      </main>
    </div>
  );
}
