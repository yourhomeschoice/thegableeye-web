import assert from "node:assert/strict";

import {
  requireValidPublicationCandidate,
} from "./publication-candidate.ts";

const basePayload = {
  publicationStatus: "PUBLISHED",
  path: "/travel/test/create-publication",
  slug: "create-publication",
  category: "Travel",
  subcategory: "Test",
  articleType: "Comparison / Recommendation Guide",
  title: "Test publication",
  standfirst: "Test standfirst.",
  author: "The Gable",
  lastResearched: "2026-10-05",
  articleBody: {
    format: "MARKDOWN",
    content: "## Test body\n\nTest content.",
  },
};

const createCandidate = {
  kind: "PUBLICATION_CANDIDATE",
  version: 2,
  articleKey: "travel-test-create-publication",
  proposalType: "CREATE",
  expectedCurrentVersion: 0,
  proposedVersion: 1,
  path: "/travel/test/create-publication",
  authority: {
    publicationStatus: "AUTHORISED",
  },
  payload: basePayload,
};

const validatedCreate =
  requireValidPublicationCandidate(createCandidate);

assert.equal(validatedCreate.version, 2);
assert.equal(validatedCreate.proposalType, "CREATE");
assert.equal(validatedCreate.expectedCurrentVersion, 0);
assert.equal(validatedCreate.proposedVersion, 1);

assert.throws(
  () =>
    requireValidPublicationCandidate({
      ...createCandidate,
      expectedCurrentVersion: 1,
    }),
  /CREATE must use expectedCurrentVersion 0 and proposedVersion 1/,
);

assert.throws(
  () =>
    requireValidPublicationCandidate({
      ...createCandidate,
      proposedVersion: 2,
    }),
  /CREATE must use expectedCurrentVersion 0 and proposedVersion 1/,
);

assert.throws(
  () =>
    requireValidPublicationCandidate({
      ...createCandidate,
      version: 1,
    }),
  /v1 proposalType must be REPLACE/,
);

const replaceV1 = requireValidPublicationCandidate({
  ...createCandidate,
  version: 1,
  proposalType: "REPLACE",
  expectedCurrentVersion: 1,
  proposedVersion: 2,
});

assert.equal(replaceV1.version, 1);
assert.equal(replaceV1.proposalType, "REPLACE");

const replaceV2 = requireValidPublicationCandidate({
  ...createCandidate,
  version: 2,
  proposalType: "REPLACE",
  expectedCurrentVersion: 2,
  proposedVersion: 3,
});

assert.equal(replaceV2.version, 2);
assert.equal(replaceV2.proposalType, "REPLACE");

assert.throws(
  () =>
    requireValidPublicationCandidate({
      ...createCandidate,
      path: "/different/path",
    }),
  /path must match payload path/,
);

console.log("Publication candidate v2 checks passed.");