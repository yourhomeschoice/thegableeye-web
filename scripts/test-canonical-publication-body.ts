import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";
import { heathrowCarRentalComparisonArticle } from "../lib/publication/articles/heathrow-car-rental-comparison.ts";
import { japanEsimsComparedArticle } from "../lib/publication/articles/japan-esims-compared.ts";
import { travelAdapterCanonicalBodyFixture } from "../lib/publication/articles/travel-adapter-canonical-body.fixture.ts";
import { validatePublicationArticle } from "../lib/publication/validation.ts";
import { sanitiseTrustedEditorialHtml } from "../lib/publication/editorial-html.ts";
import { runTravelAdapterHtmlRenderingTest } from "./test-travel-adapter-html-rendering.ts";

void (async () => {
  if (process.env.npm_lifecycle_event === "test:approved-baseline-publication-preparation") {
    const { runApprovedBaselinePublicationPreparationTest } = await import("./test-approved-baseline-publication-preparation.ts");
    await runApprovedBaselinePublicationPreparationTest();
  }
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

const htmlArticle = {
  ...travelAdapterCanonicalBodyFixture,
  articleBody: {
    format: "HTML" as const,
    content: '<h2>HTML fixture heading</h2><p>Approved <strong>editorial</strong> text with <a href="https://example.com/research">research</a>.<br>Second line.</p><ul><li>First HTML item</li></ul><div class="article-table-scroll"><table><tbody><tr><th scope="row">Option</th><td>Value</td></tr></tbody></table></div>',
  },
};
assert.equal(validatePublicationArticle(htmlArticle).valid, true, "HTML canonical body is valid");
const htmlMarkup = renderToStaticMarkup(RecommendationArticle({ article: htmlArticle }));
assert.match(htmlMarkup, /<h2>HTML fixture heading<\/h2>/, "HTML heading renders");
assert.match(htmlMarkup, /<table><tbody><tr><th scope="row">Option<\/th><td>Value<\/td><\/tr><\/tbody><\/table>/, "HTML table contents are preserved");
assert.match(htmlMarkup, /href="https:\/\/example.com\/research"/, "safe HTML link renders");
assert.match(htmlMarkup, /<li>First HTML item<\/li>/, "HTML list renders");

assert.equal(sanitiseTrustedEditorialHtml('<p>Entities: &amp; &lt; &gt;.</p><p><a href="https://example.com/?q=a&gt;b">Link</a></p>'), '<p>Entities: &amp; &lt; &gt;.</p><p><a href="https://example.com/?q=a&gt;b">Link</a></p>', "HTML entities in text and attributes are preserved safely");
assert.equal(sanitiseTrustedEditorialHtml('<p><a href="https://example.com/a>b">Quoted greater-than</a></p>'), '<p><a href="https://example.com/a&gt;b">Quoted greater-than</a></p>', "quoted attribute values containing greater-than are parsed safely");
assert.equal(sanitiseTrustedEditorialHtml('<table><thead><tr><th scope="col">Option</th></tr></thead><tbody><tr><td>Value</td></tr></tbody></table>'), '<table><thead><tr><th scope="col">Option</th></tr></thead><tbody><tr><td>Value</td></tr></tbody></table>', "correctly nested editorial tables are preserved");
for (const artifact of ["travel-adapter-ebs-005-v1.html", "fridge-freezer-ebs-006-v1.html", "coffee-espresso-machine-ebs-007-v1.html"]) {
  sanitiseTrustedEditorialHtml(await readFile("publication-artifacts/" + artifact, "utf8"));
}

const legacyMarkup = renderToStaticMarkup(RecommendationArticle({ article: heathrowCarRentalComparisonArticle }));
assert.match(legacyMarkup, /Our recommendation for this Heathrow rental scenario/, "legacy structured sections still render");
assert.match(legacyMarkup, /affiliate-disclosure/, "legacy disclosure still renders");

for (const [name, article] of [
  ["blank canonical content", { ...travelAdapterCanonicalBodyFixture, articleBody: { format: "MARKDOWN", content: "   " } }],
  ["unsafe HTML script", { ...travelAdapterCanonicalBodyFixture, articleBody: { format: "HTML", content: "<p>body</p><script>alert(1)</script>" } }],
  ["unsafe HTML event handler", { ...travelAdapterCanonicalBodyFixture, articleBody: { format: "HTML", content: '<p onclick="alert(1)">body</p>' } }],
  ["unsafe HTML URL", { ...travelAdapterCanonicalBodyFixture, articleBody: { format: "HTML", content: '<p><a href="javascript:alert(1)">body</a></p>' } }],
  ["encoded unsafe HTML URL", { ...travelAdapterCanonicalBodyFixture, articleBody: { format: "HTML", content: '<p><a href="jav&#x61;script:alert(1)">body</a></p>' } }],
  ["malformed HTML URL", { ...travelAdapterCanonicalBodyFixture, articleBody: { format: "HTML", content: '<p><a href="https://">body</a></p>' } }],
  ["nested paragraphs", { ...travelAdapterCanonicalBodyFixture, articleBody: { format: "HTML", content: "<p>outer<p>inner</p></p>" } }],
  ["paragraph containing a block", { ...travelAdapterCanonicalBodyFixture, articleBody: { format: "HTML", content: "<p>outer<div>inner</div></p>" } }],
  ["misplaced table cell", { ...travelAdapterCanonicalBodyFixture, articleBody: { format: "HTML", content: "<table><td>Value</td></table>" } }],
  ["invalid table nesting", { ...travelAdapterCanonicalBodyFixture, articleBody: { format: "HTML", content: "<table><tbody><td>Value</td></tbody></table>" } }],
  ["malformed HTML", { ...travelAdapterCanonicalBodyFixture, articleBody: { format: "HTML", content: "<p>body" } }],
  ["unsupported canonical format", { ...travelAdapterCanonicalBodyFixture, articleBody: { format: "TEXT", content: "body" } }],
  ["malformed canonical body", { ...travelAdapterCanonicalBodyFixture, articleBody: "body" }],
] as const) {
  assert.equal(validatePublicationArticle(article).valid, false, name + " is rejected");
}

assert.equal(validatePublicationArticle({ ...heathrowCarRentalComparisonArticle, affiliateDisclosure: undefined }).valid, true, "missing affiliate disclosure is valid");
assert.equal(validatePublicationArticle(heathrowCarRentalComparisonArticle).valid, true, "existing affiliate disclosure remains valid");

await runTravelAdapterHtmlRenderingTest();

  console.log("Canonical publication body validation checks passed.");
})();
