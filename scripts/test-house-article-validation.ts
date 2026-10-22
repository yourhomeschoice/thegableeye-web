import assert from "node:assert/strict";
import { validatePublicationArticle } from "../lib/publication/validation.ts";

const base = { publicationStatus: "PUBLISHED", path: "/home/test", slug: "test", category: "Home", subcategory: "Test", articleType: "Comparison", title: "Test", standfirst: "Test", author: "Editorial", lastResearched: "2026-10-22" };
const text = { kind: "TEXT", id: "intro", heading: "Introduction", paragraphs: ["Text"] };
const verdict = { kind: "VERDICT", id: "verdict", paragraphs: ["Verdict"] };
const comparison = { kind: "COMPARISON", id: "comparison", heading: "Comparison", columns: [{ key: "subject", label: "Model" }, { key: "price", label: "Price" }, { key: "size", label: "Size" }], rows: [{ subject: "One", cells: ["£100", "Large"] }], stickyFirstColumn: true };
const alternatives = { kind: "ALTERNATIVES", id: "alternatives", heading: "Alternatives", items: [{ heading: "Alternative", paragraphs: ["Text"] }] };

function body(sections: unknown[] = [text, verdict, comparison, alternatives], guide: unknown[] = [{ targetId: "verdict", label: "Our verdict" }]) {
  return { format: "HOUSE", presentation: { guide, sections } };
}

function article(articleBody: unknown) { return { ...base, articleBody }; }
function expectValid(value: unknown) { assert.equal(validatePublicationArticle(value).valid, true); }
function expectInvalid(value: unknown, expectedError: string) {
  const result = validatePublicationArticle(value);
  assert.equal(result.valid, false);
  if (result.valid) assert.fail("Expected validation failure.");
  assert.ok(result.errors.some((error) => error.includes(expectedError)), `Expected error containing: ${expectedError}`);
}

// Valid three-column, four-column, and text-only House payloads.
expectValid(article(body()));
expectValid(article({ format: "HOUSE", presentation: { guide: [], sections: [{ ...comparison, columns: [...comparison.columns, { key: "energy", label: "Energy" }], rows: [{ subject: "One", cells: ["£100", "Large", "A"] }] }] } }));
expectValid(article({ format: "HOUSE", presentation: { guide: [], sections: [text] } }));
expectValid(article({ format: "HOUSE", presentation: { guide: [{ targetId: "guidance", label: "What to check" }], sections: [{ kind: "TEXT", id: "guidance", heading: "What to check", subsections: [{ heading: "Capacity", paragraphs: ["First."] }, { heading: "Timing", paragraphs: ["Second."] }] }] } }));
expectValid(article({ format: "HOUSE", presentation: { guide: [], sections: [{ kind: "TEXT", id: "both", heading: "Both", paragraphs: ["Parent."], subsections: [{ heading: "Child", paragraphs: ["Child."] }] }] } }));

expectInvalid(article(body([{ ...text }, { ...text }])), "id is duplicated");
expectInvalid(article(body([{ ...text, id: "invalid id" }])), "id is malformed");
expectInvalid(article(body(undefined, [{ targetId: "missing", label: "Missing" }])), "targetId is missing or duplicated");
expectInvalid(article(body(undefined, [{ targetId: "verdict", label: "One" }, { targetId: "verdict", label: "Two" }])), "targetId is missing or duplicated");
expectInvalid(article(body([{ ...comparison, columns: [{ key: "subject", label: "Model" }, { key: "subject", label: "Price" }] }])), "duplicate keys");
expectInvalid(article(body([{ ...comparison, columns: [{ key: "subject", label: "Model" }, { key: "price", label: "Model" }] }])), "duplicate labels");
expectInvalid(article(body([{ ...comparison, rows: [{ subject: "One", cells: ["£100"] }] }])), "cells must align with columns");
expectInvalid(article(body([{ ...comparison, rows: [{ subject: "One", cells: ["£100", "Large"] }, { subject: "One", cells: ["£120", "Small"] }] }])), "duplicate subjects");
expectInvalid(article(body([{ ...alternatives, items: [{ heading: "Same", paragraphs: ["One"] }, { heading: "Same", paragraphs: ["Two"] }] }])), "duplicate headings");
expectInvalid(article(body([verdict, { ...verdict, id: "second-verdict" }])), "at most one verdict");
expectInvalid(article(body([{ ...text, id: "method-one", role: "METHODOLOGY" }, { ...text, id: "method-two", role: "METHODOLOGY" }])), "at most one methodology");
expectInvalid(article({ ...body(), extra: true }), "articleBody contains unsupported field extra");
expectInvalid(article(body([{ kind: "UNSUPPORTED", id: "other" }])), "kind is unsupported");
expectInvalid(article(body([{ ...text, heading: " ", paragraphs: [" "] }])), "heading must be a non-empty string");
expectInvalid(article(body([{ ...text, id: `a${"a".repeat(80)}` }])), "id must be a non-empty string within the permitted length");
expectInvalid(article(body([{ ...comparison, stickyFirstColumn: "yes" }])), "stickyFirstColumn must be boolean");
expectInvalid(article(body([{ kind: "TEXT", id: "empty", heading: "Empty" }])), "must contain paragraphs or subsections");
expectInvalid(article(body([{ kind: "TEXT", id: "grouped", heading: "Grouped", subsections: [{ heading: " ", paragraphs: [] }] }])), "heading must be a non-empty string");
expectInvalid(article(body([{ kind: "TEXT", id: "unknown", heading: "Grouped", subsections: [{ heading: "Child", paragraphs: ["Text"], extra: true }] }])), "contains unsupported field extra");
expectInvalid(article(body([{ kind: "TEXT", id: "nested", heading: "Grouped", subsections: [{ heading: "Child", paragraphs: ["Text"], subsections: [] }] }])), "contains unsupported field subsections");

// Existing formats remain valid.
expectValid(article({ format: "MARKDOWN", content: "# Test" }));

console.log("House article validation tests passed.");
