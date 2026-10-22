import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  assertAppendOnlyReviewHistory,
  reportEditorialReviews,
  validateEditorialReviewRegister,
} from "../lib/editorial-review/review-register.ts";

void (async () => {
const eventId = "11111111-1111-4111-8111-111111111111";
const proposalId = "22222222-2222-4222-8222-222222222222";

const noChangeEvent = {
  eventId,
  articleKey: "travel-fixture",
  eventType: "REVIEW_COMPLETED_NO_MATERIAL_CHANGE",
  eventDate: "2026-10-01",
  note: "Reviewed current supplier terms; no material change found.",
  evidenceReferences: [{ kind: "source-url", reference: "https://example.test/terms" }],
};

const register = validateEditorialReviewRegister({
  schemaVersion: 1,
  articles: [
    {
      articleKey: "travel-fixture",
      reviewGroup: "connectivity",
      reviewPolicy: "high-volatility",
      nextReviewDue: "2026-10-20",
      events: [noChangeEvent],
    },
    {
      articleKey: "tech-fixture",
      reviewGroup: "consumer-technology",
      nextReviewDue: "2026-10-28",
      events: [
        {
          eventId: "33333333-3333-4333-8333-333333333333",
          articleKey: "tech-fixture",
          eventType: "CHANGE_DETECTED_REQUIRES_INVESTIGATION",
          eventDate: "2026-10-02",
          note: "Manufacturer specification changed; investigation required.",
        },
      ],
    },
    {
      articleKey: "home-fixture",
      reviewGroup: "durable-home-products",
      nextReviewDue: "2026-10-29",
      events: [],
    },
  ],
});

assert.equal(register.articles[0].events[0].eventType, "REVIEW_COMPLETED_NO_MATERIAL_CHANGE");
assert.equal("proposedVersion" in register.articles[0].events[0], false, "no-change review creates no publication-version reference");

const report = reportEditorialReviews(register, "2026-10-21", 7);
assert.equal(report[0].dueState, "OVERDUE");
assert.equal(report[1].dueState, "DUE_SOON");
assert.equal(report[2].dueState, "NOT_DUE");
assert.equal(report[1].outstandingStatus, "INVESTIGATION_REQUIRED");
assert.equal(report[0].lastCompletedReview?.eventDate, "2026-10-01", "latest completed review is derived from events");

const amended = validateEditorialReviewRegister({
  schemaVersion: 1,
  articles: [{
    articleKey: "travel-fixture",
    reviewGroup: "connectivity",
    nextReviewDue: "2026-11-20",
    events: [
      noChangeEvent,
      {
        eventId: "44444444-4444-4444-8444-444444444444",
        articleKey: "travel-fixture",
        eventType: "AMENDMENT_PROPOSED",
        eventDate: "2026-10-02",
        note: "Prepared an amendment after evidence review.",
        proposalId,
        expectedCurrentVersion: 2,
        proposedVersion: 3,
      },
      {
        eventId: "55555555-5555-4555-8555-555555555555",
        articleKey: "travel-fixture",
        eventType: "AMENDMENT_PUBLISHED",
        eventDate: "2026-10-03",
        note: "Approved proposal published through the existing publication workflow.",
        proposalId,
        publishedVersion: 3,
      },
    ],
  }],
});
assert.equal(reportEditorialReviews(amended, "2026-10-21", 1)[0].outstandingStatus, undefined);

assert.doesNotThrow(() => assertAppendOnlyReviewHistory(
  validateEditorialReviewRegister({ schemaVersion: 1, articles: [register.articles[0]] }),
  amended,
));
assert.throws(
  () => assertAppendOnlyReviewHistory(amended, validateEditorialReviewRegister({ schemaVersion: 1, articles: [register.articles[0]] })),
  /cannot be removed/,
);
assert.throws(
  () => assertAppendOnlyReviewHistory(
    validateEditorialReviewRegister({ schemaVersion: 1, articles: [register.articles[0]] }),
    validateEditorialReviewRegister({
      schemaVersion: 1,
      articles: [{ ...register.articles[0], events: [{ ...noChangeEvent, note: "Changed historical note." }] }],
    }),
  ),
  /cannot be changed/,
);

for (const [name, value, pattern] of [
  ["malformed article key", { schemaVersion: 1, articles: [{ ...register.articles[0], articleKey: "Travel Fixture" }] }, /article_key/],
  ["malformed date", { schemaVersion: 1, articles: [{ ...register.articles[0], nextReviewDue: "2026-02-30" }] }, /real calendar date/],
  ["duplicate event id", { schemaVersion: 1, articles: [{ ...register.articles[0], events: [noChangeEvent, { ...noChangeEvent, eventDate: "2026-10-02" }] }] }, /duplicate eventId/],
  ["missing amendment references", { schemaVersion: 1, articles: [{ ...register.articles[0], events: [{ ...noChangeEvent, eventType: "AMENDMENT_PROPOSED" }] }] }, /unsupported field|proposalId/],
  ["review date ordering", { schemaVersion: 1, articles: [{ ...register.articles[0], events: [{ ...noChangeEvent, eventDate: "2026-10-02" }, { ...noChangeEvent, eventId: "66666666-6666-4666-8666-666666666666", eventDate: "2026-10-01" }] }] }, /ordered by eventDate/],
  ["no-change publication version", { schemaVersion: 1, articles: [{ ...register.articles[0], events: [{ ...noChangeEvent, proposedVersion: 2 }] }] }, /unsupported field/],
] as const) {
  assert.throws(() => validateEditorialReviewRegister(value), pattern, name);
}

assert.deepEqual(validateEditorialReviewRegister({ schemaVersion: 1, articles: [] }).articles, [], "empty registers are valid");
assert.deepEqual(reportEditorialReviews(validateEditorialReviewRegister({ schemaVersion: 1, articles: [] }), "2026-10-21", 14), [], "empty registers report no due articles");

const liveRegister = validateEditorialReviewRegister(JSON.parse(await readFile("editorial-review/review-register.json", "utf8")) as unknown);
assert.deepEqual(liveRegister.articles, [], "the live register remains intentionally empty");

console.log("Editorial review register validation and reporting checks passed.");
})().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Editorial review register tests failed.");
  process.exitCode = 1;
});
