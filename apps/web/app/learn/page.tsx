import Link from "next/link";
import { LearnDocAnalytics } from "../components/LearnDocAnalytics";
import { SiteNav } from "../components/SiteNav";
import { LEARN_DOCS, LEARN_SECTIONS } from "./learn-docs";

export default function LearnIndexPage() {
  return (
    <div className="page-shell">
      <LearnDocAnalytics slug="index" section="hub" />
      <SiteNav ctaHref="/wizard" ctaLabel="Try wizard" />
      <header className="learn-hero">
        <div className="container learn-hero-inner">
          <p className="learn-eyebrow">DOCUMENTATION</p>
          <h1 className="learn-title">
            Learn <em>Agent KBase</em>
          </h1>
          <p className="learn-lead">
            Short guides for vibecoders and small teams. Ground truth in git, Engram for
            continuity, SkillTree for skills.
          </p>
          <div className="learn-hero-actions">
            <Link className="btn" href="/learn/01-first-brain">
              Start here →
            </Link>
            <Link className="btn secondary" href="/wizard">
              Open wizard
            </Link>
          </div>
        </div>
      </header>

      <main className="learn-main container">
        {LEARN_SECTIONS.map((section) => {
          const items = LEARN_DOCS.filter((d) => d.section === section);
          if (items.length === 0) return null;
          return (
            <section key={section} className="learn-section">
              <h2 className="learn-section-title">{section}</h2>
              <ul className="learn-grid">
                {items.map((doc, i) => (
                  <li key={doc.slug}>
                    <Link href={`/learn/${doc.slug}`} className="learn-card">
                      <span className="learn-card-index">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="learn-card-body">
                        <span className="learn-card-title">{doc.title}</span>
                        <span className="learn-card-desc">{doc.description}</span>
                      </span>
                      <span className="learn-card-meta">{doc.minutes} min</span>
                      <span className="learn-card-arrow" aria-hidden>
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
    </div>
  );
}
