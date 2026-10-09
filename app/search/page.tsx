import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { publicationSource } from "@/lib/publication/publication-source";

export const metadata: Metadata = {
  title: "Search | The Gable Eye",
  description: "Search independently researched guides and recommendations from The Gable Eye.",
  robots: { index: false, follow: true },
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (typeof params.q === "string" ? params.q : "").trim().slice(0, 120);
  const normalizedQuery = query.toLocaleLowerCase();
  const articles = query ? await publicationSource.getPublishedArticles() : [];
  const results = articles.filter((article) =>
    [article.title, article.standfirst, article.category, article.subcategory]
      .some((field) => field.toLocaleLowerCase().includes(normalizedQuery)),
  );

  return (
    <>
      <SiteHeader />
      <main className="search-page site-shell">
        <p className="eyebrow">Explore The Gable Eye</p>
        <h1 className="editorial">Search our guides.</h1>
        <p className="search-introduction">
          Find independent research, comparisons and practical recommendations.
        </p>
        <form action="/search/" method="get" role="search" className="search-form">
          <label htmlFor="site-search">Search articles</label>
          <div className="search-form-controls">
            <input
              id="site-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="What are you looking for?"
              maxLength={120}
              autoComplete="off"
            />
            <button type="submit">Search</button>
          </div>
        </form>
        <section className="search-results" aria-live="polite">
          {!query ? (
            <p className="search-empty">Enter a topic or product above to search our published guides.</p>
          ) : results.length === 0 ? (
            <div className="search-empty">
              <h2 className="editorial">No matching guides yet.</h2>
              <p>We could not find a published guide matching your search. Try another term, or explore our categories.</p>
              <Link href="/travel/">Explore Travel</Link>
            </div>
          ) : (
            <>
              <p className="search-result-count">
                {results.length} {results.length === 1 ? "guide" : "guides"} found
              </p>
              <ul className="search-result-list">
                {results.map((article) => (
                  <li key={article.path} className="search-result-item">
                    <p className="eyebrow">{article.category} / {article.subcategory}</p>
                    <h2 className="editorial"><Link href={article.path}>{article.title}</Link></h2>
                    <p>{article.standfirst}</p>
                    <Link className="search-result-read" href={article.path}>Read guide →</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
