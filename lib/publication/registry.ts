import { publicationSource } from "./publication-source";
import type { RecommendationComparisonArticle } from "./types";

export async function getPublicationByPath(pathname: string): Promise<RecommendationComparisonArticle | undefined> {
  return publicationSource.getPublishedArticleByPath(pathname);
}

export async function getPublicationRouteParams() {
  const articles = await publicationSource.getPublishedArticles();
  return articles.map((article) => {
    const segments = article.path.slice(1).split("/");
    const [category, ...slug] = segments;
    return { category, slug };
  });
}
