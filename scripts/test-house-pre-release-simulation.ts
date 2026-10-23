import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { PublishedRecommendationComparisonArticle } from "../lib/publication/types.ts";
import {
  buildA001HousePublication,
  buildA002HousePublication,
  housePublicationIdentities,
} from "./house-canonical-specimens.ts";

void (async () => {
process.env.SUPABASE_URL ??= "https://publication-test.invalid";
process.env.SUPABASE_PUBLISHABLE_KEY ??= "publication-test-key";
const { default: HomePage } = await import("../app/home/page.tsx");
const { HomepagePublicationPlacementCard } = await import("../components/publication-placement-card.tsx");
const { articlesForSubcategory, publishedArticlesForCategory } = await import("../lib/publication/indexing.ts");
const { resolveArticlePlacements } = await import("../lib/publication/placements.ts");
const { publicationSource } = await import("../lib/publication/publication-source.ts");
const { createPublicReleaseGate, isPubliclyReleasedArticlePath } = await import("../lib/publication/public-release.ts");
const { getPublicationRouteParams } = await import("../lib/publication/registry.ts");
const identities = [housePublicationIdentities.A001, housePublicationIdentities.A002] as const;
const simulatedGate = createPublicReleaseGate(new Set(identities.map((identity) => identity.path)));

assert.equal(isPubliclyReleasedArticlePath(identities[0].path), false, "the real public allowlist remains closed");
assert.equal(simulatedGate.hasPubliclyReleasedArticles(), true);
for (const identity of identities) {
  assert.equal(simulatedGate.isPubliclyReleasedArticlePath(identity.path), true, `${identity.articleKey} is authorised only in the simulation`);
}
assert.equal(simulatedGate.isPubliclyReleasedArticlePath("/home/unreleased-fixture"), false, "an unlisted path is rejected");

const simulatedArticles: readonly PublishedRecommendationComparisonArticle[] = [
  { ...buildA001HousePublication(), articleKey: housePublicationIdentities.A001.articleKey },
  { ...buildA002HousePublication(), articleKey: housePublicationIdentities.A002.articleKey },
];

const originalGetPublishedArticles = publicationSource.getPublishedArticles.bind(publicationSource);
publicationSource.getPublishedArticles = async () => simulatedArticles;

try {
  assert.deepEqual(
    (await publishedArticlesForCategory("Home")).map((article) => article.articleKey),
    ["clothes-dryers-compared", "slow-cookers-compared"],
    "both simulated records enter the Home index",
  );
  assert.deepEqual(
    (await articlesForSubcategory("Home", "Kitchen")).map((article) => article.articleKey),
    ["slow-cookers-compared"],
    "Slow Cookers resolves to Home / Kitchen",
  );
  assert.deepEqual(
    (await articlesForSubcategory("Home", "Appliances")).map((article) => article.articleKey),
    ["clothes-dryers-compared"],
    "Clothes Dryers resolves to Home / Appliances",
  );

  const placements = resolveArticlePlacements(simulatedArticles);
  assert.deepEqual(
    placements.categories.Home.highlighted.map((article) => article.articleKey),
    ["slow-cookers-compared", "clothes-dryers-compared"],
    "both records resolve through the existing Home placements in configured order",
  );
  assert.equal(placements.homepage.featured, undefined);
  assert.deepEqual(placements.homepage.highlighted, [], "homepage remains empty without explicit configuration");
  assert.deepEqual(
    await getPublicationRouteParams(),
    [
      { category: "home", slug: ["slow-cookers-compared"] },
      { category: "home", slug: ["clothes-dryers-compared"] },
    ],
    "the existing route registry creates only the simulated authorised article parameters",
  );

  const cardMarkup = renderToStaticMarkup(
    createElement(HomepagePublicationPlacementCard, { article: simulatedArticles[0] }),
  );
  assert.match(cardMarkup, /href="\/home\/slow-cookers-compared"/);
  assert.match(cardMarkup, new RegExp(simulatedArticles[0].title));

  const homeMarkup = renderToStaticMarkup(await HomePage());
  assert.match(homeMarkup, new RegExp(simulatedArticles[0].title));
  assert.match(homeMarkup, new RegExp(simulatedArticles[1].title));
  assert.match(homeMarkup, /Editorial placeholder/, "remaining Home slots retain their existing placeholders");
} finally {
  publicationSource.getPublishedArticles = originalGetPublishedArticles;
}

const [homepage, home] = await Promise.all([
  readFile("app/page.tsx", "utf8"),
  readFile("app/home/page.tsx", "utf8"),
]);
assert.match(homepage, /homepagePlacements\.highlighted\.slice\(0, 3\)\.map/);
assert.match(home, /sectionArticles\.map\(\(article\) => <CategoryPublicationPlacementCard/);
assert.match(home, /showVisualPreviewCards \? previewTitles\.map/);

console.log("House pre-release simulation passed.");
})().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "House pre-release simulation failed.");
  process.exitCode = 1;
});
