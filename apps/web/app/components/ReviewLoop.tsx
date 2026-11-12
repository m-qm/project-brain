type ReviewLoopCopy = {
  calmName: string;
  calmText: string;
  draft: string;
  draftText: string;
  lowName: string;
  lowText: string;
  waiting: string;
  notPosted: string;
  suggest: string;
  suggestText: string;
  notify: string;
};

export function ReviewLoop({ copy }: { copy: ReviewLoopCopy }) {
  return (
    <div className="review-loop" aria-hidden="true">
      <article className="review-card review-card--calm">
        <header>
          <span className="review-name">{copy.calmName}</span>
          <span className="review-stars" aria-hidden="true">
            ★★★★★
          </span>
        </header>
        <p>{copy.calmText}</p>
        <div className="review-draft">
          <span className="review-tag">{copy.draft}</span>
          <p>{copy.draftText}</p>
        </div>
      </article>
      <article className="review-card review-card--hold">
        <header>
          <span className="review-name">{copy.lowName}</span>
          <span className="review-stars review-stars--low" aria-hidden="true">
            ★
          </span>
          <span className="review-tag review-tag--wait">{copy.waiting}</span>
        </header>
        <p>{copy.lowText}</p>
        <div className="review-suggest">
          <div>
            <span className="review-tag">{copy.suggest}</span>
            <p>{copy.suggestText}</p>
            <p className="review-notify">{copy.notify}</p>
          </div>
          <p className="review-hold">{copy.notPosted}</p>
        </div>
      </article>
    </div>
  );
}
