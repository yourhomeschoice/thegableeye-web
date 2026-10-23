import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { validatePublicationArticle } from "../lib/publication/validation.ts";
import {
  buildA001HousePublication,
  buildA002HousePublication,
} from "./house-canonical-specimens.ts";

process.env.SUPABASE_URL ??= "https://publication-test.invalid";
process.env.SUPABASE_PUBLISHABLE_KEY ??= "publication-test-key";


void (async()=>{const {RecommendationArticle}=await import("../components/recommendation-article.tsx");for(const [name,specimen] of [["A001",buildA001HousePublication()],["A002",buildA002HousePublication()]] as const){const result=validatePublicationArticle(specimen);assert.equal(result.valid,true,`${name} validates`);const body=specimen.articleBody!;if(body.format!=="HOUSE")throw new Error("Expected HOUSE");const comparison=body.presentation.sections.find(section=>section.kind==="COMPARISON");const alts=body.presentation.sections.find(section=>section.kind==="ALTERNATIVES");assert.equal(comparison?.kind==="COMPARISON"&&comparison.rows.length,10,`${name} retains ten products`);assert.equal(alts?.kind==="ALTERNATIVES"&&alts.items.length,9,`${name} retains nine alternatives`);const markup=renderToStaticMarkup(RecommendationArticle({article:specimen}));assert.equal((markup.match(/house-article-disclosure/g)??[]).length,1);assert.equal((markup.match(/house-article-independence/g)??[]).length,1);assert.doesNotMatch(markup,/<p><p>/);assert.ok(markup.includes(specimen.title));assert.ok(markup.includes(specimen.standfirst));}console.log("A001/A002 canonical HOUSE specimen proof passed without publication actions.");})().catch(error=>{console.error(error);process.exitCode=1});
