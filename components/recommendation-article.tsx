import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ComparedOptions } from "@/components/compared-options";
import { RecommendationPanel } from "@/components/recommendation-panel";
import type { RecommendationComparisonArticle } from "@/lib/publication/types";
import { subcategoryHref } from "@/lib/publication/indexing";
import { sanitiseTrustedEditorialHtml } from "@/lib/publication/editorial-html";

type RecommendationArticleProps = { article: RecommendationComparisonArticle };

export function RecommendationArticle({ article }: RecommendationArticleProps) {
  if (article.articleBody) {
    const body = article.articleBody;
    return (
      <main className="article-page"><article className="article-shell">
        <ArticleChrome article={article} showTitle={body.format !== "HTML"} />
        <div className="article-reading article-markdown">
          {body.format === "MARKDOWN" ? <ReactMarkdown>{body.content}</ReactMarkdown> : <div className="article-html" dangerouslySetInnerHTML={{ __html: sanitiseTrustedEditorialHtml(body.content) }} />}
        </div>
      </article></main>
    );
  }

  const sections = article.sections!;
  const alternativeOptions = article.comparedOptions.filter((option) => option.provider !== article.recommendation.provider);

  return (
    <main className="article-page"><article className="article-shell">
      <ArticleChrome article={article} />
      <RecommendationPanel recommendation={article.recommendation.subject} price={article.recommendation.price} reason={article.recommendation.reason} scenario={article.recommendation.scenarioDisplay} researchScope={article.recommendation.researchScope} coverage={article.recommendation.coverage} uncertainties={article.recommendation.uncertainties} />
      <div className="article-reading">
        <section aria-labelledby="glance-heading"><p className="eyebrow">{sections.atAGlance.eyebrow}</p><h2 id="glance-heading" className="editorial">{sections.atAGlance.heading}</h2><p>{sections.atAGlance.body}</p></section>
        <section aria-labelledby="scenario-heading"><p className="eyebrow">{sections.scenario.eyebrow}</p><h2 id="scenario-heading" className="editorial">{sections.scenario.heading}</h2><ul className="scenario-list">{article.scenario.details.map((detail) => <li key={detail.label}>{detail.label}: {detail.value}</li>)}</ul><p>{article.scenario.boundaryNote}</p></section>
      </div>
      <ComparedOptions eyebrow={sections.comparedOptions.eyebrow} heading={sections.comparedOptions.heading} introduction={sections.comparedOptions.introduction} options={article.comparedOptions} />
      <div className="article-reading">
        <section aria-labelledby="why-heading"><p className="eyebrow">{sections.recommendationRationale.eyebrow}</p><h2 id="why-heading" className="editorial">{sections.recommendationRationale.heading}</h2><p>{sections.recommendationRationale.body}</p></section>
        <section aria-labelledby="alternatives-heading"><p className="eyebrow">{sections.alternatives.eyebrow}</p><h2 id="alternatives-heading" className="editorial">{sections.alternatives.heading}</h2><p>{sections.alternatives.introduction}</p><div className="article-alternatives">{alternativeOptions.map((option) => <section key={option.provider}><h3 className="editorial">{option.provider}</h3><p>{option.displayedPrice} / {option.optionLabel}</p><ul>{option.attributes.map((attribute) => <li key={attribute.label}>{attribute.label}: {attribute.value}</li>)}{option.details.map((detail) => <li key={detail}>{detail}</li>)}</ul></section>)}</div></section>
        {article.practicalChecks.length > 0 && <section aria-labelledby="checks-heading"><p className="eyebrow">{sections.practicalChecks.eyebrow}</p><h2 id="checks-heading" className="editorial">{sections.practicalChecks.heading}</h2><p>{sections.practicalChecks.introduction}</p><dl className="practical-checks">{article.practicalChecks.map((check) => <div key={check.title}><dt>{check.title}</dt><dd>{check.body}</dd></div>)}</dl></section>}
        {sections.uncertainties.items.length > 0 && <section className="could-not-confirm" aria-labelledby="uncertainties-heading"><p className="eyebrow">{sections.uncertainties.eyebrow}</p><h2 id="uncertainties-heading" className="editorial">{sections.uncertainties.heading}</h2><p>{sections.uncertainties.introduction}</p><ul>{sections.uncertainties.items.map((item) => <li key={item}>{item}</li>)}</ul></section>}
        <section aria-labelledby="methodology-heading"><p className="eyebrow">{sections.methodology.eyebrow}</p><h2 id="methodology-heading" className="editorial">{sections.methodology.heading}</h2><p>{sections.methodology.body}</p><p className="article-links">{sections.methodology.links.map((link) => <Link href={link === "How We Research" ? "/how-we-research/" : link === "Editorial Standards" ? "/editorial-standards/" : "/affiliate-disclosure/"} key={link}>{link}</Link>)}</p></section>
        <section aria-labelledby="bottom-line-heading"><p className="eyebrow">{sections.bottomLine.eyebrow}</p><h2 id="bottom-line-heading" className="editorial">{sections.bottomLine.heading}</h2><p>{sections.bottomLine.body}</p></section>
        <section className="article-update" aria-labelledby="updates-heading"><h2 id="updates-heading" className="editorial">{sections.updates.heading}</h2><p>{sections.updates.bodyBeforeLink}<Link href="/corrections/">{sections.updates.linkText}</Link>{sections.updates.bodyAfterLink}</p></section>
      </div>
      <footer className="author-card"><p className="eyebrow">{sections.authorCard.heading}</p><h2 className="editorial">{article.author}</h2><p>{sections.authorCard.description}</p></footer>
    </article></main>
  );
}

function ArticleChrome({ article, showTitle = true }: RecommendationArticleProps & { showTitle?: boolean }) {
  return <>
    <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/travel/">{article.category}</Link><span aria-hidden="true">/</span>{subcategoryHref(article.subcategory) ? <Link href={subcategoryHref(article.subcategory)!}>{article.subcategory}</Link> : <span>{article.subcategory}</span>}</nav>
    <header className="article-header"><p className="eyebrow">{article.articleType}</p>{showTitle && <h1 className="editorial">{article.title}</h1>}<p className="article-standfirst">{article.standfirst}</p><div className="article-meta"><span>By {article.author}</span><span>Last researched: {article.lastResearched}</span></div></header>
    {article.affiliateDisclosure && <p className="affiliate-disclosure"><strong>Affiliate disclosure:</strong> {article.affiliateDisclosure}</p>}
  </>;
}
