import type { ReactNode } from "react";
import type { EditorialTablePresentation } from "@/lib/launch-baseline/article-table-presentation";

export type ScenarioTableRow = Readonly<{ label: ReactNode; value: ReactNode }>;
export type ComparisonTableColumn = Readonly<{ label: ReactNode }>;
export type ComparisonTableRow = Readonly<{ supplier: ReactNode; values: readonly ReactNode[] }>;

export type EditorialTableProps = Readonly<{
  presentation: EditorialTablePresentation;
  caption?: ReactNode;
  scenarioRows?: readonly ScenarioTableRow[];
  comparisonRowHeader?: ReactNode;
  comparisonColumns?: readonly ComparisonTableColumn[];
  comparisonRows?: readonly ComparisonTableRow[];
}>;

/** Renders only explicit editorial data; it does not infer structure from HTML. */
export function EditorialTable(props: EditorialTableProps) {
  if (props.presentation === "SCENARIO_TABLE") {
    if (!props.scenarioRows) throw new Error("SCENARIO_TABLE requires scenarioRows.");
    return <ScenarioTable caption={props.caption} rows={props.scenarioRows} />;
  }
  if (props.comparisonRowHeader === undefined || !props.comparisonColumns || !props.comparisonRows) throw new Error("COMPARISON_TABLE requires comparisonRowHeader, comparisonColumns, and comparisonRows.");
  return <ComparisonTable caption={props.caption} rowHeader={props.comparisonRowHeader} columns={props.comparisonColumns} rows={props.comparisonRows} />;
}

function ScenarioTable({ caption, rows }: Readonly<{ caption?: ReactNode; rows: readonly ScenarioTableRow[] }>) {
  return <div className="editorial-table editorial-table--scenario"><table>{caption ? <caption>{caption}</caption> : null}<tbody>{rows.map((row, index) => <tr key={index}><th scope="row">{row.label}</th><td>{row.value}</td></tr>)}</tbody></table></div>;
}

function ComparisonTable({ caption, rowHeader, columns, rows }: Readonly<{ caption?: ReactNode; rowHeader: ReactNode; columns: readonly ComparisonTableColumn[]; rows: readonly ComparisonTableRow[] }>) {
  if (rows.some((row) => row.values.length !== columns.length)) throw new Error("COMPARISON_TABLE rows must provide every declared column.");
  return <section className="editorial-table editorial-table--comparison" aria-label={typeof caption === "string" ? caption : "Comparison"}>
    <div className="editorial-comparison-table"><table>{caption ? <caption>{caption}</caption> : null}<thead><tr><th scope="col">{rowHeader}</th>{columns.map((column, index) => <th key={index} scope="col">{column.label}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}><th scope="row">{row.supplier}</th>{row.values.map((value, columnIndex) => <td key={columnIndex}>{value}</td>)}</tr>)}</tbody></table></div>
    <div className="editorial-comparison-cards">{caption ? <p className="editorial-comparison-caption">{caption}</p> : null}{rows.map((row, rowIndex) => <section className="editorial-comparison-card" key={rowIndex}><h3>{row.supplier}</h3><dl>{columns.map((column, columnIndex) => <div key={columnIndex}><dt>{column.label}</dt><dd>{row.values[columnIndex]}</dd></div>)}</dl></section>)}</div>
  </section>;
}
