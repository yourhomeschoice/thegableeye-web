import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { isPubliclyReleasedArticlePath } from "../lib/publication/public-release.ts";

async function main() {
  assert.equal(isPubliclyReleasedArticlePath("/travel/esims/japan-esims-compared"), false);

  const [home, travel, landing, placement] = await Promise.all([
    readFile("app/page.tsx", "utf8"),
    readFile("app/travel/page.tsx", "utf8"),
    readFile("components/category-landing-page.tsx", "utf8"),
    readFile("lib/launch-baseline/article-placement.ts", "utf8"),
  ]);

  assert.match(placement, /id: JAPAN_ESIM_LAUNCH_BASELINE_KEY/);
  assert.match(placement, /href: "\/development-preview\/japan-esim-launch-v1"/);
  assert.match(placement, /process\.env\.NODE_ENV !== "development"/);
  assert.match(home, /index === 0 && developmentArticle/, "homepage latest and Travel first cards must be controlled placements");
  assert.equal((home.match(/HomepageLaunchArticlePlacementCard/g) ?? []).length, 3, "homepage must contain exactly two placement renderings and one import");
  assert.match(travel, /getDevelopmentArticlePlacement/, "Travel page must use the shared placement");
  assert.match(landing, /index === 0 && developmentArticle/, "Travel recent first card must be controlled");
  assert.match(landing, /section\.id === "connectivity" && index === 0 && developmentArticle/, "Connectivity first card must be controlled");
  assert.doesNotMatch(home + travel + landing, /japanEsimsComparedArticle/, "historical article fixture must not be displayed");

  console.log("Development article placement tests passed.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Development article placement tests failed.");
  process.exitCode = 1;
});
