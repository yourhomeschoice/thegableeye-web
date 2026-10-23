import Image from "next/image";
import { CategoryPublicationPlacementCard } from "@/components/publication-placement-card";
import { PublicationCard } from "@/components/publication-card";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { mergePublishedArticles } from "@/lib/publication/indexing";
import type { ResolvedArticlePlacementCollection } from "@/lib/publication/placements";
import type { PublishedRecommendationComparisonArticle } from "@/lib/publication/types";

export type CategoryGuide = { category: string; title: string; description: string };
export type CategoryTopic = { id: string; name: string; detail: string };
export type CategoryGuideSection = { id: string; name: string; detail: string; guides: Omit<CategoryGuide, "category">[] };
export type CategoryLandingConfig = {
  category: string;
  headline: string;
  introduction: string;
  heroImage: string;
  heroAlt: string;
  exploreHeadline: string;
  recentHeadline: string;
  recentDescription: string;
  topics: CategoryTopic[];
  recentPicks: CategoryGuide[];
  sections: CategoryGuideSection[];
};

function GuidePlaceholder({ guide }: { guide: CategoryGuide }) {
  return <article className="travel-landing-guide"><div className="travel-landing-guide-image" aria-hidden="true"><span>EDITORIAL IMAGE</span></div><div className="travel-landing-guide-copy"><p className="eyebrow">{guide.category}</p><h3 className="editorial">Editorial article</h3><p>A human-approved article will appear here.</p><span className="travel-landing-coming-soon">Coming soon</span></div></article>;
}

export function CategoryLandingPage({ config, placements, articles }: { config: CategoryLandingConfig; placements: ResolvedArticlePlacementCollection; articles: readonly PublishedRecommendationComparisonArticle[] }) {
  const placedArticles = [placements.featured, ...placements.highlighted].filter((article): article is PublishedRecommendationComparisonArticle => article !== undefined);
  const categoryArticles = mergePublishedArticles(placedArticles, articles);
  const displayedArticleKeys = new Set(placedArticles.map((article) => article.articleKey));
  const topicSections = config.sections.map((section) => {
    const topicArticles = mergePublishedArticles(
      placements.topicArticles[section.name] ?? [],
      categoryArticles.filter((article) => article.subcategory === section.name),
    ).filter((article) => !displayedArticleKeys.has(article.articleKey)).slice(0, 3);
    topicArticles.forEach((article) => displayedArticleKeys.add(article.articleKey));
    return { ...section, articles: topicArticles };
  });
  const remainingArticles = categoryArticles.filter((article) => !displayedArticleKeys.has(article.articleKey));

  return <><SiteHeader /><main className="travel-landing site-shell"><section className="travel-landing-hero" aria-labelledby="category-page-title"><div className="travel-landing-hero-copy"><p className="eyebrow">The Gable Eye / {config.category}</p><h1 id="category-page-title" className="editorial">{config.headline}</h1><p>{config.introduction}</p></div><div className="travel-landing-hero-image"><Image src={config.heroImage} alt={config.heroAlt} fill priority sizes="(max-width: 760px) 100vw, 60vw" style={{ objectFit: "cover" }} /></div></section><section className="travel-landing-section" aria-labelledby="category-topics-title"><div className="travel-landing-heading"><p className="eyebrow">Explore {config.category}</p><h2 id="category-topics-title" className="editorial">{config.exploreHeadline}</h2></div><div className="travel-landing-topic-grid">{config.topics.map((topic) => <div className="travel-landing-topic" id={topic.id} key={topic.id}><h3 className="editorial">{topic.name}</h3><p>{topic.detail}</p></div>)}</div><AffiliateDisclosure variant="site" /></section><section className="travel-landing-section" aria-labelledby="category-recent-title"><div className="travel-landing-heading"><h2 id="category-recent-title" className="editorial">{config.recentHeadline}</h2><p>{config.recentDescription}</p></div><div className="travel-landing-guide-grid">{placedArticles.length ? placedArticles.map((article) => <CategoryPublicationPlacementCard key={article.articleKey} article={article} />) : config.recentPicks.map((guide) => <GuidePlaceholder key={guide.title} guide={guide} />)}</div></section>{topicSections.map((section) => <section className="travel-landing-section" aria-labelledby={`category-${section.id}-title`} key={section.id}><div className="travel-landing-heading"><h2 id={`category-${section.id}-title`} className="editorial">{section.name}</h2><p>{section.detail}</p></div><div className="travel-landing-guide-grid">{section.articles.length ? section.articles.map((article) => <CategoryPublicationPlacementCard key={article.articleKey} article={article} />) : section.guides.map((guide) => <GuidePlaceholder key={guide.title} guide={{ ...guide, category: section.name }} />)}</div></section>)}{remainingArticles.length > 0 && <section className="travel-landing-section" aria-labelledby="category-all-articles-title"><div className="travel-landing-heading"><h2 id="category-all-articles-title" className="editorial">All {config.category} articles</h2></div><div className="article-grid">{remainingArticles.map((article) => <PublicationCard key={article.articleKey} article={article} />)}</div></section>}</main><SiteFooter /></>;
}
