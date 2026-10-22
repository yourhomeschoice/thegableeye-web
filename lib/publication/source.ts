import type { PublishedRecommendationComparisonArticle } from "./types";

export interface PublicationSource {
  getPublishedArticles(): Promise<readonly PublishedRecommendationComparisonArticle[]>;
  getPublishedArticleByPath(pathname: string): Promise<PublishedRecommendationComparisonArticle | undefined>;
}
