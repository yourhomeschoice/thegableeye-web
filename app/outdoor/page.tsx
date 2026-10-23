import Link from "next/link";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { CategoryPublicationPlacementCard } from "@/components/publication-placement-card";
import { PublicationCard } from "@/components/publication-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { mergePublishedArticles, publishedArticlesForCategory } from "@/lib/publication/indexing";
import { getResolvedArticlePlacements } from "@/lib/publication/placements";
import type { PublishedRecommendationComparisonArticle } from "@/lib/publication/types";

const showVisualPreviewCards = true;
const sections = [
  { id: "camping", name: "Camping", detail: "Equipment and practical essentials for time at camp." },
  { id: "hiking-and-walking", name: "Hiking & Walking", detail: "Useful gear for walks, trails and day hikes." },
  { id: "outdoor-gear", name: "Outdoor Gear", detail: "Everyday outdoor equipment and accessories." },
] as const;

function OutdoorVisualPreviewCard({ section }: { section: string }) {
  return <article className="travel-landing-guide"><div className="travel-landing-guide-image" aria-hidden="true"><span>VISUAL PREVIEW</span></div><div className="travel-landing-guide-copy"><p className="eyebrow">Editorial placeholder</p><h3 className="editorial">{section} article</h3><p>No article has been published in this space. This is not a recommendation.</p></div></article>;
}

export default async function OutdoorPage() {
  const placements = await getResolvedArticlePlacements();
  const curatedArticles = [placements.categories.Outdoor.featured, ...placements.categories.Outdoor.highlighted].filter((article): article is PublishedRecommendationComparisonArticle => article !== undefined);
  const categoryArticles = mergePublishedArticles(curatedArticles, await publishedArticlesForCategory("Outdoor"));
  const displayedArticleKeys = new Set<string>();
  const topicSections = sections.map((section) => {
    const articles = categoryArticles.filter((article) => article.subcategory === section.name && !displayedArticleKeys.has(article.articleKey)).slice(0, 3);
    articles.forEach((article) => displayedArticleKeys.add(article.articleKey));
    return { ...section, articles };
  });
  const remainingArticles = categoryArticles.filter((article) => !displayedArticleKeys.has(article.articleKey));

  return <><SiteHeader /><main className="travel-landing site-shell"><section className="travel-landing-hero" aria-labelledby="outdoor-page-title"><div className="travel-landing-hero-copy"><p className="eyebrow">The Gable Eye / Outdoor</p><h1 id="outdoor-page-title" className="editorial">Outdoor choices, made clearer.</h1><p>Independent research and practical comparisons for time spent outside.</p></div></section><section className="travel-landing-section" aria-labelledby="outdoor-topics-title"><div className="travel-landing-heading"><p className="eyebrow">Explore Outdoor</p><h2 id="outdoor-topics-title" className="editorial">Start with what you do outdoors.</h2></div><div className="travel-landing-topic-grid">{sections.map((section) => <Link className="travel-landing-topic" href={`#${section.id}`} key={section.id}><h3 className="editorial">{section.name}</h3><p>{section.detail}</p></Link>)}</div><AffiliateDisclosure variant="site" /></section>{topicSections.map((section) => { const previewCount = Math.max(0, 3 - section.articles.length); return <section className="travel-landing-section" id={section.id} aria-labelledby={`outdoor-${section.id}-title`} key={section.id}><div className="travel-landing-heading"><h2 id={`outdoor-${section.id}-title`} className="editorial">{section.name}</h2><p>{section.detail}</p></div><div className="travel-landing-guide-grid">{section.articles.map((article) => <CategoryPublicationPlacementCard key={article.articleKey} article={article} />)}{showVisualPreviewCards ? Array.from({ length: previewCount }, (_, index) => <OutdoorVisualPreviewCard key={`${section.id}-preview-${index}`} section={section.name} />) : null}</div></section>; })}{remainingArticles.length > 0 && <section className="travel-landing-section" aria-labelledby="outdoor-all-articles-title"><div className="travel-landing-heading"><h2 id="outdoor-all-articles-title" className="editorial">All Outdoor articles</h2></div><div className="article-grid">{remainingArticles.map((article) => <PublicationCard key={article.articleKey} article={article} />)}</div></section>}</main><SiteFooter /></>;
}
