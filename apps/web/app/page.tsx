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
        <div className="hero-badge">THE KNOWLEDGE LAYER</div>
        <h1 className="hero-title">
          The knowledge layer <em>every agent reads.</em>
        </h1>
        <p className="hero-lead">
          For a studio or a small consultancy. Paste your site. Correct the draft
          until you recognise what you sell, who it is for, and what must not be
          said. Every agent that speaks for the business reads that same base.
        </p>
        <div className="hero-cta-row">
          <Link className="btn" href="/wizard">
            Paste your site →
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
            <li>A price, a client, or a claim that is not in the base is cut or marked to confirm</li>
            <li>Nothing goes live until you say yes</li>
            <li>An article or a LinkedIn post comes after, from that same base</li>
            <li>Same base from the wizard or the CLI</li>
            <li>Works alongside SkillTree skill imports</li>
          </ul>
        </div>
        <p className="hero-meta">
          Just browsing?{" "}
          <Link href="/learn/12-what-you-sell">Read the five steps →</Link>
        </p>
      </section>
      <HeroShowcase />
      <BrainStorySection />
    </div>
  );
}
