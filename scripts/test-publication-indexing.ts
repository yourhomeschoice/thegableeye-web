import assert from "node:assert/strict";
import type {
  PublishedRecommendationComparisonArticle,
  RecommendationComparisonArticle,
} from "../lib/publication/types.ts";

process.env.SUPABASE_URL ??= "https://publication-test.invalid";
process.env.SUPABASE_PUBLISHABLE_KEY ??= "publication-test-key";

void (async () => {
const { SupabasePublicationSource } = await import("../lib/publication/sources/supabase-publication-source.ts");
const { publicationSource } = await import("../lib/publication/publication-source.ts");
const {
  articlesForSubcategory,
  categoryHref,
  publishedArticlesForCategory,
  subcategoryHref,
} = await import("../lib/publication/indexing.ts");
const { RecommendationArticle } = await import("../components/recommendation-article.tsx");
const { renderToStaticMarkup } = await import("react-dom/server");

const payload = {
  publicationStatus: "PUBLISHED" as const,
  path: "/travel/esims/identity-fixture",
  slug: "identity-fixture",
  category: "Travel",
  subcategory: "eSIMs & Connectivity",
  articleType: "Guide",
  title: "Identity fixture",
  standfirst: "A fixture for public article indexing.",
  author: "The Gable Eye Editorial",
  lastResearched: "2026-10-21",
  articleBody: { format: "MARKDOWN" as const, content: "Fixture body." },
} satisfies RecommendationComparisonArticle;

const source = new SupabasePublicationSource();
const retainedIdentity = (source as unknown as {
  validateRow(row: unknown, index: number): { articleKey: string; path: string };
}).validateRow({ article_key: "permanent-identity-fixture", path: payload.path, payload }, 0);
assert.equal(retainedIdentity.articleKey, "permanent-identity-fixture");
assert.equal(retainedIdentity.path, payload.path);
assert.throws(
  () => (source as unknown as { validateRow(row: unknown, index: number): unknown }).validateRow({ path: payload.path, payload }, 0),
  /malformed publication/,
  "a Supabase row without article_key is rejected",
);

let fetchCalls = 0;
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => {
  fetchCalls += 1;
  throw new Error("The release gate should prevent this fetch.");
};
assert.deepEqual(await source.getPublishedArticles(), [], "an empty public-release allowlist exposes no articles");
assert.equal(fetchCalls, 0, "unreleased articles cannot enter public indexes");
globalThis.fetch = originalFetch;

Reflect.set(process.env, "NODE_ENV", "development");
globalThis.fetch = async (input) => {
  const url = new URL(String(input));
  assert.equal(url.searchParams.get("article_key"), "eq.permanent-identity-fixture");
  assert.equal(url.searchParams.get("version"), "eq.1");
  assert.equal(url.searchParams.get("publication_status"), "eq.PUBLISHED");
  return new Response(JSON.stringify([{ article_key: "permanent-identity-fixture", path: payload.path, payload }]));
};
const locallyInspected = await source.getPublishedArticleForLocalInspection(
  "permanent-identity-fixture",
  payload.path,
  1,
);
assert.equal(locallyInspected.articleKey, "permanent-identity-fixture");
globalThis.fetch = originalFetch;
Reflect.set(process.env, "NODE_ENV", "production");
await assert.rejects(
  source.getPublishedArticleForLocalInspection(
    "permanent-identity-fixture",
    payload.path,
    1,
  ),
  /development/,
);

const categories = ["Travel", "Tech", "Home", "Outdoor", "Lifestyle"] as const;
const releasedArticles: readonly PublishedRecommendationComparisonArticle[] = categories.map((category) => ({
  ...payload,
  articleKey: `${category.toLowerCase()}-fixture`,
  category,
  subcategory: `${category} Fixtures`,
  path: `/${category.toLowerCase()}/fixtures/${category.toLowerCase()}-fixture` as `/${string}`,
  slug: `${category.toLowerCase()}-fixture`,
}));

const originalGetPublishedArticles = publicationSource.getPublishedArticles.bind(publicationSource);
publicationSource.getPublishedArticles = async () => releasedArticles;

for (const category of categories) {
  const articles = await publishedArticlesForCategory(category);
  assert.equal(articles.length, 1, `${category} is indexed`);
  assert.equal(articles[0].articleKey, `${category.toLowerCase()}-fixture`);
}

const travelFixtures = await articlesForSubcategory("Travel", "Travel Fixtures");
assert.equal(travelFixtures.length, 1, "category-qualified Travel indexing works");
assert.equal((await articlesForSubcategory("Travel Fixtures")).length, 1, "Travel shorthand remains compatible");
publicationSource.getPublishedArticles = originalGetPublishedArticles;

assert.equal(categoryHref("Travel"), "/travel/");
assert.equal(categoryHref("Tech"), "/tech/");
assert.equal(categoryHref("Home"), "/home/");
assert.equal(categoryHref("Outdoor"), "/outdoor/");
assert.equal(categoryHref("Lifestyle"), "/lifestyle/");
assert.equal(subcategoryHref("Travel", "eSIMs & Connectivity"), "/travel/esims/");
assert.equal(subcategoryHref("Tech", "Laptops"), undefined, "unimplemented category links are not emitted");

for (const [category, href] of [
  ["Travel", "/travel/"],
  ["Tech", "/tech/"],
  ["Home", "/home/"],
  ["Outdoor", "/outdoor/"],
  ["Lifestyle", "/lifestyle/"],
] as const) {
  const markup = renderToStaticMarkup(RecommendationArticle({ article: { ...payload, category, subcategory: "Unlinked" } }));
  assert.match(markup, new RegExp(`href="${href.replace(/\/$/, "")}/?"`), `${category} breadcrumb links to its category`);
}

console.log("Publication identity, category indexing, release gate, and breadcrumb checks passed.");
})().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Publication indexing tests failed.");
  process.exitCode = 1;
});
