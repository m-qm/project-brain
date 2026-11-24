import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isAppLocale } from "@/i18n/routing";
import { pageMeta } from "@/lib/site";
import { SiteNav } from "../../components/SiteNav";
import { BLOG_POSTS, blogText } from "./blog-docs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta("/blog", t("blogTitle"), t("blogDescription"), isAppLocale(locale) ? locale : "en");
}

export default async function BlogIndexPage() {
  const t = await getTranslations("blog");
  const nav = await getTranslations("nav");
  const locale = await getLocale();
  const mailto = `mailto:hello@agentkbase.com?subject=${encodeURIComponent(nav("writeSubject"))}`;

  return (
    <div className="page-shell">
      <SiteNav />
      <header className="learn-hero">
        <div className="container learn-hero-inner">
          <p className="learn-eyebrow">{t("eyebrow")}</p>
          <h1 className="learn-title">{t("title")}</h1>
          <p className="learn-lead">{t("lead")}</p>
          <div className="learn-hero-actions">
            <a className="btn" href={mailto}>
              {t("write")}
            </a>
          </div>
        </div>
      </header>
      <main className="learn-main container">
        {BLOG_POSTS.length === 0 ? (
          <p className="learn-lead">{t("empty")}</p>
        ) : (
          <ul className="learn-grid">
            {BLOG_POSTS.map((post) => {
              const copy = blogText(post, locale);
              return (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="learn-card blog-card">
                    <span className="learn-card-body">
                      <span className="learn-card-title">{copy.title}</span>
                      <span className="learn-card-desc">{copy.description}</span>
                    </span>
                    <span className="learn-card-meta">{post.date}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
