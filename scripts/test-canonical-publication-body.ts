import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { heathrowCarRentalComparisonArticle } from "../lib/publication/articles/heathrow-car-rental-comparison.ts";
import { japanEsimsComparedArticle } from "../lib/publication/articles/japan-esims-compared.ts";
import { travelAdapterCanonicalBodyFixture } from "../lib/publication/articles/travel-adapter-canonical-body.fixture.ts";
import { validatePublicationArticle } from "../lib/publication/validation.ts";

void (async () => {
  // The renderer imports navigation helpers, whose publication source checks for
  // configuration at module initialization. Rendering this local fixture never
  // fetches or writes, so inert values keep the test self-contained.
  process.env.SUPABASE_URL ??= "https://publication-test.invalid";
  process.env.SUPABASE_PUBLISHABLE_KEY ??= "publication-test-key";
  const { RecommendationArticle } = await import("../components/recommendation-article.tsx");

const legacySnapshot = JSON.stringify(heathrowCarRentalComparisonArticle);
assert.equal(validatePublicationArticle(heathrowCarRentalComparisonArticle).valid, true, "legacy article remains valid");
assert.equal(JSON.stringify(heathrowCarRentalComparisonArticle), legacySnapshot, "validation does not mutate legacy input");
assert.equal(validatePublicationArticle(japanEsimsComparedArticle).valid, true, "Japan legacy article remains valid");

const canonicalSnapshot = JSON.stringify(travelAdapterCanonicalBodyFixture);
assert.equal(validatePublicationArticle(travelAdapterCanonicalBodyFixture).valid, true, "MARKDOWN canonical body is valid");
assert.equal(Object.hasOwn(travelAdapterCanonicalBodyFixture, "sections"), false, "canonical fixture omits duplicated legacy prose sections");
assert.equal(Object.hasOwn(travelAdapterCanonicalBodyFixture, "affiliateDisclosure"), false, "affiliate disclosure is optional");
for (const field of ["recommendation", "scenario", "comparedOptions", "practicalChecks", "sections"]) {
  assert.equal(Object.hasOwn(travelAdapterCanonicalBodyFixture, field), false, "canonical fixture omits " + field);
}
assert.equal(JSON.stringify(travelAdapterCanonicalBodyFixture), canonicalSnapshot, "validation does not mutate canonical input");

const canonicalMarkup = renderToStaticMarkup(RecommendationArticle({ article: travelAdapterCanonicalBodyFixture }));
assert.equal((canonicalMarkup.match(/<h1/g) ?? []).length, 1, "canonical rendering contains one page H1");
assert.equal((canonicalMarkup.match(/Ceptics UP-70KU or Anker A9215: which travel adapter fits your priority\?/g) ?? []).length, 1, "canonical rendering does not duplicate its title");
assert.equal((canonicalMarkup.match(/A local canonical-body rendering specimen for the Travel Adapter article\./g) ?? []).length, 1, "canonical rendering does not duplicate its standfirst");
assert.match(canonicalMarkup, /<h2>Test fixture heading<\/h2>/, "canonical Markdown heading renders");
assert.match(canonicalMarkup, /<p>Test fixture paragraph.<\/p>/, "canonical Markdown paragraph renders");
assert.match(canonicalMarkup, /<li>First test item<\/li>/, "canonical Markdown list renders");
assert.doesNotMatch(canonicalMarkup, /affiliate-disclosure/, "canonical article without a disclosure renders no disclosure block");

const legacyMarkup = renderToStaticMarkup(RecommendationArticle({ article: heathrowCarRentalComparisonArticle }));
assert.match(legacyMarkup, /Our recommendation for this Heathrow rental scenario/, "legacy structured sections still render");
assert.match(legacyMarkup, /affiliate-disclosure/, "legacy disclosure still renders");

for (const [name, article] of [
  ["blank canonical content", { ...travelAdapterCanonicalBodyFixture, articleBody: { format: "MARKDOWN", content: "   " } }],
  ["unsupported canonical format", { ...travelAdapterCanonicalBodyFixture, articleBody: { format: "HTML", content: "body" } }],
  ["malformed canonical body", { ...travelAdapterCanonicalBodyFixture, articleBody: "body" }],
] as const) {
  assert.equal(validatePublicationArticle(article).valid, false, name + " is rejected");
}

assert.equal(validatePublicationArticle({ ...heathrowCarRentalComparisonArticle, affiliateDisclosure: undefined }).valid, true, "missing affiliate disclosure is valid");
assert.equal(validatePublicationArticle(heathrowCarRentalComparisonArticle).valid, true, "existing affiliate disclosure remains valid");

  console.log("Canonical publication body validation checks passed.");
})();
