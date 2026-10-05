import type { RecommendationComparisonArticle } from "./types";
import { publicationSource } from "./publication-source";

export const travelSections = [{ name: "eSIMs & Connectivity", href: "/travel/esims/" }, { name: "Car Rental", href: "/travel/car-rental/" }, { name: "Transport / Getting Around", href: "/travel/transport/" }] as const;
export function subcategoryHref(subcategory: string): string | undefined { return travelSections.find((section) => section.name === subcategory)?.href; }
export async function publishedTravelArticles(): Promise<readonly RecommendationComparisonArticle[]> { return (await publicationSource.getPublishedArticles()).filter((article) => article.category === "Travel").sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0); }
export async function articlesForSubcategory(subcategory: string) { return (await publishedTravelArticles()).filter((article) => article.subcategory === subcategory); }
