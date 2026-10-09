const TABLE_WRAPPER_OPENING = '<div class="article-table-scroll">';

export const TABLE_PRESENTATION = {
  scenario: "SCENARIO_TABLE",
  comparison: "COMPARISON_TABLE",
} as const;

export type EditorialTablePresentation =
  (typeof TABLE_PRESENTATION)[keyof typeof TABLE_PRESENTATION];

export type ApprovedHtmlSegment = Readonly<{ kind: "html"; html: string }>;
export type ApprovedTableSegment = Readonly<{ kind: "table"; presentation: EditorialTablePresentation; html: string }>;
export type ApprovedArticleSegment = ApprovedHtmlSegment | ApprovedTableSegment;

function findClosingDiv(html: string, start: number): number {
  const divTag = /<\/?div\b[^>]*>/gi;
  divTag.lastIndex = start;
  let depth = 0;

  for (let match = divTag.exec(html); match; match = divTag.exec(html)) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return divTag.lastIndex;
  }

  throw new Error("Approved baseline table wrapper is not closed.");
}

/**
 * Compatibility adapter for an already-approved HTML baseline. It never parses
 * or rewrites table contents: each explicitly declared slot is returned as the
 * original byte slice. New content should use the typed EditorialTable contract.
 */
export function segmentApprovedHtmlByTablePresentations(
  editorialHtml: string,
  presentations: readonly EditorialTablePresentation[],
): readonly ApprovedArticleSegment[] {
  const segments: ApprovedArticleSegment[] = [];
  let cursor = 0;
  for (const presentation of presentations) {
    const tableStart = editorialHtml.indexOf(TABLE_WRAPPER_OPENING, cursor);
    if (tableStart < 0) throw new Error("Approved baseline does not contain every declared table slot.");
    const tableEnd = findClosingDiv(editorialHtml, tableStart);
    if (tableStart > cursor) segments.push({ kind: "html", html: editorialHtml.slice(cursor, tableStart) });
    segments.push({ kind: "table", presentation, html: editorialHtml.slice(tableStart, tableEnd) });
    cursor = tableEnd;
  }
  if (editorialHtml.indexOf(TABLE_WRAPPER_OPENING, cursor) !== -1) throw new Error("Approved baseline contains an undeclared table slot.");
  if (cursor < editorialHtml.length) segments.push({ kind: "html", html: editorialHtml.slice(cursor) });
  return segments;
}
