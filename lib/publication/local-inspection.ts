import { publicationSource } from "./publication-source";
import type { PublishedRecommendationComparisonArticle } from "./types";

const localInspectionTargets = {
  "slow-cookers-compared": {
    path: "/home/slow-cookers-compared",
    version: 1,
  },
  "clothes-dryers-compared": {
    path: "/home/clothes-dryers-compared",
    version: 1,
  },
} as const;

export type LocalInspectionArticleKey = keyof typeof localInspectionTargets;

export async function getLocalInspectionPublication(
  articleKey: string,
): Promise<PublishedRecommendationComparisonArticle | undefined> {
  if (process.env.NODE_ENV !== "development") return undefined;

  const target = localInspectionTargets[articleKey as LocalInspectionArticleKey];
  if (!target) return undefined;

  return publicationSource.getPublishedArticleForLocalInspection(
    articleKey,
    target.path,
    target.version,
  );
}
