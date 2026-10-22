import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  buildApprovedBaselinePublicationCandidate,
  type ApprovedEditorialBaseline,
  type ApprovedEditorialBaselineSource,
} from "../lib/publication/approved-baseline-candidate.ts";
import { validatePublicationArticle } from "../lib/publication/validation.ts";

const html = "<h1>Approved title</h1><p>Approved body.</p>";
const hash = createHash("sha256").update(html, "utf8").digest("hex");
const baseline: ApprovedEditorialBaseline = {
  baselineKey: "fixture-baseline",
  articleKey: "fixture-article",
  publicPath: "/travel/fixtures/fixture-article",
  title: "Approved title",
  editorialHtml: html,
  editorialBodySha256: hash,
  editorialApprovalStatus: "HUMAN_APPROVED",
  releaseStatus: "NOT_RELEASED",
  sourceFilename: "fixture.docx",
};

function source(rows: readonly ApprovedEditorialBaseline[]): ApprovedEditorialBaselineSource {
  return { async getByBaselineKey() { return rows; } };
}

const metadata = {
  category: "Travel",
  subcategory: "Fixtures",
  articleType: "Comparison / Recommendation Guide",
  standfirst: "A verified fixture publication.",
  author: "The Gable Eye Editorial",
  lastResearched: "2026-10-11",
};

const create = {
  baselineKey: baseline.baselineKey,
  metadata,
  authority: { publicationStatus: "AUTHORISED" as const },
  operation: { proposalType: "CREATE" as const, expectedCurrentVersion: 0 as const, proposedVersion: 1 as const },
};

const candidate = await buildApprovedBaselinePublicationCandidate(source([baseline]), create);
assert.equal(candidate.version, 2);
assert.equal(candidate.proposalType, "CREATE");
assert.equal(candidate.articleKey, baseline.articleKey);
assert.deepEqual(candidate.payload.editorialBaselineProvenance, {
  baselineKey: baseline.baselineKey,
  articleKey: baseline.articleKey,
  publicPath: baseline.publicPath,
  editorialBodySha256: hash,
  editorialApprovalStatus: "HUMAN_APPROVED",
  sourceFilename: "fixture.docx",
});

const unresolvedCollisionCandidate = await buildApprovedBaselinePublicationCandidate(
  source([{ ...baseline, articleKey: "japan-esims-compared", publicPath: "/travel/esims/japan-esims-compared" }]),
  { ...create, baselineKey: baseline.baselineKey },
);
assert.equal(unresolvedCollisionCandidate.proposalType, "CREATE", "the builder never converts a CREATE collision into a REPLACE");

await assert.rejects(
  buildApprovedBaselinePublicationCandidate(source([]), create),
  /not found/,
);
await assert.rejects(
  buildApprovedBaselinePublicationCandidate(source([baseline, baseline]), create),
  /ambiguous/,
);
await assert.rejects(
  buildApprovedBaselinePublicationCandidate(source([{ ...baseline, editorialBodySha256: "a".repeat(64) }]), create),
  /checksum/,
);
await assert.rejects(
  buildApprovedBaselinePublicationCandidate(source([{ ...baseline, editorialApprovalStatus: "PENDING_REVIEW" }]), create),
  /not HUMAN_APPROVED/,
);
await assert.rejects(
  buildApprovedBaselinePublicationCandidate(source([{ ...baseline, releaseStatus: "RELEASED" }]), create),
  /NOT_RELEASED/,
);
await assert.rejects(
  buildApprovedBaselinePublicationCandidate(source([baseline]), { ...create, metadata: { ...metadata, author: "" } }),
  /author must be a non-empty string/,
);
for (const field of ["articleBody", "title", "path", "editorialBaselineProvenance"]) {
  await assert.rejects(
    buildApprovedBaselinePublicationCandidate(source([baseline]), {
      ...create,
      metadata: { ...metadata, [field]: "attempted override" } as never,
    }),
    new RegExp("unsupported field: " + field),
  );
}
await assert.rejects(
  buildApprovedBaselinePublicationCandidate(source([baseline]), { ...create, authority: { publicationStatus: "UNAUTHORISED" } as never }),
  /must be AUTHORISED/,
);
await assert.rejects(
  buildApprovedBaselinePublicationCandidate(source([baseline]), { ...create, operation: { proposalType: "CREATE", expectedCurrentVersion: 1, proposedVersion: 1 } as never }),
  /CREATE must use/,
);
await assert.rejects(
  buildApprovedBaselinePublicationCandidate(source([baseline]), { ...create, operation: { proposalType: "REPLACE", expectedCurrentVersion: 2, proposedVersion: 2 } as never }),
  /versions are invalid/,
);

for (const [name, payload, pattern] of [
  ["provenance article mismatch", { ...candidate.payload, editorialBaselineProvenance: { ...candidate.payload.editorialBaselineProvenance!, articleKey: "other" } }, /articleKey must match/],
  ["provenance path mismatch", { ...candidate.payload, editorialBaselineProvenance: { ...candidate.payload.editorialBaselineProvenance!, publicPath: "/other" } }, /publicPath must match/],
  ["provenance hash mismatch", { ...candidate.payload, editorialBaselineProvenance: { ...candidate.payload.editorialBaselineProvenance!, editorialBodySha256: "b".repeat(64) } }, /must match articleBody HTML/],
] as const) {
  const result = validatePublicationArticle(payload);
  assert.equal(result.valid, false, name);
  if (!result.valid) assert.match(result.errors.join(" "), pattern);
}

const legacy = validatePublicationArticle({
  publicationStatus: "PUBLISHED", path: "/travel/legacy", slug: "legacy", category: "Travel", subcategory: "Legacy", articleType: "Guide", title: "Legacy", standfirst: "Legacy publication.", author: "The Gable", lastResearched: "2026-10-11", articleBody: { format: "HTML", content: "<h1>Legacy</h1>" },
});
assert.equal(legacy.valid, true, "existing payloads remain valid without provenance");

console.log("Approved-baseline publication candidate checks passed without database writes or publication actions.");
