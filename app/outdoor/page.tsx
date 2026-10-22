import Link from "next/link";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { CategoryPublicationPlacementCard } from "@/components/publication-placement-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getResolvedArticlePlacements } from "@/lib/publication/placements";
import type { PublishedRecommendationComparisonArticle } from "@/lib/publication/types";

const showVisualPreviewCards = process.env.NODE_ENV === "development";

const sections = [
  { id: "camping", name: "Camping", detail: "Equipment and practical essentials for time at camp." },
  { id: "hiking-and-walking", name: "Hiking & Walking", detail: "Useful gear for walks, trails and day hikes." },
  { id: "outdoor-gear", name: "Outdoor Gear", detail: "Everyday outdoor equipment and accessories." },
] as const;

function OutdoorVisualPreviewCard({ section }: { section: string }) {
  return <article className="travel-landing-guide"><div className="travel-landing-guide-image" aria-hidden="true"><span>VISUAL PREVIEW</span></div><div className="travel-landing-guide-copy"><p className="eyebrow">Local visual preview</p><h3 className="editorial">{section} preview</h3><p>Design-review placeholder only. This is not a published article or recommendation.</p></div></article>;
}

export default async function OutdoorPage() {
  const placements = await getResolvedArticlePlacements();
  const placedArticles = [placements.categories.Outdoor.featured, ...placements.categories.Outdoor.highlighted].filter(
    (article): article is PublishedRecommendationComparisonArticle => article !== undefined,
  );

  return <><SiteHeader /><main className="travel-landing site-shell"><section className="travel-landing-hero" aria-labelledby="outdoor-page-title"><div className="travel-landing-hero-copy"><p className="eyebrow">The Gable Eye / Outdoor</p><h1 id="outdoor-page-title" className="editorial">Outdoor choices, made clearer.</h1><p>Independent research and practical comparisons for time spent outside.</p></div></section><section className="travel-landing-section" aria-labelledby="outdoor-topics-title"><div className="travel-landing-heading"><p className="eyebrow">Explore Outdoor</p><h2 id="outdoor-topics-title" className="editorial">Start with what you do outdoors.</h2></div><div className="travel-landing-topic-grid">{sections.map((section) => <Link className="travel-landing-topic" href={`#${section.id}`} key={section.id}><h3 className="editorial">{section.name}</h3><p>{section.detail}</p></Link>)}</div><AffiliateDisclosure variant="site" /></section>{sections.map((section) => { const sectionArticles = placedArticles.filter((article) => article.subcategory === section.name).slice(0, 3); const previewCount = Math.max(0, 3 - sectionArticles.length); return <section className="travel-landing-section" id={section.id} aria-labelledby={`outdoor-${section.id}-title`} key={section.id}><div className="travel-landing-heading"><h2 id={`outdoor-${section.id}-title`} className="editorial">{section.name}</h2><p>{section.detail}</p></div><div className="travel-landing-guide-grid">{sectionArticles.map((article) => <CategoryPublicationPlacementCard key={article.articleKey} article={article} />)}{showVisualPreviewCards ? Array.from({ length: previewCount }, (_, index) => <OutdoorVisualPreviewCard key={`${section.id}-preview-${index}`} section={section.name} />) : null}</div></section>; })}</main><SiteFooter /></>;
}
