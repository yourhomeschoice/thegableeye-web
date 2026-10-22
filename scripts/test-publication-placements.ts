import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import type {
  ArticlePlacementConfiguration,
} from "../lib/publication/placements.ts";
import type { PublishedRecommendationComparisonArticle } from "../lib/publication/types.ts";

void (async () => {
process.env.SUPABASE_URL ??= "https://publication-test.invalid";
process.env.SUPABASE_PUBLISHABLE_KEY ??= "publication-test-key";
const {
  articlePlacementConfiguration,
  resolveArticlePlacements,
} = await import("../lib/publication/placements.ts");
function article(
  articleKey: string,
  category: "Travel" | "Tech" | "Home" | "Outdoor" | "Lifestyle",
): PublishedRecommendationComparisonArticle {
  return {
    articleKey,
    publicationStatus: "PUBLISHED",
    path: `/${category.toLowerCase()}/fixtures/${articleKey}`,
    slug: articleKey,
    category,
    subcategory: "Fixtures",
    articleType: "Guide",
    title: `${articleKey} title`,
    standfirst: `${articleKey} summary.`,
    author: "The Gable Eye Editorial",
    lastResearched: "2026-10-21",
    articleBody: { format: "MARKDOWN", content: "Fixture body." },
  };
}

const published = [
  article("travel-alpha", "Travel"),
  article("travel-beta", "Travel"),
  article("tech-alpha", "Tech"),
];

const configuration: ArticlePlacementConfiguration = {
  homepage: {
    featuredArticleKey: "travel-alpha",
    highlightedArticleKeys: ["travel-alpha", "missing", "travel-beta", "travel-beta"],
  },
  categories: {
    Travel: {
      featuredArticleKey: "tech-alpha",
      highlightedArticleKeys: ["travel-beta", "travel-beta", "travel-alpha"],
    },
    Tech: { featuredArticleKey: "tech-alpha", highlightedArticleKeys: [] },
    Home: { highlightedArticleKeys: ["missing"] },
    Outdoor: { highlightedArticleKeys: [] },
    Lifestyle: { highlightedArticleKeys: [] },
  },
};

const resolved = resolveArticlePlacements(published, configuration);
assert.equal(resolved.homepage.featured?.articleKey, "travel-alpha", "homepage featured key resolves first");
assert.deepEqual(resolved.homepage.highlighted.map((item) => item.articleKey), ["travel-beta"], "homepage ordering is key order without duplicates");
assert.equal(resolved.categories.Travel.featured, undefined, "a cross-category featured key is excluded");
assert.deepEqual(resolved.categories.Travel.highlighted.map((item) => item.articleKey), ["travel-beta", "travel-alpha"], "category placement is filtered and ordered");
assert.equal(resolved.categories.Tech.featured?.articleKey, "tech-alpha");
assert.deepEqual(resolved.categories.Home.highlighted, [], "missing and unreleased keys do not create cards");
assert.deepEqual(resolved.categories.Outdoor.highlighted, []);
assert.deepEqual(resolved.categories.Lifestyle.highlighted, []);

assert.deepEqual(articlePlacementConfiguration.homepage.highlightedArticleKeys, [], "live homepage configuration starts empty");
for (const category of ["Travel", "Tech", "Home", "Outdoor", "Lifestyle"] as const) {
  assert.deepEqual(articlePlacementConfiguration.categories[category].highlightedArticleKeys, [], `${category} live category configuration starts empty`);
}

const files = await Promise.all([
  "app/page.tsx",
  "app/travel/page.tsx",
  "app/tech/page.tsx",
  "app/home/page.tsx",
  "app/lifestyle/page.tsx",
  "components/category-landing-page.tsx",
  "lib/publication/placements.ts",
].map((file) => readFile(file, "utf8")));
assert.doesNotMatch(files.join("\n"), /development-preview/, "production placement paths do not leak development previews");

console.log("Publication placement resolution checks passed.");
})().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Publication placement tests failed.");
  process.exitCode = 1;
});
