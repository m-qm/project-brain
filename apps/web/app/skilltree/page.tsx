import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/site";
import { SiteNav } from "../components/SiteNav";

export const metadata: Metadata = pageMeta(
  "/skilltree",
  "SkillTree + Agent KBase",
  "SkillTree imports how to work. Agent KBase holds what is true in a brain/ folder.",
);

export default function SkillTreePage() {
  return (
    <div className="page-shell">
      <SiteNav />
      <main className="page-main container-narrow">
        <h1 className="page-title">
          SkillTree + <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>Agent KBase</em>
        </h1>
        <p className="page-lead">
          Skills and ground truth are two layers. SkillTree imports how to work.
          Agent KBase holds what is true.
        </p>
        <div className="card">
          <ol style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--ink-2)" }}>
            <li style={{ marginBottom: "0.5rem" }}>
              Export a brain from the <Link href="/wizard">wizard</Link> or run `brain init`.
            </li>
            <li style={{ marginBottom: "0.5rem" }}>Unzip into your repo root.</li>
            <li style={{ marginBottom: "0.5rem" }}>
              Paste your SkillTree connect message into Cursor once.
            </li>
            <li>Edit `brain/facts/` as your product evolves.</li>
          </ol>
          <p style={{ marginTop: "1.25rem" }}>
            <Link className="btn secondary" href="/learn/04-import-skills-skilltree">
              Full guide →
            </Link>
          </p>
        </div>
        <div className="card company-brain-card" style={{ marginTop: "1rem" }}>
          <h2 className="company-brain-card-title">After a SkillTree audit</h2>
          <p className="field-hint" style={{ marginBottom: "1rem" }}>
            Turn the findings into one base every agent for that business must read. Join the
            waitlist or book a done-for-you setup.
          </p>
          <Link className="btn" href="/company-brain">
            The knowledge layer →
          </Link>
        </div>
      </main>
    </div>
  );
}
