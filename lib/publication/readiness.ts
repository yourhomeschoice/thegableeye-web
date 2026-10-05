import type { RecommendationComparisonArticle } from "./types.ts";

const DEVELOPMENT_PLACEHOLDERS = [
  "sample/static date",
  "sample date",
  "placeholder",
  "todo",
  "tbd",
];

function containsDevelopmentPlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();

  return DEVELOPMENT_PLACEHOLDERS.some((placeholder) =>
    normalized.includes(placeholder),
  );
}

export function requireAudienceReadyPublicationArticle(
  article: RecommendationComparisonArticle,
): RecommendationComparisonArticle {
  if (!/^\/[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(article.path)) {
    throw new Error("Audience publication path is not production-safe.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(article.lastResearched)) {
    throw new Error(
      "Audience publication lastResearched must use YYYY-MM-DD.",
    );
  }

  const [year, month, day] = article.lastResearched
    .split("-")
    .map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(
      "Audience publication lastResearched must be a real calendar date.",
    );
  }

  const publicationStrings = [
    article.title,
    article.standfirst,
    article.author,
    article.lastResearched,
    article.path,
  ];

  if (publicationStrings.some(containsDevelopmentPlaceholder)) {
    throw new Error(
      "Audience publication contains a development placeholder.",
    );
  }

  return article;
}