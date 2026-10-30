export function HeroShowcase() {
  return (
    <div className="showcase-wrap">
      <div className="showcase">
        <div className="showcase-dots" aria-hidden />
        <div className="showcase-chrome">
          <span className="showcase-tab active">FACTS</span>
          <span className="showcase-tab">STORIES</span>
          <span className="showcase-tab">VALIDATE</span>
        </div>
        <div className="showcase-body">
          <div className="showcase-search">Search ground truth</div>
          <div className="showcase-grid">
            <div className="showcase-node">
              brain/facts
              <strong>project.md</strong>
            </div>
            <div className="showcase-node">
              brain/stories
              <strong>routing.md</strong>
            </div>
            <div className="showcase-node">
              brain
              <strong>AGENTS.md</strong>
            </div>
            <div className="showcase-node">
              open questions
              <strong>[CONFIRM]</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
