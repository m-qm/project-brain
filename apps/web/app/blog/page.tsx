import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/site";
import { SiteNav } from "../components/SiteNav";
import { BLOG_POSTS } from "./blog-docs";

export const metadata: Metadata = pageMeta(
  "/blog",
  "Blog · Agent KBase",
  "Case-study articles written with the same HITL loop we sell. Drafts stay pending until a human approves.",
);

export default function BlogIndexPage() {
  return (
    <div className="page-shell">
      <SiteNav ctaHref="/wizard" ctaLabel="Try wizard" />
      <header className="learn-hero">
        <div className="container learn-hero-inner">
          <p className="learn-eyebrow">JOURNAL</p>
          <h1 className="learn-title">
            Written with the <em>same loop</em>
          </h1>
          <p className="learn-lead">
            Articles start as pending drafts grounded in the git brain. A human approves. Then we
            distribute. Nothing on this page skipped that gate.
          </p>
        </div>
      </header>
      <main className="learn-main container">
        {BLOG_POSTS.length === 0 ? (
          <p className="learn-lead">
            No live posts yet. The first draft is in the local queue as{" "}
            <code>article-01</code>.{" "}
            <Link href="/company-brain">Workers waitlist</Link>
            {" · "}
            <Link href="/learn/11-content-ads-workers">How the loop works</Link>.
          </p>
        ) : (
          <ul className="learn-grid">
            {BLOG_POSTS.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="learn-card">
                  <span className="learn-card-body">
                    <span className="learn-card-title">{post.title}</span>
                    <span className="learn-card-desc">{post.description}</span>
                  </span>
                  <span className="learn-card-meta">{post.date}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
