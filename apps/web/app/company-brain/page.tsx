import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/site";
import { SiteNav } from "../components/SiteNav";
import { CompanyBrainWaitlist } from "./CompanyBrainWaitlist";

export const metadata: Metadata = pageMeta(
  "/company-brain",
  "Company Brain Pack · Agent KBase",
  "Marketing, sales, operations, fulfillment, and work-logs in a validated git-native brain. Coming soon.",
);

export default function CompanyBrainPage() {
  return (
    <div className="page-shell">
      <SiteNav ctaHref="/wizard" ctaLabel="Free wizard" />
      <main className="page-main container-narrow">
        <p className="story-eyebrow">COMING SOON · PAID PACK</p>
        <h1 className="page-title">
          Company Brain <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>Pack</em>
        </h1>
        <p className="page-lead">
          SkillTree shows what is broken. Agent KBase holds what is true in git. The Pack turns an audit
          into marketing, sales, operations, and fulfillment facts your Cursor agents actually read—plus
          work-log conventions so truth stays current.
        </p>

        <div className="card company-brain-card">
          <h2 className="company-brain-card-title">What you get</h2>
          <ul className="company-brain-list">
            <li>Department fact files and stories (not just one landing-page story)</li>
            <li>Stricter validation and <code>[CONFIRM]</code> gates on risky claims</li>
            <li>Append-only work-logs agents can update without rewriting facts</li>
            <li>Same export model: validated zip into your repo</li>
          </ul>
          <p className="field-hint">
            OSS wizard stays free. LLM extract on the public site stays off (abuse protection); Pack buyers
            use CLI with their own key or done-for-you setup.
          </p>
        </div>

        <div className="card company-brain-card">
          <h2 className="company-brain-card-title">Two ways in</h2>
          <div className="company-brain-tier-grid">
            <div className="company-brain-tier">
              <p className="company-brain-tier-name">Self-serve Pack</p>
              <p className="company-brain-tier-price">Target €49–149 · one-time</p>
              <p className="company-brain-tier-desc">Templates, guide, validate rules. You fill from your docs.</p>
            </div>
            <div className="company-brain-tier">
              <p className="company-brain-tier-name">Done-for-you</p>
              <p className="company-brain-tier-price">Target €499–1,200</p>
              <p className="company-brain-tier-desc">
                Best after a SkillTree audit. We deliver a validated brain and a handoff call.
              </p>
            </div>
          </div>
          <CompanyBrainWaitlist source="company-brain-page" />
        </div>

        <p className="field-hint" style={{ marginTop: "1.5rem" }}>
          Already started?{" "}
          <Link href="/wizard">Use the free wizard</Link> or{" "}
          <Link href="/skilltree">SkillTree + Agent KBase guide</Link>.
        </p>
      </main>
    </div>
  );
}
