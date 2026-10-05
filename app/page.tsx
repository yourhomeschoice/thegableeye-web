import Link from "next/link";
import { PublicationCard } from "@/components/publication-card";
import { PublicationImage } from "@/components/publication-image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  publishedTravelArticles,
  travelSections,
} from "@/lib/publication/indexing";

// The ordered set determines the temporary homepage lead and secondary cards;
// it is presentation ordering, not editorial curation.
export default async function Home() {
  const articles = await publishedTravelArticles();
  const [lead, ...latest] = articles;

  return (
    <>
      <SiteHeader />

      <main>
        {lead && (
          <section className="hero site-shell">
            <div className="hero-copy">
              <p className="eyebrow">
                {lead.category} / {lead.subcategory}
              </p>

              <h1 className="editorial">{lead.title}</h1>

              <p className="hero-summary">{lead.standfirst}</p>

              <Link className="button button-primary" href={lead.path}>
                Read article <span aria-hidden="true">→</span>
              </Link>
            </div>

            <PublicationImage image={lead.image} variant="hero" />
          </section>
        )}

        <section className="content-section site-shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Current research</p>
              <h2 className="editorial">
                Useful questions, carefully framed.
              </h2>
            </div>

            <Link className="text-link" href="/travel/">
              Travel coverage <span aria-hidden="true">→</span>
            </Link>
          </div>

          {latest.length > 0 && (
            <div className="article-grid">
              {latest.slice(0, 3).map((article) => (
                <PublicationCard
                  key={article.path}
                  article={article}
                />
              ))}
            </div>
          )}
        </section>

        {travelSections.map((section) => {
          const items = articles.filter(
            (article) => article.subcategory === section.name,
          );

          return items.length ? (
            <section
              className="content-section category-section"
              key={section.name}
            >
              <div className="site-shell">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Travel</p>
                    <h2 className="editorial">{section.name}</h2>
                  </div>

                  <Link className="text-link" href={section.href}>
                    All articles <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <div className="article-grid">
                  {items.slice(0, 4).map((article) => (
                    <PublicationCard
                      key={article.path}
                      article={article}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : null;
        })}

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