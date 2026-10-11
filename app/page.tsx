import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Image from "next/image";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { HomepageLaunchArticlePlacementCard } from "@/components/launch-article-placement-card";
import { getDevelopmentArticlePlacement, getDevelopmentTravelAdapterPlacement, getDevelopmentFridgeFreezerPlacement, getDevelopmentCoffeeEspressoPlacement, getDevelopmentLaptopEbs008Placement } from "@/lib/launch-baseline/article-placement";

const categories = [
  {
    name: "Travel",
    icon: "✈",
    description: "eSIMs, transport, car hire and more",
    href: "/travel/",
    available: true,
  },
  {
    name: "Tech",
    icon: "⌘",
    description: "Devices, software and everyday technology",
    href: "/tech/",
    available: false,
  },
  {
    name: "Home",
    icon: "⌂",
    description: "Appliances, kitchen and home essentials",
    href: "/home/",
    available: false,
  },
  {
    name: "Lifestyle",
    icon: "♧",
    description: "Outdoor, family and everyday life",
    href: "/lifestyle/",
    available: false,
  },
];

const latestPlaceholders = [
  {
    id: 1,
    category: "TRAVEL · eSIMs",
    title: "Choosing an eSIM for international travel",
    description: "Explore connectivity options and the practical details worth comparing.",
    image: "/images/esim.webp",
    alt: "Digital SIM card illustration with electronic circuitry",
  },
  {
    id: 2,
    category: "HOME · COFFEE",
    title: "Finding the right home espresso machine",
    description: "A closer look at the features and everyday considerations of home espresso.",
    image: "/images/espresso.webp",
    alt: "Cup of coffee with latte art on an espresso machine",
  },
  {
    id: 3,
    category: "TECH · LAPTOPS",
    title: "Choosing a laptop for everyday use",
    description: "Exploring practical features and considerations for everyday computing.",
    image: "/images/laptop.webp",
    alt: "Laptop on a bright minimalist desk",
  },
];

const homepageSections = [
  {
    name: "Travel",
    description:
      "Your travel comparisons in one place. Practical advice on staying connected, travel accessories and making the most of your journey.",
    topics: ["eSIMs", "Travel accessories", "Luggage"],
  },
  {
    name: "Tech",
    description:
      "Technology explained without the jargon. Clear comparisons to help you choose devices and digital tools that suit your needs.",
    topics: ["Laptops", "Smartphones", "Accessories"],
  },
  {
    name: "Home",
    description:
      "Make more informed choices for everyday living. From kitchen equipment to home essentials, we focus on what matters in practice.",
    topics: ["Coffee machines", "Kitchen appliances", "Home essentials"],
  },
  {
    name: "Lifestyle",
    description:
      "Useful comparisons for life beyond the essentials. Thoughtful guidance on outdoor gear, family products and everyday purchases.",
    topics: ["Outdoor", "Family", "Everyday living"],
  },
];

export default async function Home() {
  const developmentArticle = await getDevelopmentArticlePlacement();
  const travelAdapterArticle = await getDevelopmentTravelAdapterPlacement();
  const fridgeFreezerArticle = await getDevelopmentFridgeFreezerPlacement();
  const coffeeEspressoArticle = await getDevelopmentCoffeeEspressoPlacement();
  const laptopArticle = await getDevelopmentLaptopEbs008Placement();

  return (
    <>
      <SiteHeader />

      <main>
        <div className="homepage-layout site-shell">
          <div className="homepage-main">
            <section className="homepage-feature" aria-labelledby="homepage-feature-title">
              <div className="homepage-feature-content">
                <p className="eyebrow">Featured guide</p>
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
                {latestPlaceholders.map((item, index) =>
                  index === 0 && developmentArticle ? (
                    <HomepageLaunchArticlePlacementCard key={developmentArticle.id} article={developmentArticle} />
                  ) : index === 1 && coffeeEspressoArticle ? (
                    <HomepageLaunchArticlePlacementCard key={coffeeEspressoArticle.id} article={coffeeEspressoArticle} />
                  ) : index === 2 && laptopArticle ? (
                    <HomepageLaunchArticlePlacementCard key={laptopArticle.id} article={laptopArticle} />
                  ) : (
                  <article className="homepage-latest-card" key={item.id}>
                    <div className="homepage-card-image">
  <Image
    src={item.image}
    alt={item.alt}
    fill
    sizes="(max-width: 760px) 100vw, (max-width: 1050px) 50vw, 25vw"
    style={{ objectFit: "cover" }}
  />
</div>
                    <div className="homepage-card-content">
                      <p className="eyebrow">{item.category}</p>
                      <h3 className="editorial">{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </article>
                  ),
                )}
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
                  {section.topics.map((topic, index) =>
                    section.name === "Travel" && index === 0 && developmentArticle ? (
                      <HomepageLaunchArticlePlacementCard key={developmentArticle.id} article={developmentArticle} />
                    ) : section.name === "Travel" && index === 1 && travelAdapterArticle ? (
                      <HomepageLaunchArticlePlacementCard key={travelAdapterArticle.id} article={travelAdapterArticle} />
                    ) : section.name === "Home" && index === 1 && fridgeFreezerArticle ? (
                      <HomepageLaunchArticlePlacementCard key={fridgeFreezerArticle.id} article={fridgeFreezerArticle} />
                    ) : section.name === "Home" && index === 0 && coffeeEspressoArticle ? (
                      <HomepageLaunchArticlePlacementCard key={coffeeEspressoArticle.id} article={coffeeEspressoArticle} />
                    ) : section.name === "Tech" && index === 0 && laptopArticle ? (
                      <HomepageLaunchArticlePlacementCard key={laptopArticle.id} article={laptopArticle} />
                    ) : (
                    <article className="homepage-latest-card" key={topic}>
                      <div className="homepage-card-image homepage-category-placeholder-image">
                        <span>EDITORIAL IMAGE</span>
                      </div>
                      <div className="homepage-card-content">
                        <p className="eyebrow">
                          {section.name.toUpperCase()} · {topic.toUpperCase()}
                        </p>
                        <h3 className="editorial">{topic}</h3>
                        <p>Article coming soon.</p>
                      </div>
                    </article>
                    ),
                  )}
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
              <h2 className="editorial">Featured guide placeholder</h2>
              <p>Our next featured comparison will appear here.</p>
            </section>

            <section className="homepage-popular">
              <h2 className="editorial">Popular guides</h2>
              <p className="homepage-sidebar-note">
                Selected guides will appear here as the publication grows.
              </p>
              {[1, 2, 3, 4].map((number) => (
                <div className="homepage-popular-item" key={number}>
                  <div className="homepage-popular-image" aria-hidden="true" />
                  <span>Guide placeholder {number}</span>
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
