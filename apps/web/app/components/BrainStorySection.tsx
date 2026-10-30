import Link from "next/link";
import { BrainTreeGraph } from "./BrainTreeGraph";

const STEPS = [
  {
    n: "1",
    title: "Scaffold in minutes",
    body: "Run `brain init` or open the web wizard. Same pack from CLI and browser.",
  },
  {
    n: "2",
    title: "Ground the business",
    body: "Step through Project, Facts, Story, and Gaps. Paste a public URL to draft from the landing page, then edit like an interview transcript.",
  },
  {
    n: "3",
    title: "Your second brain is built",
    body: "Validation passes → export `brain.zip`. Facts, stories, AGENTS.md, and open questions become the node at the center of the tree.",
  },
  {
    n: "4",
    title: "Agents plug into the brain",
    body: "Cursor loads `brain/` before tasks. SkillTree skills sit on the SKILLS spoke: how to work, while Agent KBase holds what is true.",
  },
] as const;

export function BrainStorySection() {
  return (
    <section className="story-section" id="how-it-works">
      <div className="container">
        <div className="story-grid">
          <div className="story-copy">
            <p className="story-eyebrow">STORY</p>
            <h2 className="story-title">
              It grounds your business, then <em>the tree knows it.</em>
            </h2>
            <p className="story-lead">
              SkillTree interviews and skills are one layer. Agent KBase is the company knowledge
              base those agents read: offers, constraints, voice, and what must stay{" "}
              <code>[CONFIRM]</code>.
            </p>
            <p className="story-lead">
              That is the difference between an AI org that shares ground truth and a folder of
              generic prompts.
            </p>
            <ol className="story-steps">
              {STEPS.map((s) => (
                <li key={s.n}>
                  <span className="story-step-num">{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link className="btn" href="/wizard">
              Start the wizard →
            </Link>
          </div>
          <div className="story-visual">
            <BrainTreeGraph live />
          </div>
        </div>

        <div className="audit-block" id="audit">
          <div className="audit-copy">
            <p className="story-eyebrow">AUDIT MOTION</p>
            <h2 className="story-title audit-title">
              Point it at a business. <em>Watch the tree fill.</em>
            </h2>
            <p className="story-lead">
              Paste a public URL in the wizard. The extract engine reads headings and body copy, then
              places draft facts on the FACTS spoke and gaps on GAPS. You review before export.
            </p>
            <p className="story-lead muted">
              Full stack audits and revenue sized engagements are SkillTree&apos;s audit product.
              Agent KBase shows the same map logic for open source: scan → plan on the graph →
              human sign off.
            </p>
            <Link className="btn secondary" href="/learn/07-extract-from-website">
              Extract from website →
            </Link>
          </div>
          <div className="audit-visual">
            <BrainTreeGraph />
            <p className="audit-demo-label">Example map (Auditamia demo leaves)</p>
          </div>
        </div>
      </div>
    </section>
  );
}
