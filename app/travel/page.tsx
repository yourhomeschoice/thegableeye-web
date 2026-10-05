import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PublicationCard } from "@/components/publication-card";
import { publishedTravelArticles, travelSections } from "@/lib/publication/indexing";

export default async function Page() {
  const articles = await publishedTravelArticles();

  return (
    <>
      <SiteHeader />
      <main className="trust-page">
        <section className="travel-index-inner">
          <p className="eyebrow">Travel</p>
          <h1 className="editorial">Travel, carefully scoped.</h1>
          <p className="trust-standfirst">Research and recommendations for defined travel questions.</p>
          {travelSections.map((section) => {
            const items = articles.filter((article) => article.subcategory === section.name);

            return items.length ? (
              <section key={section.name} className="travel-block">
                <h2 className="editorial">{section.name}</h2>
                <div className="article-grid index-grid">
                  {items.slice(0, 4).map((article) => <PublicationCard key={article.path} article={article} />)}
                </div>
              </section>
            ) : null;
          })}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
