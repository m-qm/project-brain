import Link from "next/link";
import { BrainTreeGraph } from "./BrainTreeGraph";

const STEPS = [
  {
    n: "1",
    title: "Scaffold in minutes",
    body: "Run `brain setup` (npm: `@agentkbase/cli`) or open the web wizard. Same pack from CLI and browser.",
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
            <p className="story-eyebrow">EXTRACT FROM URL</p>
            <h2 className="story-title audit-title">
              Point it at a site. <em>Watch FACTS and GAPS fill.</em>
            </h2>
            <p className="story-lead">
              Step 1 of the wizard: paste a public URL. We read titles, headings, and body copy,
              then draft mission text, fact bullets, and story beats onto the map. Open questions
              land on GAPS as <code>[CONFIRM]</code> until you approve them.
            </p>
            <p className="story-lead muted">
              The graph is the same radial layout teams use for audits: scan the public page, plan on
              spokes, export only after you edit. SkillTree runs paid full stack audits; Agent KBase
              gives you the OSS map and zip for your repo.
            </p>
            <div className="btn-row" style={{ marginTop: "0.75rem" }}>
              <Link className="btn secondary" href="/learn/07-extract-from-website">
                Extract from website →
              </Link>
              <Link className="btn secondary" href="/company-brain">
                Company Brain Pack →
              </Link>
            </div>
          </div>
          <div className="audit-visual">
            <div className="audit-url-bar" aria-hidden>
              <span className="audit-url-label">URL</span>
              <span className="audit-url-value">https://auditamia.com/es</span>
              <span className="audit-url-badge">Extracted</span>
            </div>
            <BrainTreeGraph
              extractDemo
              highlightDomains={["facts", "gaps", "stories", "offers"]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
