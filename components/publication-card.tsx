import Link from "next/link";
import { PublicationImage } from "@/components/publication-image";
import type { RecommendationComparisonArticle } from "@/lib/publication/types";

export function PublicationCard({
  article,
}: {
  article: RecommendationComparisonArticle;
}) {
  return (
    <article className="article-card">
      <Link href={article.path} aria-label={article.title}>
        <PublicationImage image={article.image} variant="card" />
      </Link>

      <div className="article-card-copy">
        <p className="eyebrow">
          {article.category} / {article.subcategory}
        </p>

        <h3 className="article-card-title">
          <Link href={article.path}>{article.title}</Link>
        </h3>

        <p className="article-summary">{article.standfirst}</p>

        <Link className="text-link" href={article.path}>
          Read article <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}