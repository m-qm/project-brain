import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";
import { BrainStorySection } from "./components/BrainStorySection";
import { HeroShowcase } from "./components/HeroShowcase";
import { SiteNav } from "./components/SiteNav";

export const metadata: Metadata = pageMeta("/", SITE_TITLE, SITE_DESCRIPTION);

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
          <a
            className="btn secondary"
            href="https://www.npmjs.com/package/@agentkbase/cli"
            target="_blank"
            rel="noopener noreferrer"
          >
            npm
          </a>
        </div>
        <div className="hero-install learn-code-block" aria-label="Install CLI">
          <div className="learn-code-label">Install</div>
          <pre className="learn-code">
            <code>npm install -g @agentkbase/cli</code>
          </pre>
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
