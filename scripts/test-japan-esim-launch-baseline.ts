import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  JAPAN_ESIM_LAUNCH_BASELINE_KEY,
  JapanEsimLaunchBaselineReader,
} from "../lib/launch-baseline/japan-esim-launch-baseline.ts";
import { isPubliclyReleasedArticlePath } from "../lib/publication/public-release.ts";

const approvedHtml = "<h1>Approved headline</h1><div class=\"article-table-scroll\"><table><tr><th>Trip</th></tr></table></div><div class=\"article-table-scroll\"><table><tr><th>Price</th></tr></table></div>";
const checksum = createHash("sha256").update(approvedHtml).digest("hex");

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function fetcherFor(
  baseline: Record<string, unknown>[] = [
    {
      baseline_key: JAPAN_ESIM_LAUNCH_BASELINE_KEY,
      article_key: "japan-esims-compared",
      public_path: "/travel/esims/japan-esims-compared",
      title: "Approved headline",
      editorial_body: approvedHtml,
      editorial_body_sha256: checksum,
      editorial_approval_status: "HUMAN_APPROVED",
      release_status: "NOT_RELEASED",
      recommended_supplier: "UBIGI",
    },
  ],
  packages: Record<string, unknown>[] = [
    {
      supplier_key: "UBIGI",
      approval_basis: "HUMAN_FINAL_EDITORIAL_REVIEW",
      approved_details: { recommended: true },
    },
  ],
) {
  const calls: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    const url = String(input);
    calls.push(url);
    return response(url.includes("launch_editorial_baselines") ? baseline : packages);
  };
  return { calls, fetcher };
}

async function rejects(action: () => Promise<unknown>, pattern: RegExp) {
  await assert.rejects(action, pattern);
}

async function main() {
  const { calls, fetcher } = fetcherFor();
  const reader = new JapanEsimLaunchBaselineReader("https://example.supabase.co", "server-key", fetcher);
  const baseline = await reader.getApprovedBaseline();

  assert.equal(baseline.editorialHtml, approvedHtml, "approved HTML must be returned unchanged");
  assert.equal((baseline.editorialHtml.match(/<table>/g) ?? []).length, 2, "both approved tables must remain present");
  assert.equal(calls.length, 2);
  assert.ok(calls.every((url) => url.includes(`baseline_key=eq.${JAPAN_ESIM_LAUNCH_BASELINE_KEY}`)));
  assert.ok(calls.every((url) => !url.includes("/publications")), "historical publications must not be queried");
  assert.equal(isPubliclyReleasedArticlePath("/travel/esims/japan-esims-compared"), false, "public release must remain disabled");

  await rejects(
    () => new JapanEsimLaunchBaselineReader("https://example.supabase.co", "server-key", fetcherFor([]).fetcher).getApprovedBaseline(),
    /missing or ambiguous/,
  );
  await rejects(
    () => new JapanEsimLaunchBaselineReader("https://example.supabase.co", "server-key", fetcherFor([{ baseline_key: JAPAN_ESIM_LAUNCH_BASELINE_KEY, article_key: "japan-esims-compared", public_path: "/travel/esims/japan-esims-compared", title: "Approved headline", editorial_body: approvedHtml, editorial_body_sha256: checksum, editorial_approval_status: "PENDING", release_status: "NOT_RELEASED", recommended_supplier: "UBIGI" }]).fetcher).getApprovedBaseline(),
    /not approved/,
  );
  await rejects(
    () => new JapanEsimLaunchBaselineReader("https://example.supabase.co", "server-key", fetcherFor(undefined, []).fetcher).getApprovedBaseline(),
    /supplier package/,
  );

  console.log("Japan eSIM launch baseline tests passed.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Japan eSIM launch baseline tests failed.");
  process.exitCode = 1;
});
