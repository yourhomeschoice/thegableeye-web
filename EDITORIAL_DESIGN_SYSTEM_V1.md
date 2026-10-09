# Editorial Design System v1 — Pilot A

This pilot provides a deliberately small presentation contract for editorial articles. It does not alter editorial source material or publication authority.

## Supported components

- `SCENARIO_TABLE`: a two-column facts table. On small screens it has a fixed, full-width layout, values wrap, and it never scrolls horizontally.
- `COMPARISON_TABLE`: an explicit supplier-by-attribute matrix. It is a semantic HTML table on desktop and lossless supplier cards on small screens. Each card repeats every declared column and its original React content, including links and emphasis.
- Existing article typography: `.article-markdown` supplies titles, introductions, headings, paragraphs, lists, links, and emphasis. Existing recommendation, affiliate disclosure, uncertainty, and footnote styles remain the shared editorial treatment.

## Authoring contract

Use `EditorialTable` with the `SCENARIO_TABLE` or `COMPARISON_TABLE` presentation constant. A comparison supplies its own row-header label and every row must contain a value for every declared column; the component throws rather than silently dropping information. Values are React nodes so approved links, qualifiers, footnotes, and emphasis can be retained.

## Approved HTML compatibility

The Japan eSIM launch baseline remains stored and rendered as untouched HTML slices. Its two table placements are explicitly declared by the preview renderer, not inferred from sibling order or CSS selectors. The raw comparison remains a scrollable table on mobile because its approved HTML is not a typed table contract and cannot be converted to cards without parsing and risking loss of table semantics or content.

## Responsive rules

- Scenario tables: no horizontal scroll at widths at or below 700px.
- Typed comparison tables: semantic table at desktop; cards at or below 700px.
- Legacy/raw comparison tables: retain native table structure and horizontally scroll at small widths with an instructional label.

No public route or deployment behavior is introduced by this system.
