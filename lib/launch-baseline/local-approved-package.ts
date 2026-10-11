import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

export type LocalManifest = { baseline_key: string; article_key: string; sha256: string; preview: { title: string; category: string; table_presentations: ("SCENARIO_TABLE" | "COMPARISON_TABLE")[]; trim_trailing_empty_cells?: number[] }; tables: string[][][]; editorial_status?: "EDITORIAL_REVIEW_COMPLETE"; release_status?: "NOT_RELEASED"; affiliate_disclosure?: boolean; product_links?: readonly { identifier: string; href: string }[] };
const keyPattern=/^[a-z0-9-]+$/;
function fail(message:string):never { throw new Error(`Malformed local publishing package: ${message}`); }
export function validateLocalApprovedPackage(key:string, html:string, value:unknown): LocalManifest {
  if(!keyPattern.test(key) || typeof value!=="object" || !value) fail("invalid identity"); const m=value as LocalManifest;
  if(m.baseline_key!==key || !keyPattern.test(m.article_key) || typeof m.sha256!=="string" || !/^[a-f0-9]{64}$/.test(m.sha256)) fail("invalid identity or checksum");
  if(createHash("sha256").update(Buffer.from(html,"utf8")).digest("hex")!==m.sha256) throw new Error("Local publishing package checksum does not match.");
  if(!m.preview || !m.preview.title || !m.preview.category || !Array.isArray(m.preview.table_presentations) || !Array.isArray(m.tables) || m.tables.length!==m.preview.table_presentations.length) fail("preview metadata");
  const trims=m.preview.trim_trailing_empty_cells??[]; if(!Array.isArray(trims) || trims.some(i=>!Number.isInteger(i)||i<0||i>=m.tables.length) || new Set(trims).size!==trims.length) fail("structural normalisation declaration");
  if (m.editorial_status !== undefined && m.editorial_status !== "EDITORIAL_REVIEW_COMPLETE") fail("editorial status");
  if (m.release_status !== undefined && m.release_status !== "NOT_RELEASED") fail("release status");
  if (m.affiliate_disclosure !== undefined && typeof m.affiliate_disclosure !== "boolean") fail("affiliate disclosure");
  if (m.product_links !== undefined && (!Array.isArray(m.product_links) || m.product_links.some((link) => !link || typeof link.identifier !== "string" || !/^[A-Z0-9]{10}$/.test(link.identifier) || typeof link.href !== "string" || link.href !== `https://www.amazon.com/dp/${link.identifier}`))) fail("product links");
  m.tables.forEach((grid,index)=>{if(!Array.isArray(grid)||grid.length<1||grid.some(row=>!Array.isArray(row)||row.some(cell=>typeof cell!=="string")))fail("table cells");const kind=m.preview.table_presentations[index];if(kind!=="SCENARIO_TABLE"&&kind!=="COMPARISON_TABLE")fail("table type");const widths=grid.map(row=>row.length);const normal=trims.includes(index);if(normal){if(widths.some(w=>w!==widths[0]&&w!==widths[0]+1)||grid.some(row=>row.length===widths[0]+1&&row.at(-1)!==""))fail("unapproved structural cell");}else if(widths.some(w=>w!==widths[0]))fail("table dimensions");const logical=normal?Math.min(...widths):widths[0];if(kind==="SCENARIO_TABLE"&&logical!==2)fail("scenario dimensions");if(kind==="COMPARISON_TABLE"&&(grid.length<2||logical<2))fail("comparison dimensions");});
  return m;
}
export async function getLocalApprovedPackage(key:string) { if(!keyPattern.test(key)) throw new Error("Invalid local package identity.");const dir=path.join(process.cwd(),"publication-artifacts");const file=`${key}.validation.json`;if(!(await readdir(dir)).includes(file))return undefined;const html=await readFile(path.join(dir,`${key}.html`),"utf8");return {html,manifest:validateLocalApprovedPackage(key,html,JSON.parse(await readFile(path.join(dir,file),"utf8")))}; }
