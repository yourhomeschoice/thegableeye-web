import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { getLocalApprovedPackage, validateLocalApprovedPackage } from "../lib/launch-baseline/local-approved-package.ts";

const key = "coffee-espresso-machine-ebs-007-v1";
const hash = (value: string) => createHash("sha256").update(Buffer.from(value, "utf8")).digest("hex");
const tinyHtml = "<h1>Test</h1>";
const valid = () => ({ baseline_key: "fixture-package", article_key: "fixture-package", sha256: hash(tinyHtml), preview: { title: "Test", category: "Home", table_presentations: ["COMPARISON_TABLE"], trim_trailing_empty_cells: [0] }, tables: [[ ["Machine", "Price"], ["Example", "$1", ""] ]] });

assert.equal((await getLocalApprovedPackage(key))?.manifest.baseline_key, key, "valid EBS-007 package loads");
assert.equal(await getLocalApprovedPackage("missing-package"), undefined, "missing package returns no article");
assert.throws(() => validateLocalApprovedPackage("INVALID_KEY", tinyHtml, valid()), /identity/, "invalid baseline identity is rejected");
assert.throws(() => validateLocalApprovedPackage("fixture-package", `${tinyHtml}!`, valid()), /checksum/, "corrupted HTML is rejected");
assert.throws(() => validateLocalApprovedPackage("fixture-package", tinyHtml, { ...valid(), preview: {} }), /preview metadata/, "malformed preview metadata is rejected");
assert.throws(() => validateLocalApprovedPackage("fixture-package", tinyHtml, { ...valid(), preview: { ...valid().preview, trim_trailing_empty_cells: [] }, tables: [[ ["Machine", "Price"], ["Example"] ]] }), /table dimensions/, "invalid table dimensions are rejected");
assert.throws(() => validateLocalApprovedPackage("fixture-package", tinyHtml, { ...valid(), tables: [[ ["Machine", "Price"], ["Example", "$1", "not empty"] ]] }), /structural cell/, "unapproved trailing content is rejected");
assert.equal(validateLocalApprovedPackage("fixture-package", tinyHtml, valid()).tables[0][1][1], "$1", "approved structural trim preserves meaningful values");
const route = await readFile("app/development-preview/[baselineKey]/page.tsx", "utf8");
assert.ok(route.indexOf('process.env.NODE_ENV !== "development"') < route.lastIndexOf("getLocalApprovedPackage"), "production guard denies access before package loading");
console.log("Local approved package regression tests passed (9 assertions).");
