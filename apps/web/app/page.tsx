import Link from "next/link";
import { BrainStorySection } from "./components/BrainStorySection";
import { HeroShowcase } from "./components/HeroShowcase";
import { SiteNav } from "./components/SiteNav";
export default function HomePage() {
  return (
    <div className="page-shell">
      <SiteNav ctaLabel="Try wizard →" />
      <section className="hero">
        <div className="hero-badge">OPEN SOURCE · CLI + WIZARD</div>
        <h1 className="hero-title">
          Build a local <em>agent knowledge base.</em>
        </h1>
        <p className="hero-lead">
          Skills tell the agent what it can do. Agent KBase holds what is true,
          what you shipped, and what the model must not invent. Export a folder
          your Cursor agent loads before every task.
        </p>
        <div className="hero-cta-row">
          <Link className="btn" href="/wizard">
            Try wizard →
          </Link>
          <a
            className="btn secondary"
            href="https://github.com/m-qm/project-brain"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
        <div className="perk-box">
          <ul>
            <li>Facts, stories, and AGENTS.md in one zip</li>
            <li>Same pack from CLI and web wizard</li>
            <li>Validation before export (no empty demos)</li>
            <li>Extract a draft brain from your public website URL</li>
            <li>Works alongside SkillTree skill imports</li>
          </ul>
        </div>
        <p className="hero-meta">
          Just browsing?{" "}
          <Link href="/learn/01-first-brain">Read the 15 minute guide →</Link>
        </p>
      </section>
      <HeroShowcase />
      <BrainStorySection />
    </div>
  );
}
