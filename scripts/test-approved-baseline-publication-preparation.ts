import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { renderToStaticMarkup } from "react-dom/server";
import type { RecommendationComparisonArticle } from "../lib/publication/types.ts";
import { sanitiseTrustedEditorialHtml } from "../lib/publication/editorial-html.ts";
import { validatePublicationArticle } from "../lib/publication/validation.ts";

const BASELINES = [
  ["japan-esim-launch-v1", "Travel", "eSIMs & Connectivity"],
  ["travel-adapter-ebs-005-v1", "Travel", "Travel Accessories"],
  ["fridge-freezer-ebs-006-v1", "Home", "Kitchen Appliances"],
  ["coffee-espresso-machine-ebs-007-v1", "Home", "Coffee Machines"],
  ["laptop-ebs-008-v1", "Tech", "Laptops"],
  ["luggage-tags-ebs-009-v1", "Travel", "Travel Accessories"],
  ["air-fryer-ebs-010-v1", "Home", "Kitchen Appliances"],
] as const;

const LOCAL_ARTIFACTS: Readonly<Record<string, string>> = {
  "travel-adapter-ebs-005-v1": "travel-adapter-ebs-005-v1.html",
  "fridge-freezer-ebs-006-v1": "fridge-freezer-ebs-006-v1.html",
  "coffee-espresso-machine-ebs-007-v1": "coffee-espresso-machine-ebs-007-v1.html",
  "laptop-ebs-008-v1": "laptop-ebs-008-v1.html",
};

type BaselineRow = Readonly<{
  baseline_key: string;
  article_key: string;
  public_path: string;
  title: string;
  editorial_body: string;
  editorial_body_sha256: string;
  editorial_approval_status: string;
  release_status: string;
}>;

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

async function getApprovedBaselines(): Promise<readonly BaselineRow[]> {
  loadEnvConfig(process.cwd());
  const url = process.env.SUPABASE_URL;
  // This private baseline table has no configured read-only key in this repo.
  // Prefer one when provisioned; otherwise this opt-in, server-side-only test
  // uses the existing service-role access used by ApprovedLaunchBaselineReader.
  const key = process.env.SUPABASE_BASELINE_READ_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_BASELINE_READ_KEY (or SUPABASE_SERVICE_ROLE_KEY) are required for read-only baseline verification.");
  const query = new URLSearchParams({
    select: "baseline_key,article_key,public_path,title,editorial_body,editorial_body_sha256,editorial_approval_status,release_status",
    baseline_key: "in.(" + BASELINES.map(([key]) => key).join(",") + ")",
    order: "baseline_key.asc",
  });
  const response = await fetch(url.replace(/\/$/, "") + "/rest/v1/launch_editorial_baselines?" + query, {
    headers: { Accept: "application/json", apikey: key, Authorization: "Bearer " + key },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Approved baseline read failed with status " + response.status + ".");
  const rows: unknown = await response.json();
  if (!Array.isArray(rows)) throw new Error("Approved baseline read returned an invalid response.");
  return rows as readonly BaselineRow[];
}

export async function runApprovedBaselinePublicationPreparationTest() {
  const rows = await getApprovedBaselines();
  assert.equal(rows.length, BASELINES.length, "all seven approved baselines are returned");
  process.env.SUPABASE_URL ??= "https://publication-test.invalid";
  process.env.SUPABASE_PUBLISHABLE_KEY ??= "publication-test-key";
  const { RecommendationArticle } = await import("../components/recommendation-article.tsx");

  const reports: string[] = [];
  for (const [baselineKey, category, subcategory] of BASELINES) {
    const row = rows.find((candidate) => candidate.baseline_key === baselineKey);
    assert.ok(row, baselineKey + " is present");
    assert.equal(row.editorial_approval_status, "HUMAN_APPROVED", baselineKey + " is human approved");
    assert.equal(row.release_status, "NOT_RELEASED", baselineKey + " remains unreleased");
    assert.equal(sha256(row.editorial_body), row.editorial_body_sha256, baselineKey + " Supabase body hash matches its registered hash");

    const localArtifact = LOCAL_ARTIFACTS[baselineKey];
    let localArtifactStatus = "none";
    if (localArtifact) {
      const localHtml = await readFile("publication-artifacts/" + localArtifact, "utf8");
      localArtifactStatus = sha256(localHtml) === row.editorial_body_sha256 ? "verified" : "MISMATCH";
    }

    const pathSegments = row.public_path.split("/").filter(Boolean);
    assert.ok(row.public_path.startsWith("/"), baselineKey + " has an absolute public path");
    const article = {
      publicationStatus: "PUBLISHED",
      path: row.public_path as `/${string}`,
      slug: pathSegments.at(-1)!,
      category,
      subcategory,
      articleType: "Comparison / Recommendation Guide",
      title: row.title,
      standfirst: "Approved editorial baseline; publication metadata pending.",
      author: "The Gable Eye Editorial",
      lastResearched: "Not supplied in approved baseline.",
      articleBody: { format: "HTML", content: row.editorial_body },
    } satisfies RecommendationComparisonArticle;

    const validation = validatePublicationArticle(article);
    assert.equal(validation.valid, true, validation.valid ? baselineKey + " local canonical payload is valid" : baselineKey + ": " + validation.errors.join(" "));
    const expectedBody = sanitiseTrustedEditorialHtml(row.editorial_body);
    const rendered = renderToStaticMarkup(RecommendationArticle({ article }));
    assert.ok(rendered.includes('<div class="article-reading article-markdown"><div class="article-html">' + expectedBody + "</div></div>"), baselineKey + " rendered editorial body is preserved exactly");
    const h1Count = (expectedBody.match(/<h1\b/g) ?? []).length;
    assert.equal(h1Count, 1, baselineKey + " approved body has exactly one H1");
    assert.equal((rendered.match(/<h1\b/g) ?? []).length, 1, baselineKey + " rendered page has exactly one H1");
    reports.push(`${baselineKey}\t${row.editorial_body_sha256}\t${localArtifactStatus}\th1=${h1Count}\ttables=${(expectedBody.match(/<table>/g) ?? []).length}\tpayload=valid\trender=preserved`);
  }
  console.log("baseline\tsupabase_sha256\tlocal_artifact\th1\ttables\tpayload\trender");
  for (const report of reports) console.log(report);
  console.log("Approved baseline publication-preparation checks passed.");
}

if (process.argv[1]?.endsWith("test-approved-baseline-publication-preparation.ts")) {
  void runApprovedBaselinePublicationPreparationTest();
}
