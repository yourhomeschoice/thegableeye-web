import { notFound } from "next/navigation";
import { LaunchBaselineArticle } from "@/components/launch-baseline-article";
import { EditorialTable } from "@/components/editorial-table";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TABLE_PRESENTATION } from "@/lib/launch-baseline/article-table-presentation";
import { travelAdapterEbs005Tables, TravelAdapterEbs005BaselineReader } from "@/lib/launch-baseline/travel-adapter-ebs-005";

export const dynamic = "force-dynamic";
export default async function TravelAdapterEbs005PreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const baseline = await new TravelAdapterEbs005BaselineReader().getApprovedBaseline();
  const { scenario, comparison } = travelAdapterEbs005Tables;
  return <><SiteHeader /><LaunchBaselineArticle editorialHtml={baseline.editorialHtml} tableContent={[
    <EditorialTable key="scenario" presentation={TABLE_PRESENTATION.scenario} scenarioRows={scenario.rows.map(([label, value]) => ({ label, value }))} />,
    <EditorialTable key="comparison" presentation={TABLE_PRESENTATION.comparison} comparisonRowHeader={comparison.heading} comparisonColumns={comparison.columns.map((label) => ({ label }))} comparisonRows={comparison.rows.map(([supplier, ...values]) => ({ supplier, values }))} />,
  ]} /><SiteFooter /></>;
}
