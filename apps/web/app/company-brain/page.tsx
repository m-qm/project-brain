import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/site";
import { SiteNav } from "../components/SiteNav";
import { CompanyBrainWaitlist } from "./CompanyBrainWaitlist";

export const metadata: Metadata = pageMeta(
  "/company-brain",
  "Check what you sell · Agent KBase",
  "Paste your studio site. Correct the draft. If it fits, we turn it into an article and a LinkedIn post you approve before anything goes live.",
);

export default function CompanyBrainPage() {
  return (
    <div className="page-shell">
      <SiteNav ctaHref="/wizard" ctaLabel="Free wizard" />
      <main className="page-main container-narrow">
        <p className="story-eyebrow">STUDIO OR CONSULTANCY</p>
        <h1 className="page-title">
          See if the draft understands <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>what you sell</em>
        </h1>
        <p className="page-lead">
          Paste your site. Cross out what you do not sell. If the draft fits, we turn it into an
          article and a LinkedIn post. You approve both. Nothing goes live before that. We do not
          promise rankings, new clients, or hours saved.
        </p>

        <div className="card company-brain-card" id="guide">
          <p className="story-eyebrow">FIVE STEPS</p>
          <h2 className="company-brain-card-title">From your URL to a base you recognise</h2>
          <ol className="company-brain-list company-brain-checks">
            <li>Paste the public URL in the wizard and extract a draft.</li>
            <li>Cross out any service, price, or deadline you do not sell.</li>
            <li>Write who you serve, and what you will not claim.</li>
            <li>Ask something a client would ask. The answer has to come from that base.</li>
            <li>If you would keep the draft, we write one article and one LinkedIn post for you to approve.</li>
          </ol>
          <p className="field-hint">
            A line is valid when it is in your files, or marked for you to confirm, or cut.{" "}
            <Link href="/learn/12-what-you-sell">Read the guide</Link>
            {" · "}
            <Link href="/wizard">Open the wizard</Link>.
          </p>
        </div>

        <div className="card company-brain-card" id="revision">
          <p className="story-eyebrow">ONE MINUTE · FIVE CHECKS</p>
          <h2 className="company-brain-card-title">Five checks before publishing</h2>
          <p className="company-brain-checks-lead">
            Nothing goes live unless every line is yes. A person compares each fact with what you
            actually sell.
          </p>
          <ol className="company-brain-list company-brain-checks">
            <li>The title is a shop or studio problem, not a jargon word.</li>
            <li>Every price, pack, or deadline is on your site. If it is not, it is cut.</li>
            <li>No rankings, traffic, or client names you cannot prove.</li>
            <li>The draft says where each fact came from: your site or a public page.</li>
            <li>
              The ask is the waitlist, the site, or the brand WhatsApp. Never invoices, passwords, or
              a personal phone.
            </li>
          </ol>
          <p className="field-hint">
            First article that used this list:{" "}
            <Link href="/blog/stop-fake-prices">
              How to stop your blog publishing prices that do not exist
            </Link>
            .
          </p>
        </div>

        <div className="card company-brain-card">
          <h2 className="company-brain-card-title">Open core</h2>
          <ul className="company-brain-list">
            <li>OSS stays read-only: facts in git, wizard, CLI, MCP brief and validate</li>
            <li>WhatsApp queue: draft in, approve or reject out</li>
            <li>Blog publish only when the article is approved</li>
            <li>LinkedIn drafts only from a published article</li>
          </ul>
          <p className="field-hint">
            MCP will not gain write or publish tools. Connectors live outside the public npm MCP.
            Done-for-you means we operate the loop; you approve on WhatsApp.
          </p>
        </div>

        <div className="card company-brain-card">
          <h2 className="company-brain-card-title">Two ways in</h2>
          <div className="company-brain-tier-grid">
            <div className="company-brain-tier">
              <p className="company-brain-tier-name">Done-for-you</p>
              <p className="company-brain-tier-price">Quoted retainer</p>
              <p className="company-brain-tier-desc">
                We install a brain from your public site, run the two workers, you approve. First
                motion. Setup call, then a written agreement.
              </p>
            </div>
            <div className="company-brain-tier">
              <p className="company-brain-tier-name">Act connectors</p>
              <p className="company-brain-tier-price">Waitlist</p>
              <p className="company-brain-tier-desc">
                Same three connectors for teams that already keep a brain in git. Ships after the
                operated loop is proven. Not a Zapier catalogue.
              </p>
            </div>
          </div>
          <CompanyBrainWaitlist source="company-brain-page" />
        </div>

        <p className="field-hint" style={{ marginTop: "1.5rem" }}>
          Free today:{" "}
          <Link href="/learn/12-what-you-sell">the five-step guide</Link>
          {", "}
          <Link href="/wizard">wizard</Link>
          {", "}
          <Link href="/learn/11-content-ads-workers">how workers read the brain</Link>
          {", "}
          <Link href="/learn/10-mcp">read-only MCP</Link>.
        </p>
      </main>
    </div>
  );
}
