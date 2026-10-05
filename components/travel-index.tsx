import Link from "next/link";
import { PublicationCard } from "@/components/publication-card";
import type { RecommendationComparisonArticle } from "@/lib/publication/types";

export function TravelIndex({
  title,
  standfirst,
  articles,
  empty,
}: {
  title: string;
  standfirst: string;
  articles: readonly RecommendationComparisonArticle[];
  empty?: string;
}) {
  return (
    <main className="trust-page">
      <section className="travel-index-inner">
        <p className="eyebrow">Travel</p>
        <h1 className="editorial">{title}</h1>
        <p className="trust-standfirst">{standfirst}</p>
        {articles.length ? (
          <div className="article-grid index-grid">
            {articles.map((article) => <PublicationCard key={article.path} article={article} />)}
          </div>
        ) : (
          <p className="index-empty">{empty ?? "No published articles are available in this section yet."}</p>
        )}
        <Link className="text-link" href="/travel/">All Travel coverage <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}
