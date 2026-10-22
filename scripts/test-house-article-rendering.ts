import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { RecommendationComparisonArticle } from "../lib/publication/types.ts";

process.env.SUPABASE_URL ??= "https://publication-test.invalid";
process.env.SUPABASE_PUBLISHABLE_KEY ??= "publication-test-key";

void (async () => {
const { RecommendationArticle } = await import("../components/recommendation-article.tsx");
const { SlowCookerPreview } = await import("../components/slow-cooker-preview.tsx");
const { ClothesDryerPreview } = await import("../components/clothes-dryer-preview.tsx");

const affiliateDisclosure = "The Gable Eye may earn a commission if you buy through certain links in our articles, at no additional cost to you. This does not influence our editorial recommendations.";

function houseBody(sections: readonly unknown[], guide: readonly unknown[] = [{ targetId: "verdict", label: "Our verdict" }]) {
  return { format: "HOUSE", presentation: { guide, sections } };
}

function article(articleBody: unknown): RecommendationComparisonArticle {
  return {
    publicationStatus: "PUBLISHED", path: "/home/house-test", slug: "house-test", category: "Home", subcategory: "Kitchen", articleType: "Comparison", title: "House renderer test", standfirst: "A test standfirst.", author: "Editorial", lastResearched: "2026-10-22", affiliateDisclosure: "This legacy disclosure must not render for HOUSE.", image: { src: "/images/house-test.jpg", alt: "House test image", width: 1234, height: 567, caption: "A test caption." }, articleBody,
  } as RecommendationComparisonArticle;
}

function render(articleBody: unknown) {
  return renderToStaticMarkup(RecommendationArticle({ article: article(articleBody) }));
}

function occurrences(markup: string, text: string) {
  return markup.split(text).length - 1;
}

const methodology = { kind: "TEXT", id: "methodology", heading: "How we compared", paragraphs: ["Method paragraph."], role: "METHODOLOGY" } as const;
const verdict = { kind: "VERDICT", id: "verdict", paragraphs: ["Verdict paragraph."] } as const;
const comparison = { kind: "COMPARISON", id: "comparison", heading: "Comparison at a glance", introduction: ["Comparison introduction."], columns: [{ key: "subject", label: "Model" }, { key: "capacity", label: "Capacity" }, { key: "feature", label: "Feature" }], rows: [{ subject: "Model A", cells: ["6 qt", "Timer"] }], stickyFirstColumn: true } as const;
const alternatives = { kind: "ALTERNATIVES", id: "alternatives", heading: "Alternatives", items: [{ heading: "Alternative A", paragraphs: ["Alternative paragraph one.", "Alternative paragraph two."] }] } as const;

const threeColumnMarkup = render(houseBody([verdict, comparison, alternatives, methodology], [{ targetId: "verdict", label: "Our verdict" }, { targetId: "comparison", label: "Comparison at a glance" }]));
assert.ok(threeColumnMarkup.includes('href="#verdict"'));
assert.ok(threeColumnMarkup.includes('href="#comparison"'));
assert.ok(threeColumnMarkup.includes("Our verdict"));
assert.ok(threeColumnMarkup.includes("Comparison at a glance"));
assert.ok(threeColumnMarkup.includes("house-article-comparison--sticky-first-column"));
assert.ok(threeColumnMarkup.includes("Alternative paragraph one."));
assert.ok(threeColumnMarkup.includes("Alternative paragraph two."));
assert.ok(threeColumnMarkup.indexOf("Alternative paragraph one.") < threeColumnMarkup.indexOf("Alternative paragraph two."));
assert.doesNotMatch(threeColumnMarkup, /<p><p>/, "alternative paragraphs are not nested");
assert.equal(occurrences(threeColumnMarkup, affiliateDisclosure), 1, "primary disclosure renders once");
assert.equal(occurrences(threeColumnMarkup, "Editorial independence:"), 1, "independence disclosure renders once");
assert.ok(threeColumnMarkup.indexOf("Method paragraph.") < threeColumnMarkup.indexOf("Editorial independence:"));
assert.equal(occurrences(threeColumnMarkup, "House renderer test"), 1, "title renders once");
assert.equal(occurrences(threeColumnMarkup, "<img"), 1, "hero renders once");
assert.match(threeColumnMarkup, /width="1234"/);
assert.match(threeColumnMarkup, /height="567"/);

const fourColumnMarkup = render(houseBody([{ ...comparison, columns: [...comparison.columns, { key: "energy", label: "Energy" }], rows: [{ subject: "Model A", cells: ["6 qt", "Timer", "A"] }], stickyFirstColumn: false }]));
assert.ok(fourColumnMarkup.includes("Energy"));
assert.ok(!fourColumnMarkup.includes("house-article-comparison--sticky-first-column"));

const textOnlyMarkup = render(houseBody([{ kind: "TEXT", id: "intro", heading: "Introduction", paragraphs: ["Text-only article."] }], []));
assert.ok(textOnlyMarkup.includes("Text-only article."));
assert.ok(!textOnlyMarkup.includes("house-article-guide-nav"));
assert.equal(occurrences(textOnlyMarkup, affiliateDisclosure), 1, "empty-guide primary disclosure renders once");
assert.equal(occurrences(textOnlyMarkup, "Editorial independence:"), 1, "empty-guide independence disclosure renders once");
assert.ok(textOnlyMarkup.indexOf("Text-only article.") < textOnlyMarkup.indexOf("Editorial independence:"));

const groupedMarkup = render(houseBody([{ kind: "TEXT", id: "guidance", heading: "What to check", subsections: [{ heading: "Capacity", paragraphs: ["First guidance paragraph."] }, { heading: "Timing", paragraphs: ["Second guidance paragraph."] }] }], [{ targetId: "guidance", label: "What to check" }]));
assert.ok(groupedMarkup.includes('href="#guidance"'));
assert.match(groupedMarkup, /<section id="guidance"><h2[^>]*>What to check<\/h2><div><h3[^>]*>Capacity<\/h3><p>First guidance paragraph.<\/p><\/div><div><h3[^>]*>Timing<\/h3><p>Second guidance paragraph.<\/p>/);
assert.ok(groupedMarkup.indexOf("First guidance paragraph.") < groupedMarkup.indexOf("Second guidance paragraph."));
assert.doesNotMatch(groupedMarkup, /<p><p>/);

assert.ok(renderToStaticMarkup(SlowCookerPreview()).includes("Slow cookers compared"), "A001 preview remains compatible");
assert.ok(renderToStaticMarkup(ClothesDryerPreview()).includes("Clothes dryer compared"), "A002 preview remains compatible");

console.log("House article rendering tests passed.");
})().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "House article rendering tests failed.");
  process.exitCode = 1;
});
