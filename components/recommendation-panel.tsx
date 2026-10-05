type RecommendationPanelProps = {
  recommendation: string;
  price: string;
  reason: string;
  scenario: string;
  researchScope: string;
  coverage: string;
  uncertainties: readonly string[];
};

export function RecommendationPanel({
  recommendation,
  price,
  reason,
  scenario,
  researchScope,
  coverage,
  uncertainties,
}: RecommendationPanelProps) {
  return (
    <section className="recommendation-panel" aria-labelledby="recommendation-heading">
      <div className="recommendation-intro">
        <p className="eyebrow">Our recommendation</p>
        <h2 id="recommendation-heading" className="editorial">{recommendation}</h2>
      </div>
      <dl className="recommendation-details">
        <div><dt>Price for this scenario</dt><dd className="recommendation-price">{price}</dd></div>
        <div><dt>Why</dt><dd>{reason}</dd></div>
        <div><dt>Scenario</dt><dd>{scenario}</dd></div>
        <div><dt>Research scope</dt><dd>{researchScope}</dd></div>
        <div><dt>Coverage</dt><dd>{coverage}</dd></div>
      </dl>
      {uncertainties.length > 0 && <div className="recommendation-uncertainties">
          <h3>Uncertainties</h3>
          <ul>{uncertainties.map((uncertainty) => <li key={uncertainty}>{uncertainty}</li>)}</ul>
        </div>}
    </section>
  );
}
