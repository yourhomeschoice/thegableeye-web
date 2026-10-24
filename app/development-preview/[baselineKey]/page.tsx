import { notFound } from "next/navigation";
import { EditorialTable } from "@/components/editorial-table";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";
import { HouseEditorialIndependence } from "@/components/house-article-presentation";
import { LaunchBaselineArticle } from "@/components/launch-baseline-article";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLocalApprovedPackage } from "@/lib/launch-baseline/local-approved-package";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{baselineKey:string}>}) { if(process.env.NODE_ENV!=="development") notFound(); const p=await getLocalApprovedPackage((await params).baselineKey).catch(()=>undefined);if(!p)notFound();const {manifest}=p;const linkedSupplier=(supplier:string)=>{const link=manifest.product_links?.find((item)=>supplier.includes(item.identifier));return link?<a href={link.href} rel="sponsored noopener noreferrer" target="_blank">{supplier}</a>:supplier;};return <><SiteHeader/><LaunchBaselineArticle editorialHtml={p.html} tablePresentations={manifest.preview.table_presentations} disclosure={<AffiliateDisclosure variant="article"/>} editorialIndependence={<HouseEditorialIndependence/>} tableContent={manifest.tables.map((grid,index)=>{const rows=manifest.preview.trim_trailing_empty_cells?.includes(index)?grid.map(row=>row.at(-1)===""?row.slice(0,-1):row):grid;const presentation=manifest.preview.table_presentations[index];return presentation==="SCENARIO_TABLE"?<EditorialTable key={index} presentation={presentation} scenarioRows={rows.map(([label,value])=>({label,value}))}/>:<EditorialTable key={index} presentation={presentation} comparisonRowHeader={rows[0][0]} comparisonColumns={rows[0].slice(1).map(label=>({label}))} comparisonRows={rows.slice(1).map(([supplier,...values])=>({supplier:linkedSupplier(supplier),values}))}/>})}/><SiteFooter/></>; }
