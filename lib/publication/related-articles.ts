import { publicationSource } from "./publication-source";
import type { PublishedRecommendationComparisonArticle } from "./types";

export type RelatedArticleConfiguration = Readonly<
  Record<string, readonly string[]>
>;

/**
 * Deliberately empty until relationships receive human editorial approval.
 * Both map keys and values are permanent Supabase article keys.
 */
export const relatedArticleConfiguration: RelatedArticleConfiguration = {};

/**
 * Resolves navigation-only links from already public article records. It never
 * reads an editorial payload or bypasses the website release gate.
 */
export function resolveRelatedArticles(
  sourceArticleKey: string,
  articles: readonly PublishedRecommendationComparisonArticle[],
  configuration: RelatedArticleConfiguration = relatedArticleConfiguration,
): readonly PublishedRecommendationComparisonArticle[] {
  const available = new Map(articles.map((article) => [article.articleKey, article]));
  const usedKeys = new Set<string>([sourceArticleKey]);

  return (configuration[sourceArticleKey] ?? []).flatMap((articleKey) => {
    if (usedKeys.has(articleKey)) return [];
    const article = available.get(articleKey);
    if (!article) return [];
    usedKeys.add(articleKey);
    return [article];
  });
}

export async function getResolvedRelatedArticles(
  sourceArticleKey: string,
): Promise<readonly PublishedRecommendationComparisonArticle[]> {
  return resolveRelatedArticles(
    sourceArticleKey,
    await publicationSource.getPublishedArticles(),
  );
}
