import Image from "next/image";
import { LaunchArticlePlacementCard } from "@/components/launch-article-placement-card";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { DevelopmentArticlePlacement } from "@/lib/launch-baseline/article-placement";

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
  return (
    <article className="travel-landing-guide">
      <div className="travel-landing-guide-image" aria-hidden="true"><span>Editorial image</span></div>
      <div className="travel-landing-guide-copy">
        <p className="eyebrow">{guide.category}</p>
        <h3 className="editorial">{guide.title}</h3>
        <p>{guide.description}</p>
        <span className="travel-landing-coming-soon">Article coming soon</span>
      </div>
    </article>
  );
}

export function CategoryLandingPage({
  config,
  developmentArticle,
  travelAdapterArticle,
  coffeeArticle,
}: {
  config: CategoryLandingConfig;
  developmentArticle?: DevelopmentArticlePlacement | null;
  travelAdapterArticle?: DevelopmentArticlePlacement | null;
  coffeeArticle?: DevelopmentArticlePlacement | null;
}) {
  return (
    <>
      <SiteHeader />
      <main className="travel-landing site-shell">
        <section className="travel-landing-hero" aria-labelledby="category-page-title">
          <div className="travel-landing-hero-copy">
            <p className="eyebrow">The Gable Eye / {config.category}</p>
            <h1 id="category-page-title" className="editorial">{config.headline}</h1>
            <p>{config.introduction}</p>
          </div>
          <div className="travel-landing-hero-image">
            <Image src={config.heroImage} alt={config.heroAlt} fill priority
              sizes="(max-width: 760px) 100vw, 60vw" style={{ objectFit: "cover" }} />
          </div>
        </section>
        <section className="travel-landing-section" aria-labelledby="category-topics-title">
          <div className="travel-landing-heading">
            <p className="eyebrow">Explore {config.category}</p>
            <h2 id="category-topics-title" className="editorial">{config.exploreHeadline}</h2>
          </div>
          <div className="travel-landing-topic-grid">
            {config.topics.map((topic) => (
              <div className="travel-landing-topic" key={topic.id}>
                <h3 className="editorial">{topic.name}</h3>
                <p>{topic.detail}</p>
              </div>
            ))}
          </div>
          <AffiliateDisclosure variant="site" />
        </section>
        <section className="travel-landing-section" aria-labelledby="category-recent-title">
          <div className="travel-landing-heading">
            <h2 id="category-recent-title" className="editorial">{config.recentHeadline}</h2>
            <p>{config.recentDescription}</p>
          </div>
          <div className="travel-landing-guide-grid">
            {config.recentPicks.map((guide, index) =>
              index === 0 && developmentArticle ? (
                <LaunchArticlePlacementCard key={developmentArticle.id} article={developmentArticle} />
              ) : index === 0 && coffeeArticle ? (
                <LaunchArticlePlacementCard key={coffeeArticle.id} article={coffeeArticle} />
              ) : index === 1 && travelAdapterArticle ? (
                <LaunchArticlePlacementCard key={travelAdapterArticle.id} article={travelAdapterArticle} />
              ) : (
                <GuidePlaceholder key={guide.title} guide={guide} />
              ),
            )}
          </div>
        </section>
        {config.sections.map((section) => (
          <section className="travel-landing-section" aria-labelledby={`category-${section.id}-title`} key={section.id}>
            <div className="travel-landing-heading">
              <h2 id={`category-${section.id}-title`} className="editorial">{section.name}</h2>
              <p>{section.detail}</p>
            </div>
            <div className="travel-landing-guide-grid">
              {section.guides.map((guide, index) =>
                section.id === "connectivity" && index === 0 && developmentArticle ? (
                  <LaunchArticlePlacementCard key={developmentArticle.id} article={developmentArticle} />
                ) : section.id === "coffee" && index === 0 && coffeeArticle ? (
                  <LaunchArticlePlacementCard key={coffeeArticle.id} article={coffeeArticle} />
                ) : (section.id === "accessories" && index === 0 || section.id === "kitchen" && index === 1) && travelAdapterArticle ? (
                  <LaunchArticlePlacementCard key={travelAdapterArticle.id} article={travelAdapterArticle} />
                ) : (
                  <GuidePlaceholder key={guide.title} guide={{ ...guide, category: section.name }} />
                ),
              )}
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
