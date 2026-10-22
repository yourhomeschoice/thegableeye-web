import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ComparedOptions } from "@/components/compared-options";
import { RecommendationPanel } from "@/components/recommendation-panel";
import { PublicationCard } from "@/components/publication-card";
import {
  HouseAlternativeAssessments,
  HouseArticleHero,
  HouseComparisonTable,
  HouseEditorialIndependence,
  HouseGuideAndDisclosure,
  HouseVerdict,
} from "@/components/house-article-presentation";
import type {
  PublishedRecommendationComparisonArticle,
  RecommendationComparisonArticle,
} from "@/lib/publication/types";
import { categoryHref, subcategoryHref } from "@/lib/publication/indexing";
import { sanitiseTrustedEditorialHtml } from "@/lib/publication/editorial-html";

type RecommendationArticleProps = {
  article: RecommendationComparisonArticle;
  relatedArticles?: readonly PublishedRecommendationComparisonArticle[];
};

export function RecommendationArticle({ article, relatedArticles = [] }: RecommendationArticleProps) {
  if (article.articleBody) {
    const body = article.articleBody;
    if (body.format === "HOUSE") {
      return <HouseArticle article={article} relatedArticles={relatedArticles} />;
    }
    return (
      <main className="article-page"><article className="article-shell">
        <ArticleChrome article={article} showTitle={body.format !== "HTML"} />
        <div className="article-reading article-markdown">
          {body.format === "MARKDOWN" ? <ReactMarkdown>{body.content}</ReactMarkdown> : <div className="article-html" dangerouslySetInnerHTML={{ __html: sanitiseTrustedEditorialHtml(body.content) }} />}
        </div>
        <RelatedReading articles={relatedArticles} />
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
      <RelatedReading articles={relatedArticles} />
    </article></main>
  );
}

function HouseArticle({ article, relatedArticles = [] }: RecommendationArticleProps) {
  const body = article.articleBody;
  if (!body || body.format !== "HOUSE") return null;
  const { guide, sections } = body.presentation;
  const hasMethodology = sections.some(
    (section) => section.kind === "TEXT" && section.role === "METHODOLOGY",
  );

  return (
    <main className="article-page"><article className="article-shell">
      <ArticleChrome article={article} suppressAffiliateDisclosure />
      {article.image && <HouseArticleHero src={article.image.src} alt={article.image.alt} caption={article.image.caption} width={article.image.width} height={article.image.height} />}
      <div className="article-reading house-article-reading">
        <HouseGuideAndDisclosure items={guide.map((item) => ({ href: `#${item.targetId}`, label: item.label }))}>
          The Gable Eye may earn a commission if you buy through certain links in our articles, at no additional cost to you. This does not influence our editorial recommendations.
        </HouseGuideAndDisclosure>
        {sections.map((section) => <HouseSection key={section.id} section={section} />)}
        {!hasMethodology && <HouseEditorialIndependence />}
      </div>
      <RelatedReading articles={relatedArticles} />
    </article></main>
  );
}

function HouseSection({ section }: { section: Extract<NonNullable<RecommendationComparisonArticle["articleBody"]>, { format: "HOUSE" }>["presentation"]["sections"][number] }) {
  if (section.kind === "TEXT") {
    return <><section id={section.id}><h2 className="editorial">{section.heading}</h2>{section.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{section.subsections?.map((subsection) => <div key={subsection.heading}><h3 className="editorial">{subsection.heading}</h3>{subsection.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>)}</section>{section.role === "METHODOLOGY" && <HouseEditorialIndependence />}</>;
  }
  if (section.kind === "VERDICT") {
    return <HouseVerdict id={section.id}>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</HouseVerdict>;
  }
  if (section.kind === "COMPARISON") {
    return <HouseComparisonTable id={section.id} heading={section.heading} introduction={section.introduction?.map((paragraph, index) => <p key={index}>{paragraph}</p>)} columns={section.columns.map((column) => ({ label: column.label }))} rows={section.rows} stickyFirstColumn={section.stickyFirstColumn} />;
  }
  return <HouseAlternativeAssessments id={section.id} heading={section.heading} alternatives={section.items.map((item) => ({ heading: item.heading, body: item.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>) }))} />;
}

function RelatedReading({
  articles,
}: {
  articles: readonly PublishedRecommendationComparisonArticle[];
}) {
  if (!articles.length) return null;

  return (
    <section className="related-reading" aria-labelledby="related-reading-title">
      <p className="eyebrow">Continue reading</p>
      <h2 id="related-reading-title" className="editorial">Related reading</h2>
      <div className="article-grid related-reading-grid">
        {articles.map((article) => <PublicationCard key={article.articleKey} article={article} />)}
      </div>
    </section>
  );
}

function ArticleChrome({ article, showTitle = true, suppressAffiliateDisclosure = false }: RecommendationArticleProps & { showTitle?: boolean; suppressAffiliateDisclosure?: boolean }) {
  const categoryLink = categoryHref(article.category);
  const subcategoryLink = subcategoryHref(article.category, article.subcategory);

  return <>
    <nav className="breadcrumb" aria-label="Breadcrumb">{categoryLink ? <Link href={categoryLink}>{article.category}</Link> : <span>{article.category}</span>}<span aria-hidden="true">/</span>{subcategoryLink ? <Link href={subcategoryLink}>{article.subcategory}</Link> : <span>{article.subcategory}</span>}</nav>
    <header className="article-header"><p className="eyebrow">{article.articleType}</p>{showTitle && <h1 className="editorial">{article.title}</h1>}<p className="article-standfirst">{article.standfirst}</p><div className="article-meta"><span>By {article.author}</span><span>Last researched: {article.lastResearched}</span></div></header>
    {!suppressAffiliateDisclosure && article.affiliateDisclosure && <p className="affiliate-disclosure"><strong>Affiliate disclosure:</strong> {article.affiliateDisclosure}</p>}
  </>;
}
