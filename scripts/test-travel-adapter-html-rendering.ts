import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";
import type { RecommendationComparisonArticle } from "../lib/publication/types.ts";
import { sanitiseTrustedEditorialHtml } from "../lib/publication/editorial-html.ts";
import { validatePublicationArticle } from "../lib/publication/validation.ts";

export async function runTravelAdapterHtmlRenderingTest() {
  process.env.SUPABASE_URL ??= "https://publication-test.invalid";
  process.env.SUPABASE_PUBLISHABLE_KEY ??= "publication-test-key";

  const approvedHtml = await readFile(
    "publication-artifacts/travel-adapter-ebs-005-v1.html",
    "utf8",
  );
  const article = {
    publicationStatus: "PUBLISHED",
    path: "/travel/travel-accessories/universal-travel-adapter-comparison",
    slug: "universal-travel-adapter-comparison",
    category: "Travel",
    subcategory: "Travel Accessories",
    articleType: "Comparison / Recommendation Guide",
    title: "The Gable's Travel Adaptor Pick: EPICKA TA-105 Pro",
    standfirst: "Approved EBS-005 local rendering proof.",
    author: "The Gable Eye Editorial",
    lastResearched: "test fixture",
    articleBody: { format: "HTML", content: approvedHtml },
  } satisfies RecommendationComparisonArticle;

  assert.equal(validatePublicationArticle(article).valid, true, "EBS-005 local payload is valid");
  const { RecommendationArticle } = await import("../components/recommendation-article.tsx");
  const rendered = renderToStaticMarkup(RecommendationArticle({ article }));
  const expectedBody = sanitiseTrustedEditorialHtml(approvedHtml);
  const renderedBody = '<div class="article-reading article-markdown"><div class="article-html">' + expectedBody + "</div></div>";

  assert.ok(rendered.includes(renderedBody), "rendered editorial body exactly matches the validated approved HTML");
  assert.equal((rendered.match(/<h1\b/g) ?? []).length, 1, "rendered page contains exactly one H1");
  assert.doesNotMatch(rendered, /&lt;h1|&lt;table|&lt;p/i, "approved HTML is not rendered as escaped text");
  assert.equal((expectedBody.match(/<table>/g) ?? []).length, 2, "approved comparison tables are preserved");
  assert.equal((expectedBody.match(/<tr>/g) ?? []).length, 10, "approved table rows are preserved");
  for (const value of ["EPICKA TA-105 Pro", "Anker Nano Travel Adapter A9215", "Ceptics UP-70KU", "TESSAN WTA09", "$39.99", "$25.99", "$47.99"]) {
    assert.ok(expectedBody.includes(value), "approved product content is present: " + value);
  }
  assert.doesNotMatch(approvedHtml, /<a\b/i, "approved EBS-005 source contains no links");
  assert.doesNotMatch(approvedHtml, /affiliate disclosure/i, "approved EBS-005 source contains no affiliate disclosure");
  assert.doesNotMatch(rendered, /affiliate-disclosure/, "renderer does not add a disclosure absent from the approved source");

  console.log("EBS-005 approved HTML production-renderer proof passed.");
}

if (process.argv[1]?.endsWith("test-travel-adapter-html-rendering.ts")) {
  void runTravelAdapterHtmlRenderingTest();
}
