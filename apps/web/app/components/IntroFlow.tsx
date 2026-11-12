type IntroFlowCopy = {
  jobsLabel: string;
  writeVerb: string;
  writeSentence: string;
  writeSite: string;
  writePrice: string;
  writeDraft: string;
  writeCut: string;
  writeMark: string;
  writeResult: string;
  waitVerb: string;
  waitSentence: string;
  waitLabel: string;
  waitStatus: string;
  waitResult: string;
  keepVerb: string;
  keepSentence: string;
  keepPublish: string;
  keepNo: string;
  keepResult: string;
};

function PriceCheck() {
  return (
    <svg className="job-check" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <path
        d="M3.2 8.3 6.4 11.4 12.8 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IntroFlow({ copy }: { copy: IntroFlowCopy }) {
  return (
    <section className="job-cards" aria-label={copy.jobsLabel}>
      <article className="job-card job-card--write">
        <h2 className="job-verb">{copy.writeVerb}</h2>
        <p className="job-sentence">{copy.writeSentence}</p>
        <div className="job-frame">
          <div className="job-scene" aria-hidden="true">
            <div>
              <p className="job-kicker">{copy.writeSite}</p>
              <p className="job-fact">{copy.writePrice}</p>
            </div>
            <div className="job-draft">
              <p className="job-kicker">{copy.writeDraft}</p>
              <span className="job-bar" />
              <p className="job-cut">
                <s>{copy.writeCut}</s>
                <PriceCheck />
              </p>
              <p className="job-mark">{copy.writeMark}</p>
            </div>
          </div>
          <p className="job-result">{copy.writeResult}</p>
        </div>
      </article>

      <article className="job-card job-card--wait">
        <h2 className="job-verb">{copy.waitVerb}</h2>
        <p className="job-sentence">{copy.waitSentence}</p>
        <div className="job-frame">
          <div className="job-scene" aria-hidden="true">
            <div className="job-post">
              <div className="job-post-top">
                <span className="job-avatar" />
                <span className="job-post-meta">
                  <span className="job-bar job-bar--name" />
                  <span className="job-kicker">{copy.waitLabel}</span>
                </span>
                <span className="job-status">{copy.waitStatus}</span>
              </div>
              <span className="job-bar" />
              <span className="job-bar" />
              <span className="job-bar job-bar--short" />
            </div>
          </div>
          <p className="job-result">{copy.waitResult}</p>
        </div>
      </article>

      <article className="job-card job-card--keep">
        <h2 className="job-verb">{copy.keepVerb}</h2>
        <p className="job-sentence">{copy.keepSentence}</p>
        <div className="job-frame">
          <div className="job-scene" aria-hidden="true">
            <div className="job-choice">
              <span className="job-choice-btn">{copy.keepPublish}</span>
              <span className="job-choice-btn">{copy.keepNo}</span>
            </div>
          </div>
          <p className="job-result">{copy.keepResult}</p>
        </div>
      </article>
    </section>
  );
}
