import Image from "next/image";
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
  { id: "connectivity", name: "Connectivity", detail: "eSIMs, mobile data and staying connected abroad.", subcategories: ["Connectivity", "eSIMs & Connectivity"] },
  { id: "travel-essentials", name: "Travel Essentials", detail: "Useful equipment for smoother journeys.", subcategories: ["Travel Essentials", "Travel Accessories"] },
  { id: "luggage-and-bags", name: "Luggage & Bags", detail: "Suitcases, cabin bags and backpacks.", subcategories: ["Luggage & Bags", "Luggage"] },
] as const;

function TravelVisualPreviewCard({ section }: { section: string }) {
  return <article className="travel-landing-guide"><div className="travel-landing-guide-image" aria-hidden="true"><span>VISUAL PREVIEW</span></div><div className="travel-landing-guide-copy"><p className="eyebrow">Editorial placeholder</p><h3 className="editorial">{section} article</h3><p>No article has been published in this space. This is not a recommendation.</p></div></article>;
}

export default async function TravelPage() {
  const placements = await getResolvedArticlePlacements();
  const curatedArticles = [placements.categories.Travel.featured, ...placements.categories.Travel.highlighted].filter(
    (article): article is PublishedRecommendationComparisonArticle => article !== undefined,
  );
  const categoryArticles = mergePublishedArticles(curatedArticles, await publishedArticlesForCategory("Travel"));
  const displayedArticleKeys = new Set<string>();
  const topicSections = sections.map((section) => {
    const articles = categoryArticles.filter((article) => section.subcategories.includes(article.subcategory as never) && !displayedArticleKeys.has(article.articleKey)).slice(0, 3);
    articles.forEach((article) => displayedArticleKeys.add(article.articleKey));
    return { ...section, articles };
  });
  const remainingArticles = categoryArticles.filter((article) => !displayedArticleKeys.has(article.articleKey));

  return <><SiteHeader /><main className="travel-landing site-shell"><section className="travel-landing-hero" aria-labelledby="category-page-title"><div className="travel-landing-hero-copy"><p className="eyebrow">The Gable Eye / Travel</p><h1 id="category-page-title" className="editorial">Travel, made clearer.</h1><p>Independent research and practical comparisons to help you choose how to stay connected, what to pack and what to take with you.</p></div><div className="travel-landing-hero-image"><Image src="/images/Travel page pic.jpg" alt="Coastal town beside turquoise water and mountains" fill priority sizes="(max-width: 760px) 100vw, 60vw" style={{ objectFit: "cover" }} /></div></section><section className="travel-landing-section" aria-labelledby="travel-topics-title"><div className="travel-landing-heading"><p className="eyebrow">Explore Travel</p><h2 id="travel-topics-title" className="editorial">Three ways to travel smarter.</h2></div><div className="travel-landing-topic-grid">{sections.map((section) => <Link className="travel-landing-topic" href={`#${section.id}`} key={section.id}><h3 className="editorial">{section.name}</h3><p>{section.detail}</p></Link>)}</div><AffiliateDisclosure variant="site" /></section>{topicSections.map((section) => { const previewCount = Math.max(0, 3 - section.articles.length); return <section className="travel-landing-section" id={section.id} aria-labelledby={`travel-${section.id}-title`} key={section.id}><div className="travel-landing-heading"><h2 id={`travel-${section.id}-title`} className="editorial">{section.name}</h2><p>{section.detail}</p></div><div className="travel-landing-guide-grid">{section.articles.map((article) => <CategoryPublicationPlacementCard key={article.articleKey} article={article} />)}{showVisualPreviewCards ? Array.from({ length: previewCount }, (_, index) => <TravelVisualPreviewCard key={`${section.id}-preview-${index}`} section={section.name} />) : null}</div></section>; })}{remainingArticles.length > 0 && <section className="travel-landing-section" aria-labelledby="travel-all-articles-title"><div className="travel-landing-heading"><h2 id="travel-all-articles-title" className="editorial">All Travel articles</h2></div><div className="article-grid">{remainingArticles.map((article) => <PublicationCard key={article.articleKey} article={article} />)}</div></section>}</main><SiteFooter /></>;
}
