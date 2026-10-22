import Link from "next/link";
import { PublicationImage } from "@/components/publication-image";
import type { PublishedRecommendationComparisonArticle } from "@/lib/publication/types";

export function HomepagePublicationPlacementCard({
  article,
}: {
  article: PublishedRecommendationComparisonArticle;
}) {
  return (
    <article className="homepage-latest-card">
      <Link className="homepage-card-image publication-placement-image" href={article.path} aria-label={article.title}>
        <PublicationImage image={article.image} variant="card" />
      </Link>
      <div className="homepage-card-content">
        <p className="eyebrow">{article.category} / {article.subcategory}</p>
        <h3 className="editorial"><Link href={article.path}>{article.title}</Link></h3>
        <p>{article.standfirst}</p>
      </div>
    </article>
  );
}

export function CategoryPublicationPlacementCard({
  article,
}: {
  article: PublishedRecommendationComparisonArticle;
}) {
  return (
    <article className="travel-landing-guide">
      <Link className="travel-landing-guide-image publication-placement-image" href={article.path} aria-label={article.title}>
        <PublicationImage image={article.image} variant="card" />
      </Link>
      <div className="travel-landing-guide-copy">
        <p className="eyebrow">{article.category} / {article.subcategory}</p>
        <h3 className="editorial"><Link href={article.path}>{article.title}</Link></h3>
        <p>{article.standfirst}</p>
      </div>
    </article>
  );
}
