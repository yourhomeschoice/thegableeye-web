import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EditorialTable } from "../components/editorial-table.tsx";
import { isPubliclyReleasedArticlePath } from "../lib/publication/public-release.ts";
import { TRAVEL_ADAPTER_EBS_005_BASELINE_KEY, TRAVEL_ADAPTER_EBS_005_SHA256, travelAdapterEbs005Tables, TravelAdapterEbs005BaselineReader } from "../lib/launch-baseline/travel-adapter-ebs-005.ts";

async function main() {
  const html = await readFile("publication-artifacts/travel-adapter-ebs-005-v1.html", "utf8");
  assert.equal(createHash("sha256").update(html).digest("hex"), TRAVEL_ADAPTER_EBS_005_SHA256);
  for (const text of ["THE GABLE’S TRAVEL ADAPTOR PICK: ", "EPICKA TA-105 Pro", "Anker Nano Travel Adapter A9215", "Ceptics UP-70KU", "TESSAN WTA09", "$39.99", "$25.99", "$47.99", "USA, Europe, Australia and Japan", "Phone, tablet and laptop", "Multiple devices during the same trip", "One versatile travel adapter", "Choose the Anker if portability and lower purchase price are more important to you than higher-powered multi-device charging."]) assert.ok(html.includes(text), text);
  assert.equal((html.match(/article-table-scroll/g) ?? []).length, 2);
  const approvedTables = [...html.matchAll(/<div class="article-table-scroll">(.*?)<\/div>/g)].map((match) => match[1]);
  assert.equal(approvedTables.length, 2);
  const rowsFrom = (table: string) => [...table.matchAll(/<tr>(.*?)<\/tr>/g)].map((row) => [...row[1].matchAll(/<(?:th[^>]*|td)>(.*?)<\/(?:th|td)>/g)].map((cell) => cell[1]));
  assert.deepEqual(rowsFrom(approvedTables[0]), travelAdapterEbs005Tables.scenario.rows, "scenario source rows, order, labels, and cells must be exact");
  assert.deepEqual(rowsFrom(approvedTables[1]), [
    [travelAdapterEbs005Tables.comparison.heading, ...travelAdapterEbs005Tables.comparison.columns],
    ...travelAdapterEbs005Tables.comparison.rows,
  ], "comparison source rows, order, column positions, and cells must be exact");
  const scenario = renderToStaticMarkup(createElement(EditorialTable, { presentation: travelAdapterEbs005Tables.scenario.presentation, scenarioRows: travelAdapterEbs005Tables.scenario.rows.map(([label, value]) => ({ label, value })) }));
  for (const [label, value] of travelAdapterEbs005Tables.scenario.rows) {
    assert.ok(approvedTables[0].includes(label) && approvedTables[0].includes(value), `approved scenario ${label}`);
    assert.ok(scenario.includes(label) && scenario.includes(value), `rendered scenario ${label}`);
  }
  assert.deepEqual(rowsFrom(scenario), travelAdapterEbs005Tables.scenario.rows, "rendered scenario table structure must retain source row order and positions");
  const comparison = renderToStaticMarkup(createElement(EditorialTable, { presentation: travelAdapterEbs005Tables.comparison.presentation, comparisonRowHeader: travelAdapterEbs005Tables.comparison.heading, comparisonColumns: travelAdapterEbs005Tables.comparison.columns.map((label) => ({ label })), comparisonRows: travelAdapterEbs005Tables.comparison.rows.map(([supplier, ...values]) => ({ supplier, values })) }));
  for (const value of [travelAdapterEbs005Tables.comparison.heading, ...travelAdapterEbs005Tables.comparison.columns, ...travelAdapterEbs005Tables.comparison.rows.flat()]) {
    assert.ok(approvedTables[1].includes(value), `approved comparison ${value}`);
    assert.ok(comparison.includes(value), `rendered comparison ${value}`);
  }
  assert.deepEqual(rowsFrom(comparison), [
    [travelAdapterEbs005Tables.comparison.heading, ...travelAdapterEbs005Tables.comparison.columns],
    ...travelAdapterEbs005Tables.comparison.rows,
  ], "rendered comparison table structure must retain source row order, column positions, and cells");
  assert.equal(isPubliclyReleasedArticlePath("/travel/travel-accessories/universal-travel-adapter-comparison"), false);
  const calls: string[] = [];
  const fetcher: typeof fetch = async (input) => { calls.push(String(input)); return new Response(JSON.stringify([{ baseline_key: TRAVEL_ADAPTER_EBS_005_BASELINE_KEY, article_key: "universal-travel-adapter-comparison", public_path: "/travel/travel-accessories/universal-travel-adapter-comparison", title: "THE GABLE’S TRAVEL ADAPTOR PICK: EPICKA TA-105 Pro", editorial_body: html, editorial_body_sha256: TRAVEL_ADAPTER_EBS_005_SHA256, editorial_approval_status: "HUMAN_APPROVED", release_status: "NOT_RELEASED", recommended_supplier: "EPICKA TA-105 Pro" }])); };
  await new TravelAdapterEbs005BaselineReader("https://example.supabase.co", "server-key", fetcher).getApprovedBaseline();
  assert.equal(calls.length, 1, "adapter preview must not require an artificial supplier package");
  console.log("Travel adapter EBS-005 tests passed.");
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
