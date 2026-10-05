import type { RecommendationComparisonArticle } from "./types";

export interface PublicationSource {
  getPublishedArticles(): Promise<readonly RecommendationComparisonArticle[]>;
  getPublishedArticleByPath(pathname: string): Promise<RecommendationComparisonArticle | undefined>;
}
