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
  subcategory = "Fixtures",
): PublishedRecommendationComparisonArticle {
  return {
    articleKey,
    publicationStatus: "PUBLISHED",
    path: `/${category.toLowerCase()}/fixtures/${articleKey}`,
    slug: articleKey,
    category,
    subcategory,
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
  article("tech-laptop", "Tech", "Laptops"),
  article("outdoor-camping", "Outdoor", "Camping"),
];

const configuration: ArticlePlacementConfiguration = {
  homepage: {
    featuredArticleKey: "travel-alpha",
    highlightedArticleKeys: ["travel-alpha", "missing", "travel-beta", "travel-beta"],
  },
  homepageSidebar: {
    featuredArticleKey: "travel-beta",
    highlightedArticleKeys: ["travel-alpha", "missing", "unreleased", "travel-alpha"],
  },
  categories: {
    Travel: {
      featuredArticleKey: "tech-alpha",
      highlightedArticleKeys: ["travel-beta", "travel-beta", "travel-alpha"],
    },
    Tech: {
      featuredArticleKey: "tech-alpha",
      highlightedArticleKeys: [],
      topicArticleKeys: {
        Laptops: ["tech-laptop", "travel-alpha", "missing", "tech-laptop"],
        Smartphones: ["tech-laptop"],
      },
    },
    Home: { highlightedArticleKeys: ["missing"] },
    Outdoor: { highlightedArticleKeys: ["outdoor-camping"] },
    Lifestyle: { highlightedArticleKeys: [] },
  },
};

const resolved = resolveArticlePlacements(published, configuration);
assert.equal(resolved.homepage.featured?.articleKey, "travel-alpha", "homepage featured key resolves first");
assert.deepEqual(resolved.homepage.highlighted.map((item) => item.articleKey), ["travel-beta"], "homepage ordering is key order without duplicates");
assert.equal(resolved.categories.Travel.featured, undefined, "a cross-category featured key is excluded");
assert.deepEqual(resolved.categories.Travel.highlighted.map((item) => item.articleKey), ["travel-beta", "travel-alpha"], "category placement is filtered and ordered");
assert.equal(resolved.categories.Tech.featured?.articleKey, "tech-alpha");
assert.deepEqual(resolved.homepageSidebar.featured?.articleKey, "travel-beta", "sidebar featured placement resolves from public articles");
assert.deepEqual(resolved.homepageSidebar.highlighted.map((item) => item.articleKey), ["travel-alpha"], "missing, unreleased, and duplicate sidebar placements are excluded");
assert.deepEqual(resolved.categories.Outdoor.highlighted.map((item) => item.articleKey), ["outdoor-camping"], "Outdoor homepage placements resolve from the release-gated category collection");
assert.deepEqual(resolved.categories.Tech.topicArticles.Laptops?.map((item) => item.articleKey), ["tech-laptop"], "Tech topic placements require matching category and subcategory");
assert.deepEqual(resolved.categories.Tech.topicArticles.Smartphones, [], "mismatched Tech subcategory placements are excluded");
assert.deepEqual(resolved.categories.Home.highlighted, [], "missing and unreleased keys do not create cards");
assert.deepEqual(resolved.categories.Lifestyle.highlighted, []);

assert.deepEqual(articlePlacementConfiguration.homepage.highlightedArticleKeys, [], "homepage does not feature pending articles");
assert.deepEqual(articlePlacementConfiguration.homepageSidebar.highlightedArticleKeys, [], "homepage sidebar does not feature pending articles");
assert.deepEqual(articlePlacementConfiguration.categories.Home.highlightedArticleKeys, ["slow-cookers-compared", "clothes-dryers-compared"], "Home uses permanent A001/A002 article keys");
for (const category of ["Travel", "Tech", "Outdoor", "Lifestyle"] as const) {
  assert.deepEqual(articlePlacementConfiguration.categories[category].highlightedArticleKeys, [], `${category} live category configuration remains empty`);
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
const [homepageSource, techComponentSource] = await Promise.all([
  readFile("app/page.tsx", "utf8"),
  readFile("components/category-landing-page.tsx", "utf8"),
]);
assert.doesNotMatch(homepageSource, /section\.name === "Outdoor"/, "Outdoor is not artificially suppressed on the homepage");
assert.match(techComponentSource, /placements\.topicArticles\[section\.name\]/, "Tech topic sections use release-gated topic placements");
const categoryPageSources = await Promise.all([
  "app/home/page.tsx",
  "app/travel/page.tsx",
  "app/outdoor/page.tsx",
  "app/lifestyle/page.tsx",
  "app/tech/page.tsx",
  "components/category-landing-page.tsx",
].map((file) => readFile(file, "utf8")));
for (const source of [...categoryPageSources.slice(0, 4), categoryPageSources[5]]) {
  assert.match(source, /remainingArticles/, "category browsing retains an undisplayed-article collection");
}
for (const source of categoryPageSources.slice(0, 5)) {
  assert.match(source, /publishedArticlesForCategory/, "category pages use release-gated automatic discovery");
}

console.log("Publication placement resolution checks passed.");
})().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Publication placement tests failed.");
  process.exitCode = 1;
});
