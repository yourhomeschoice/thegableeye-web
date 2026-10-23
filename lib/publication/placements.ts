import { publicationSource } from "./publication-source";
import {
  publicationCategories,
  type PublicationCategory,
} from "./indexing";
import type { PublishedRecommendationComparisonArticle } from "./types";

export type ArticlePlacementCollection = Readonly<{
  featuredArticleKey?: string;
  highlightedArticleKeys: readonly string[];
}>;

export type ArticlePlacementConfiguration = Readonly<{
  homepage: ArticlePlacementCollection;
  categories: Readonly<Record<PublicationCategory, ArticlePlacementCollection>>;
}>;

/**
 * Entries are permanent Supabase article keys only. Resolution remains
 * fail-closed because the public publication source supplies released records
 * exclusively.
 */
export const articlePlacementConfiguration: ArticlePlacementConfiguration = {
  homepage: {
    highlightedArticleKeys: [],
  },
  categories: {
    Travel: { highlightedArticleKeys: [] },
    Tech: { highlightedArticleKeys: [] },
    Home: {
      highlightedArticleKeys: [
        "slow-cookers-compared",
        "clothes-dryers-compared",
      ],
    },
    Outdoor: { highlightedArticleKeys: [] },
    Lifestyle: { highlightedArticleKeys: [] },
  },
};

export type ResolvedArticlePlacementCollection = Readonly<{
  featured?: PublishedRecommendationComparisonArticle;
  highlighted: readonly PublishedRecommendationComparisonArticle[];
}>;

export type ResolvedArticlePlacements = Readonly<{
  homepage: ResolvedArticlePlacementCollection;
  categories: Readonly<Record<PublicationCategory, ResolvedArticlePlacementCollection>>;
}>;

function resolveCollection(
  collection: ArticlePlacementCollection,
  articles: readonly PublishedRecommendationComparisonArticle[],
  category?: PublicationCategory,
): ResolvedArticlePlacementCollection {
  const available = new Map(
    articles
      .filter((article) => category === undefined || article.category === category)
      .map((article) => [article.articleKey, article]),
  );
  const usedKeys = new Set<string>();
  const resolve = (articleKey: string | undefined) => {
    if (!articleKey || usedKeys.has(articleKey)) return undefined;
    const article = available.get(articleKey);
    if (!article) return undefined;
    usedKeys.add(articleKey);
    return article;
  };

  const featured = resolve(collection.featuredArticleKey);
  const highlighted = collection.highlightedArticleKeys.flatMap((articleKey) => {
    const article = resolve(articleKey);
    return article ? [article] : [];
  });

  return { featured, highlighted };
}

/**
 * Resolve only records already exposed by the public publication source.
 * This pure function also makes placement review testable without Supabase.
 */
export function resolveArticlePlacements(
  articles: readonly PublishedRecommendationComparisonArticle[],
  configuration: ArticlePlacementConfiguration = articlePlacementConfiguration,
): ResolvedArticlePlacements {
  const categories = Object.fromEntries(
    publicationCategories.map((category) => [
      category,
      resolveCollection(configuration.categories[category], articles, category),
    ]),
  ) as Record<PublicationCategory, ResolvedArticlePlacementCollection>;

  return {
    homepage: resolveCollection(configuration.homepage, articles),
    categories,
  };
}

export async function getResolvedArticlePlacements(): Promise<ResolvedArticlePlacements> {
  return resolveArticlePlacements(await publicationSource.getPublishedArticles());
}
