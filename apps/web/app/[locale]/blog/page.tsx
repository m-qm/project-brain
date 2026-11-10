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
  const locale = await getLocale();

  return (
    <div className="page-shell">
      <SiteNav ctaHref="/wizard" ctaLabel={t("tryWizard")} />
      <header className="learn-hero">
        <div className="container learn-hero-inner">
          <p className="learn-eyebrow">{t("eyebrow")}</p>
          <h1 className="learn-title">{t.rich("title", { em: (chunks) => <em>{chunks}</em> })}</h1>
          <p className="learn-lead">{t("lead")}</p>
        </div>
      </header>
      <main className="learn-main container">
        {BLOG_POSTS.length === 0 ? (
          <p className="learn-lead">
            {t.rich("empty", { code: (chunks) => <code>{chunks}</code> })}{" "}
            <Link href="/company-brain">{t("workers")}</Link>
            {" · "}
            <Link href="/learn/11-content-ads-workers">{t("how")}</Link>.
          </p>
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
