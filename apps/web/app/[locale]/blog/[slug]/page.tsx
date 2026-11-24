import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { isAppLocale } from "@/i18n/routing";
import { learnMarkdownToHtml } from "@/lib/learn-markdown";
import { readPublicMarkdown } from "@/lib/locale-markdown";
import { pageMeta } from "@/lib/site";
import { SiteNav } from "../../../components/SiteNav";
import { BLOG_POSTS, blogText } from "../blog-docs";

const ALLOWED = new Set(BLOG_POSTS.map((d) => d.slug));

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = BLOG_POSTS.find((d) => d.slug === slug);
  if (!post) return {};
  const copy = blogText(post, locale);
  return pageMeta(
    `/blog/${slug}`,
    `${copy.title} · Agent KBase`,
    copy.description,
    isAppLocale(locale) ? locale : "en",
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!ALLOWED.has(slug)) notFound();

  const meta = BLOG_POSTS.find((d) => d.slug === slug);
  const copy = meta ? blogText(meta, locale) : null;
  const md = readPublicMarkdown(locale, "blog", slug);
  if (!md || !copy) notFound();

  const t = await getTranslations("blog");
  const nav = await getTranslations("nav");

  return (
    <div className="page-shell">
      <SiteNav />
      <main className="learn-doc-shell container-narrow">
        <nav className="learn-doc-nav" aria-label={t("breadcrumb")}>
          <Link href="/blog">{nav("blog")}</Link>
          <span aria-hidden>/</span>
          <span>{copy.date}</span>
        </nav>

        <p className="learn-doc-eyebrow">
          {t("eyebrow")} · {copy.date}
        </p>

        <article
          className="learn-article"
          dangerouslySetInnerHTML={{ __html: learnMarkdownToHtml(md) }}
        />

        <p className="field-hint" style={{ marginTop: "2rem" }}>
          <Link href="/blog">{t("all")}</Link>
        </p>
      </main>
    </div>
  );
}
