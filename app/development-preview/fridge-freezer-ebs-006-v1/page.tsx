import { notFound } from "next/navigation";
import { LaunchBaselineArticle } from "@/components/launch-baseline-article";
import { EditorialTable } from "@/components/editorial-table";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TABLE_PRESENTATION } from "@/lib/launch-baseline/article-table-presentation";
import { fridgeFreezerEbs006Tables, FridgeFreezerEbs006BaselineReader } from "@/lib/launch-baseline/fridge-freezer-ebs-006";
export const dynamic = "force-dynamic";
export default async function Page() { if (process.env.NODE_ENV !== "development") notFound(); const b = await new FridgeFreezerEbs006BaselineReader().getApprovedBaseline(); const { scenario, comparison } = fridgeFreezerEbs006Tables; return <><SiteHeader /><LaunchBaselineArticle editorialHtml={b.editorialHtml} tableContent={[<EditorialTable key="s" presentation={TABLE_PRESENTATION.scenario} scenarioRows={scenario.rows.map(([label, value]) => ({ label, value }))}/>, <EditorialTable key="c" presentation={TABLE_PRESENTATION.comparison} comparisonRowHeader={comparison.heading} comparisonColumns={comparison.columns.map(label => ({ label }))} comparisonRows={comparison.rows.map(([supplier,...values]) => ({ supplier, values }))}/>]}/><SiteFooter /></>; }
