
import {
  cloneElement,
  Fragment,
  isValidElement,
  type ReactNode,
} from "react";

import type { EditorialTablePresentation } from "@/lib/launch-baseline/article-table-presentation";

import {
  segmentApprovedHtmlByTablePresentations,
  TABLE_PRESENTATION,
} from "@/lib/launch-baseline/article-table-presentation";

type LaunchBaselineArticleProps = Readonly<{
  editorialHtml: string;
  tablePresentations?: readonly EditorialTablePresentation[];
  /** Typed tables replace only their matching immutable HTML slice. */
  tableContent?: readonly ReactNode[];
  disclosure?: ReactNode;
}>;

/** Renders approved editorial HTML with optional typed tables and disclosure. */
export function LaunchBaselineArticle({
  editorialHtml,
  tablePresentations = [
    TABLE_PRESENTATION.scenario,
    TABLE_PRESENTATION.comparison,
  ],
  tableContent,
  disclosure,
}: LaunchBaselineArticleProps) {
  const segments = segmentApprovedHtmlByTablePresentations(
    editorialHtml,
    tablePresentations
  );

  return (
    <main className="article-page">
      <article className="article-shell article-reading article-markdown launch-baseline-article">
        {segments.map((segment, index) => {
          if (segment.kind === "html") {
            const firstHeadingEnd =
              index === 0 && disclosure
                ? segment.html.indexOf("</h1>") + 5
                : 0;

            if (firstHeadingEnd > 5) {
              return (
                <Fragment key={`html-${index}`}>
                  <div
                    className="launch-baseline-content"
                    dangerouslySetInnerHTML={{
                      __html: segment.html.slice(0, firstHeadingEnd),
                    }}
                  />

                  {disclosure}

                  <div
                    className="launch-baseline-content"
                    dangerouslySetInnerHTML={{
                      __html: segment.html.slice(firstHeadingEnd),
                    }}
                  />
                </Fragment>
              );
            }

            return (
              <div
                key={`html-${index}`}
                className="launch-baseline-content"
                dangerouslySetInnerHTML={{
                  __html: segment.html,
                }}
              />
            );
          }

          const tableIndex =
            segments
              .slice(0, index + 1)
              .filter((item) => item.kind === "table").length - 1;

          const table = tableContent?.[tableIndex];

          if (isValidElement(table)) {
            return cloneElement(table, {
              key: `table-${index}`,
            });
          }

          if (table != null) {
            return (
              <Fragment key={`table-${index}`}>
                {table}
              </Fragment>
            );
          }

          return (
            <div
              key={`table-${index}`}
              className={`editorial-table editorial-table--${
                segment.presentation === TABLE_PRESENTATION.scenario
                  ? "scenario"
                  : "comparison"
              }`}
              dangerouslySetInnerHTML={{
                __html: segment.html,
              }}
            />
          );
        })}
      </article>
    </main>
  );
}
