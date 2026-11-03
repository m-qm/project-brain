import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/site";
import { SiteNav } from "../components/SiteNav";
import { CompanyBrainWaitlist } from "./CompanyBrainWaitlist";

export const metadata: Metadata = pageMeta(
  "/company-brain",
  "The Knowledge Layer Every Agent Reads · Agent KBase",
  "Paste your studio site. Correct the draft. Every agent that speaks for the business reads that same base. An article or a LinkedIn post comes after you approve it.",
);

export default function CompanyBrainPage() {
  return (
    <div className="page-shell">
      <SiteNav ctaHref="/wizard" ctaLabel="Free wizard" />
      <main className="page-main container-narrow">
        <p className="story-eyebrow">STUDIO OR CONSULTANCY</p>
        <h1 className="page-title">
          The knowledge layer <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>every agent reads</em>
        </h1>
        <p className="page-lead">
          Paste your site. Correct the draft until you recognise what you sell, who it is for, and
          what must not be said. From then on, every agent that speaks for the business reads that
          same base. A price, a client, or a claim that is not there is cut, or marked for you to
          confirm. Nothing goes live until you say yes. An article or a LinkedIn post comes after.
        </p>

        <div className="card company-brain-card" id="guide">
          <p className="story-eyebrow">FIVE STEPS</p>
          <h2 className="company-brain-card-title">From your URL to a base you recognise</h2>
          <ol className="company-brain-list company-brain-checks">
            <li>Paste the public URL in the wizard and extract a draft.</li>
            <li>Cross out any service, price, or deadline you do not sell.</li>
            <li>Write who you serve, and what you will not claim.</li>
            <li>Ask something a client would ask. Every agent has to answer from that base.</li>
            <li>If you trust the draft, an article or a LinkedIn post can come next. You approve it first.</li>
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
                We install the base from your public site. You correct it. You approve anything an
                agent would publish. Setup call, then a written agreement.
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
