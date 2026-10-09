import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EditorialTable } from "../components/editorial-table.tsx";
import { segmentApprovedHtmlByTablePresentations, TABLE_PRESENTATION } from "../lib/launch-baseline/article-table-presentation.ts";

async function main() {
  const [component, css] = await Promise.all([
    readFile("components/launch-baseline-article.tsx", "utf8"),
    readFile("app/globals.css", "utf8"),
  ]);

  assert.doesNotMatch(component, /useEffect|editorialHtml\.replace|first-of-type|nth-of-type/);
  assert.match(component, /TABLE_PRESENTATION\.scenario/);
  assert.match(component, /TABLE_PRESENTATION\.comparison/);
  assert.match(component, /key: `table-\$\{index\}`/, "injected table content must be re-keyed in the segment sibling list");
  assert.doesNotMatch(css, /article-table-scroll:(?:first|nth)-of-type|:has\(/);
  assert.match(css, /\.editorial-table--scenario > table \{ width:100%; max-width:100%; min-width:0; table-layout:fixed; \}/);
  assert.match(css, /\.editorial-table--comparison \.editorial-comparison-table \{ display:none; \}/);
  assert.match(css, /\.editorial-comparison-cards \{ display:grid; gap:14px; \}/);
  assert.match(css, /\.article-table--comparison > \.article-table-scroll::before/);
  assert.match(css, /Swipe sideways to see the full comparison/);

  const representativeArticleHtml = '<h1>Approved headline</h1><div class="article-table-scroll"><table><tr><th>At least 10 GB</th><td>Required</td></tr></table></div><p>Unchanged editorial copy.</p><div class="article-table-scroll"><table><tr><th>Provider</th></tr></table></div><p>Footnote.</p>';
  const segments = segmentApprovedHtmlByTablePresentations(representativeArticleHtml, [TABLE_PRESENTATION.scenario, TABLE_PRESENTATION.comparison]);

  assert.equal(
    segments.map((segment) => segment.html).join(""),
    representativeArticleHtml,
    "presentation splitting must preserve the approved HTML byte-for-byte",
  );
  assert.equal(segments.filter((segment) => segment.kind === "table").length, 2);
  assert.throws(() => segmentApprovedHtmlByTablePresentations(representativeArticleHtml, [TABLE_PRESENTATION.scenario]), /undeclared/);

  const comparison = renderToStaticMarkup(createElement(EditorialTable, { presentation: TABLE_PRESENTATION.comparison, caption: "Approved comparison", comparisonRowHeader: "Provider", comparisonColumns: [{ label: "Price" }, { label: "Qualifier" }], comparisonRows: [{ supplier: "Supplier A", values: ["$16.00", "Approved qualifier"] }, { supplier: "Supplier B", values: ["$20.00", "Footnote preserved"] }] }));
  for (const value of ["Provider", "Supplier A", "Supplier B", "$16.00", "$20.00", "Approved qualifier", "Footnote preserved", "Price", "Qualifier"]) assert.ok(comparison.includes(value), `${value} must remain represented`);
  assert.match(comparison, /scope="col"/);
  assert.match(comparison, /scope="row"/);
  assert.throws(() => renderToStaticMarkup(createElement(EditorialTable, { presentation: TABLE_PRESENTATION.comparison, comparisonRowHeader: "Provider", comparisonColumns: [{ label: "Price" }], comparisonRows: [{ supplier: "Supplier A", values: [] }] })), /every declared column/);

  console.log("Launch baseline table presentation tests passed.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Launch baseline table presentation tests failed.");
  process.exitCode = 1;
});
