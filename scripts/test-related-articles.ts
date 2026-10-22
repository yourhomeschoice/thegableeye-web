import assert from "node:assert/strict";
import type { PublishedRecommendationComparisonArticle } from "../lib/publication/types.ts";

void (async () => {
  process.env.SUPABASE_URL ??= "https://publication-test.invalid";
  process.env.SUPABASE_PUBLISHABLE_KEY ??= "publication-test-key";

  const { resolveRelatedArticles, relatedArticleConfiguration } = await import("../lib/publication/related-articles.ts");
  const { RecommendationArticle } = await import("../components/recommendation-article.tsx");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { travelAdapterCanonicalBodyFixture } = await import("../lib/publication/articles/travel-adapter-canonical-body.fixture.ts");
  const { heathrowCarRentalComparisonArticle } = await import("../lib/publication/articles/heathrow-car-rental-comparison.ts");

  function article(
    articleKey: string,
    category: "Travel" | "Tech",
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

  const source = article("travel-source", "Travel");
  const techTarget = article("tech-target", "Tech");
  const travelTarget = article("travel-target", "Travel");
  const resolved = resolveRelatedArticles(
    source.articleKey,
    [source, techTarget, travelTarget],
    {
      [source.articleKey]: ["tech-target", "travel-target", "tech-target", "travel-source", "missing", "unreleased"],
    },
  );

  assert.deepEqual(
    resolved.map((item) => item.articleKey),
    ["tech-target", "travel-target"],
    "permanent keys resolve in order, across categories, without duplicates or self-links",
  );
  assert.deepEqual(resolveRelatedArticles(source.articleKey, [source], {}), [], "an empty configuration renders no links");
  assert.deepEqual(relatedArticleConfiguration, {}, "live related configuration starts empty");

  const markdownSnapshot = JSON.stringify(travelAdapterCanonicalBodyFixture);
  const markdownMarkup = renderToStaticMarkup(
    RecommendationArticle({ article: travelAdapterCanonicalBodyFixture, relatedArticles: resolved }),
  );
  assert.equal(JSON.stringify(travelAdapterCanonicalBodyFixture), markdownSnapshot, "Markdown editorial content is unchanged by related rendering");
  assert.match(markdownMarkup, /Related reading/);
  assert.match(markdownMarkup, /tech-target title/);
  assert.match(markdownMarkup, /href="\/tech\/fixtures\/tech-target"/);

  const htmlArticle = {
    ...travelAdapterCanonicalBodyFixture,
    articleBody: { format: "HTML" as const, content: "<h2>Approved HTML fixture</h2><p>Approved body.</p>" },
  };
  const htmlSnapshot = JSON.stringify(htmlArticle);
  const htmlMarkup = renderToStaticMarkup(
    RecommendationArticle({ article: htmlArticle, relatedArticles: [techTarget] }),
  );
  assert.equal(JSON.stringify(htmlArticle), htmlSnapshot, "HTML editorial content is unchanged by related rendering");
  assert.match(htmlMarkup, /Approved HTML fixture/);
  assert.match(htmlMarkup, /Related reading/);

  const structuredSnapshot = JSON.stringify(heathrowCarRentalComparisonArticle);
  const structuredMarkup = renderToStaticMarkup(
    RecommendationArticle({ article: heathrowCarRentalComparisonArticle, relatedArticles: [techTarget] }),
  );
  assert.equal(JSON.stringify(heathrowCarRentalComparisonArticle), structuredSnapshot, "structured editorial content is unchanged by related rendering");
  assert.match(structuredMarkup, /Our recommendation for this Heathrow rental scenario/);
  assert.match(structuredMarkup, /Related reading/);

  const noRelatedMarkup = renderToStaticMarkup(RecommendationArticle({ article: travelAdapterCanonicalBodyFixture }));
  assert.doesNotMatch(noRelatedMarkup, /Related reading/);

  console.log("Related article resolution and rendering checks passed.");
})().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Related article tests failed.");
  process.exitCode = 1;
});
