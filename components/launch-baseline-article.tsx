import { cloneElement, isValidElement, type ReactNode } from "react";
import type { EditorialTablePresentation } from "@/lib/launch-baseline/article-table-presentation";

type LaunchBaselineArticleProps = Readonly<{
  editorialHtml: string;
  tablePresentations?: readonly EditorialTablePresentation[];
  /** Typed tables replace only their matching immutable HTML slice. */
  tableContent?: readonly ReactNode[];
}>;

import { segmentApprovedHtmlByTablePresentations, TABLE_PRESENTATION } from "@/lib/launch-baseline/article-table-presentation";

/** Renders only the fixed, human-approved Japan eSIM launch baseline. */
export function LaunchBaselineArticle({ editorialHtml, tablePresentations = [TABLE_PRESENTATION.scenario, TABLE_PRESENTATION.comparison], tableContent }: LaunchBaselineArticleProps) {
  const segments = segmentApprovedHtmlByTablePresentations(editorialHtml, tablePresentations);

  return (
    <main className="article-page">
      <article className="article-shell article-reading article-markdown launch-baseline-article">
        {segments.map((segment, index) => {
          if (segment.kind === "html") return <div className="launch-baseline-content" dangerouslySetInnerHTML={{ __html: segment.html }} key={`html-${index}`} />;
          const table = tableContent?.[segments.slice(0, index + 1).filter((item) => item.kind === "table").length - 1];
          return isValidElement(table) ? cloneElement(table, { key: `table-${index}` }) : table ?? <div className={`editorial-table editorial-table--${segment.presentation === TABLE_PRESENTATION.scenario ? "scenario" : "comparison"}`} dangerouslySetInnerHTML={{ __html: segment.html }} key={`table-${index}`} />;
        })}
      </article>
    </main>
  );
}

