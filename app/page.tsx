import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Image from "next/image";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { HomepagePublicationPlacementCard } from "@/components/publication-placement-card";
import { getResolvedArticlePlacements } from "@/lib/publication/placements";
import type { PublicationCategory } from "@/lib/publication/indexing";
import type { PublishedRecommendationComparisonArticle } from "@/lib/publication/types";

const categories = [
  {
    name: "Home",
    icon: "⌂",
    description: "Kitchen, appliances and coffee",
    href: "/home/",
    available: true,
  },
  {
    name: "Travel",
    icon: "✈",
    description: "Connectivity, travel essentials and luggage",
    href: "/travel/",
    available: true,
  },
  {
    name: "Outdoor",
    icon: "♧",
    description: "Camping, hiking and outdoor gear",
    href: "/outdoor/",
    available: true,
  },
  {
    name: "Lifestyle",
    icon: "⌘",
    description: "Personal care, fitness and everyday essentials",
    href: "/lifestyle/",
    available: true,
  },
];

const latestPlaceholders = [
  {
    id: 1,
    category: "TRAVEL · eSIMs",
    title: "Editorial article",
    description: "A human-approved article will appear here.",
  },
  {
    id: 2,
    category: "HOME · COFFEE",
    title: "Editorial article",
    description: "A human-approved article will appear here.",
  },
  {
    id: 3,
    category: "TECH · LAPTOPS",
    title: "Editorial article",
    description: "A human-approved article will appear here.",
  },
];

// Keep empty public-release slots visible without implying an article is live.
const showVisualFallbackCards = true;

const latestVisualFallbackCards = [
  { id: "connectivity", title: "Connectivity preview", image: "/images/esim.webp", alt: "Abstract connectivity illustration" },
  { id: "home", title: "Home preview", image: "/images/espresso.webp", alt: "Coffee and espresso equipment" },
  { id: "everyday", title: "Everyday choices preview", image: "/images/laptop.webp", alt: "Everyday workspace" },
] as const;

function HomepageVisualFallbackCard({
  title,
  image,
  alt,
}: {
  title: string;
  image?: string;
  alt?: string;
}) {
  return (
    <article className="homepage-latest-card">
      <div className="homepage-card-image homepage-category-placeholder-image">
        {image ? <Image src={image} alt={alt ?? ""} fill sizes="(max-width: 760px) 100vw, (max-width: 1050px) 50vw, 25vw" style={{ objectFit: "cover" }} /> : <span>VISUAL PREVIEW</span>}
      </div>
      <div className="homepage-card-content">
        <p className="eyebrow">Editorial placeholder</p>
        <h3 className="editorial">{title}</h3>
        <p>No article has been published in this space. This is not a recommendation.</p>
      </div>
    </article>
  );
}

const homepageSections = [
  {
    name: "Home",
    description:
      "Make more informed choices for everyday living. From kitchen equipment to home essentials, we focus on what matters in practice.",
    topics: ["Kitchen", "Appliances", "All About Coffee"],
  },
  {
    name: "Travel",
    description:
      "Your travel comparisons in one place. Practical advice on staying connected, travel accessories and making the most of your journey.",
    topics: ["Connectivity", "Travel Essentials", "Luggage & Bags"],
  },
  {
    name: "Outdoor",
    description:
      "Practical guidance for time outside, from camping equipment to hiking and walking essentials.",
    topics: ["Camping", "Hiking & Walking", "Outdoor Gear"],
  },
  {
    name: "Lifestyle",
    description:
      "Useful comparisons for personal care, fitness and everyday essentials.",
    topics: ["Personal Care", "Fitness & Wellbeing", "Everyday Essentials"],
  },
];

export default async function Home() {
  const placements = await getResolvedArticlePlacements();
  const homepagePlacements = placements.homepage;
  void latestPlaceholders;

  return (
    <>
      <SiteHeader />

      <main>
        <div className="homepage-layout site-shell">
          <div className="homepage-main">
            <section className="homepage-feature" aria-labelledby="homepage-feature-title">
              <div className="homepage-feature-content">
                <p className="eyebrow">Featured guide</p>
                {homepagePlacements.featured ? (
                  <>
                    <h1 id="homepage-feature-title" className="editorial">{homepagePlacements.featured.title}</h1>
                    <p>{homepagePlacements.featured.standfirst}</p>
                    <Link className="text-link" href={homepagePlacements.featured.path}>Read article <span aria-hidden="true">→</span></Link>
                  </>
                ) : (
                  <>
                    <h1 id="homepage-feature-title" className="editorial">
                      Independent advice for better decisions.
                    </h1>
                    <p>
                      Clear comparisons, practical research and recommendations
                      supported by evidence.
                    </p>
                    <span className="homepage-coming-soon">
                      Featured article coming soon
                    </span>
                  </>
                )}
              </div>
              <div className="homepage-feature-visual">
  <Image
    src="/images/homepage-feature.webp"
    alt="Editorial collage featuring travel, home and technology"
    fill
    priority
    sizes="(max-width: 760px) 100vw, (max-width: 1050px) 50vw, 35vw"
    style={{ objectFit: "cover" }}
  />
</div>
            </section>

            <nav className="homepage-categories" aria-label="Explore categories">
              {categories.map((category) => {
                const content = (
                  <>
                    <span className="homepage-category-icon" aria-hidden="true">
                      {category.icon}
                    </span>
                    <span className="homepage-category-copy">
                      <strong>{category.name}</strong>
                      <small>{category.description}</small>
                    </span>
                  </>
                );

                return category.available ? (
                  <Link key={category.name} href={category.href} className="homepage-category">
                    {content}
                  </Link>
                ) : (
                  <div key={category.name} className="homepage-category homepage-category-inactive">
                    {content}
                  </div>
                );
              })}
            </nav>

            <AffiliateDisclosure variant="site" />

            <section className="homepage-latest" aria-labelledby="homepage-latest-title">
              <div className="homepage-section-heading">
                <h2 id="homepage-latest-title" className="editorial">
                  Latest from The Gable
                </h2>
              </div>

              <div className="homepage-latest-grid">
                {homepagePlacements.highlighted.slice(0, 3).map((article) => <HomepagePublicationPlacementCard key={article.articleKey} article={article} />)}
                {showVisualFallbackCards
                  ? latestVisualFallbackCards.slice(homepagePlacements.highlighted.length, 3).map((card) => <HomepageVisualFallbackCard key={card.id} {...card} />)
                  : null}
              </div>
            </section>

            {homepageSections.map((section) => (
              <section
                className="homepage-category-section"
                key={section.name}
                aria-labelledby={`section-${section.name.toLowerCase()}`}
              >
                <div className="homepage-category-section-heading">
                  <h2
                    id={`section-${section.name.toLowerCase()}`}
                    className="editorial"
                  >
                    {section.name}
                  </h2>
                  <p>{section.description}</p>
                </div>

                <div className="homepage-latest-grid">
                  {(() => {
                    const articles = section.name === "Outdoor"
                      ? []
                      : [
                          placements.categories[section.name as PublicationCategory].featured,
                          ...placements.categories[section.name as PublicationCategory].highlighted,
                        ].filter((article): article is PublishedRecommendationComparisonArticle => article !== undefined);
                    return articles.length
                      ? articles.map((article) => <HomepagePublicationPlacementCard key={article.articleKey} article={article} />)
                      : (showVisualFallbackCards ? section.topics : []).map((topic) => (
                    <article className="homepage-latest-card" key={topic}>
                      <div className="homepage-card-image homepage-category-placeholder-image">
                        <span>EDITORIAL IMAGE</span>
                      </div>
                      <div className="homepage-card-content">
                        <p className="eyebrow">
                          {section.name.toUpperCase()} · {topic.toUpperCase()}
                        </p>
                        <h3 className="editorial">Editorial article</h3>
                        <p>No article has been published in this space. This is not a recommendation.</p>
                      </div>
                    </article>
                      ));
                  })()}
                </div>
              </section>
            ))}
          </div>

          <aside className="homepage-sidebar" aria-label="Featured and popular guides">
            <section className="homepage-sidebar-feature">
              <p className="eyebrow">Featured guide</p>
              <div className="homepage-sidebar-image">
                <span>EDITORIAL IMAGE</span>
              </div>
              <h2 className="editorial">Editorial guide</h2>
              <p>A human-approved guide will appear here.</p>
            </section>

            <section className="homepage-popular">
              <h2 className="editorial">Popular guides</h2>
              <p className="homepage-sidebar-note">
                Selected guides will appear here as the publication grows.
              </p>
              {[1, 2, 3, 4].map((number) => (
                <div className="homepage-popular-item" key={number}>
                  <div className="homepage-popular-image" aria-hidden="true" />
                  <span>Editorial guide</span>
                </div>
              ))}
            </section>
          </aside>
        </div>

        <section className="approach-section site-shell">
          <div>
            <p className="eyebrow">Our approach</p>
            <h2 className="editorial">
              Independent.
              <br />
              Evidence-led.
            </h2>
          </div>
          <div className="approach-copy">
            <p>
              We explain the scope of a comparison, keep uncertainty visible
              and make recommendations only where evidence supports them.
            </p>
            <Link className="text-link" href="/how-we-research/">
              How we research <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
