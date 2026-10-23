import type { PublishedRecommendationComparisonArticle } from "./types";
import { publicationSource } from "./publication-source";

export const publicationCategories = ["Travel", "Tech", "Home", "Outdoor", "Lifestyle"] as const;
export type PublicationCategory = (typeof publicationCategories)[number];

const categoryHrefs: Readonly<Record<PublicationCategory, string>> = {
  Travel: "/travel/",
  Tech: "/tech/",
  Home: "/home/",
  Outdoor: "/outdoor/",
  Lifestyle: "/lifestyle/",
};

const subcategoryHrefs: Readonly<Partial<Record<PublicationCategory, Readonly<Record<string, string>>>>> = {
  Travel: {
    "eSIMs & Connectivity": "/travel/esims/",
    "Car Rental": "/travel/car-rental/",
    "Transport / Getting Around": "/travel/transport/",
  },
};

export function isPublicationCategory(value: string): value is PublicationCategory {
  return publicationCategories.includes(value as PublicationCategory);
}

export function categoryHref(category: string): string | undefined {
  return isPublicationCategory(category) ? categoryHrefs[category] : undefined;
}

/**
 * The one-argument form preserves the existing Travel-only caller contract.
 * A category is required for new callers so subcategory names cannot collide.
 */
export function subcategoryHref(
  categoryOrSubcategory: string,
  subcategory?: string,
): string | undefined {
  const category = subcategory === undefined ? "Travel" : categoryOrSubcategory;
  const resolvedSubcategory = subcategory ?? categoryOrSubcategory;
  return isPublicationCategory(category)
    ? subcategoryHrefs[category]?.[resolvedSubcategory]
    : undefined;
}

function sortByPath(
  articles: readonly PublishedRecommendationComparisonArticle[],
): PublishedRecommendationComparisonArticle[] {
  return [...articles].sort((left, right) => left.path.localeCompare(right.path));
}

/**
 * Deterministically selects public-source articles for one category.
 * Callers must supply records from the public publication source; this helper
 * intentionally has no database or preview-data access of its own.
 */
export function discoverPublishedArticlesForCategory(
  articles: readonly PublishedRecommendationComparisonArticle[],
  category: PublicationCategory,
): readonly PublishedRecommendationComparisonArticle[] {
  return sortByPath(articles.filter((article) => article.category === category));
}

/** Keeps curated article order while appending undisplayed public discoveries. */
export function mergePublishedArticles(
  ...collections: readonly (readonly PublishedRecommendationComparisonArticle[])[]
): readonly PublishedRecommendationComparisonArticle[] {
  const seen = new Set<string>();
  return collections.flatMap((articles) => articles.filter((article) => {
    if (seen.has(article.articleKey)) return false;
    seen.add(article.articleKey);
    return true;
  }));
}

export async function publishedArticlesForCategory(
  category: PublicationCategory,
): Promise<readonly PublishedRecommendationComparisonArticle[]> {
  // publicationSource is the public-release gate; never index raw Supabase rows.
  return discoverPublishedArticlesForCategory(
    await publicationSource.getPublishedArticles(),
    category,
  );
}

export async function publishedTravelArticles() {
  return publishedArticlesForCategory("Travel");
}

export async function articlesForSubcategory(
  category: PublicationCategory,
  subcategory: string,
): Promise<readonly PublishedRecommendationComparisonArticle[]>;
export async function articlesForSubcategory(
  subcategory: string,
): Promise<readonly PublishedRecommendationComparisonArticle[]>;
export async function articlesForSubcategory(
  categoryOrSubcategory: PublicationCategory | string,
  optionalSubcategory?: string,
): Promise<readonly PublishedRecommendationComparisonArticle[]> {
  const category = optionalSubcategory === undefined
    ? "Travel"
    : categoryOrSubcategory as PublicationCategory;
  const subcategory = optionalSubcategory ?? categoryOrSubcategory;
  return (await publishedArticlesForCategory(category)).filter(
    (article) => article.subcategory === subcategory,
  );
}
