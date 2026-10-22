export const REVIEW_REGISTER_SCHEMA_VERSION = 1 as const;

export const reviewEventTypes = [
  "REVIEW_COMPLETED_NO_MATERIAL_CHANGE",
  "CHANGE_DETECTED_REQUIRES_INVESTIGATION",
  "REVIEW_UNABLE_TO_COMPLETE",
  "AMENDMENT_PROPOSED",
  "AMENDMENT_PUBLISHED",
] as const;
export type ReviewEventType = (typeof reviewEventTypes)[number];

export type EvidenceReference = Readonly<{
  kind: string;
  reference: string;
}>;

type ReviewEventCommon = Readonly<{
  eventId: string;
  articleKey: string;
  eventType: ReviewEventType;
  eventDate: string;
  note: string;
  evidenceReferences?: readonly EvidenceReference[];
}>;

export type ReviewEvent =
  | (ReviewEventCommon & Readonly<{ eventType: "REVIEW_COMPLETED_NO_MATERIAL_CHANGE" | "CHANGE_DETECTED_REQUIRES_INVESTIGATION" | "REVIEW_UNABLE_TO_COMPLETE" }> )
  | (ReviewEventCommon & Readonly<{ eventType: "AMENDMENT_PROPOSED"; proposalId: string; expectedCurrentVersion: number; proposedVersion: number }> )
  | (ReviewEventCommon & Readonly<{ eventType: "AMENDMENT_PUBLISHED"; proposalId: string; publishedVersion: number }>);

export type ArticleReviewRecord = Readonly<{
  articleKey: string;
  reviewGroup: string;
  nextReviewDue: string;
  reviewPolicy?: string;
  events: readonly ReviewEvent[];
}>;

export type EditorialReviewRegister = Readonly<{
  schemaVersion: typeof REVIEW_REGISTER_SCHEMA_VERSION;
  articles: readonly ArticleReviewRecord[];
}>;

export type ReviewReportRow = Readonly<{
  articleKey: string;
  reviewGroup: string;
  lastCompletedReview?: ReviewEvent;
  nextReviewDue: string;
  dueState: "OVERDUE" | "DUE_SOON" | "NOT_DUE";
  outstandingStatus?: "INVESTIGATION_REQUIRED" | "REVIEW_UNABLE_TO_COMPLETE" | "AMENDMENT_PROPOSED";
}>;

const articleKeyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireText(value: unknown, field: string, maximumLength = 500): string {
  if (typeof value !== "string" || value.trim() === "" || value.length > maximumLength) {
    throw new Error(field + " must be a non-empty string of at most " + maximumLength + " characters.");
  }
  return value;
}

function requireDate(value: unknown, field: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(field + " must use YYYY-MM-DD.");
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(field + " must be a real calendar date.");
  }
  return value;
}

function requireArticleKey(value: unknown, field: string): string {
  if (typeof value !== "string" || !articleKeyPattern.test(value)) {
    throw new Error(field + " must be a permanent article_key.");
  }
  return value;
}

function requireExactKeys(value: Record<string, unknown>, supported: readonly string[], field: string) {
  for (const key of Object.keys(value)) {
    if (!supported.includes(key)) throw new Error(field + " contains unsupported field " + key + ".");
  }
}

function parseEvidenceReferences(value: unknown): readonly EvidenceReference[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error("evidenceReferences must be an array.");
  return value.map((reference, index) => {
    if (!isObject(reference)) throw new Error("evidenceReferences[" + index + "] must be an object.");
    requireExactKeys(reference, ["kind", "reference"], "evidenceReferences[" + index + "]");
    return {
      kind: requireText(reference.kind, "evidenceReferences[" + index + "].kind", 80),
      reference: requireText(reference.reference, "evidenceReferences[" + index + "].reference", 1000),
    };
  });
}

function parseEvent(value: unknown, index: number): ReviewEvent {
  if (!isObject(value)) throw new Error("events[" + index + "] must be an object.");
  const eventType = value.eventType;
  if (!reviewEventTypes.includes(eventType as ReviewEventType)) {
    throw new Error("events[" + index + "].eventType is invalid.");
  }
  const amendment = eventType === "AMENDMENT_PROPOSED" || eventType === "AMENDMENT_PUBLISHED";
  requireExactKeys(
    value,
    amendment
      ? eventType === "AMENDMENT_PROPOSED"
        ? ["eventId", "articleKey", "eventType", "eventDate", "note", "evidenceReferences", "proposalId", "expectedCurrentVersion", "proposedVersion"]
        : ["eventId", "articleKey", "eventType", "eventDate", "note", "evidenceReferences", "proposalId", "publishedVersion"]
      : ["eventId", "articleKey", "eventType", "eventDate", "note", "evidenceReferences"],
    "events[" + index + "]",
  );
  const eventId = requireText(value.eventId, "events[" + index + "].eventId", 36);
  if (!uuidPattern.test(eventId)) throw new Error("events[" + index + "].eventId must be a UUID.");
  const common = {
    eventId,
    articleKey: requireArticleKey(value.articleKey, "events[" + index + "].articleKey"),
    eventType,
    eventDate: requireDate(value.eventDate, "events[" + index + "].eventDate"),
    note: requireText(value.note, "events[" + index + "].note"),
    ...(parseEvidenceReferences(value.evidenceReferences) ? { evidenceReferences: parseEvidenceReferences(value.evidenceReferences) } : {}),
  } as const;
  if (eventType === "AMENDMENT_PROPOSED") {
    const proposalId = requireText(value.proposalId, "events[" + index + "].proposalId", 36);
    if (!uuidPattern.test(proposalId)) throw new Error("events[" + index + "].proposalId must be a UUID.");
    if (!Number.isInteger(value.expectedCurrentVersion) || (value.expectedCurrentVersion as number) < 1 || !Number.isInteger(value.proposedVersion) || (value.proposedVersion as number) <= (value.expectedCurrentVersion as number)) {
      throw new Error("events[" + index + "] amendment proposal versions are invalid.");
    }
    return { ...common, eventType, proposalId, expectedCurrentVersion: value.expectedCurrentVersion as number, proposedVersion: value.proposedVersion as number };
  }
  if (eventType === "AMENDMENT_PUBLISHED") {
    const proposalId = requireText(value.proposalId, "events[" + index + "].proposalId", 36);
    if (!uuidPattern.test(proposalId) || !Number.isInteger(value.publishedVersion) || (value.publishedVersion as number) < 1) {
      throw new Error("events[" + index + "] amendment publication references are invalid.");
    }
    return { ...common, eventType, proposalId, publishedVersion: value.publishedVersion as number };
  }
  return { ...common, eventType } as ReviewEvent;
}

export function validateEditorialReviewRegister(value: unknown): EditorialReviewRegister {
  if (!isObject(value)) throw new Error("review register must be an object.");
  requireExactKeys(value, ["schemaVersion", "articles"], "review register");
  if (value.schemaVersion !== REVIEW_REGISTER_SCHEMA_VERSION) throw new Error("review register schemaVersion is unsupported.");
  if (!Array.isArray(value.articles)) throw new Error("review register articles must be an array.");

  const articleKeys = new Set<string>();
  const eventIds = new Set<string>();
  const articles = value.articles.map((entry, articleIndex) => {
    if (!isObject(entry)) throw new Error("articles[" + articleIndex + "] must be an object.");
    requireExactKeys(entry, ["articleKey", "reviewGroup", "nextReviewDue", "reviewPolicy", "events"], "articles[" + articleIndex + "]");
    const articleKey = requireArticleKey(entry.articleKey, "articles[" + articleIndex + "].articleKey");
    if (articleKeys.has(articleKey)) throw new Error("review register contains duplicate articleKey " + articleKey + ".");
    articleKeys.add(articleKey);
    if (!Array.isArray(entry.events)) throw new Error("articles[" + articleIndex + "].events must be an array.");
    let previousDate = "";
    const proposedVersions = new Map<string, number>();
    const events = entry.events.map((event, eventIndex) => {
      const parsed = parseEvent(event, eventIndex);
      if (parsed.articleKey !== articleKey) throw new Error("events[" + eventIndex + "].articleKey must match its article record.");
      if (eventIds.has(parsed.eventId)) throw new Error("review register contains duplicate eventId " + parsed.eventId + ".");
      eventIds.add(parsed.eventId);
      if (parsed.eventDate < previousDate) throw new Error("articles[" + articleIndex + "] events must be ordered by eventDate.");
      previousDate = parsed.eventDate;
      if (parsed.eventType === "AMENDMENT_PROPOSED") proposedVersions.set(parsed.proposalId, parsed.proposedVersion);
      if (parsed.eventType === "AMENDMENT_PUBLISHED" && proposedVersions.get(parsed.proposalId) !== parsed.publishedVersion) {
        throw new Error("events[" + eventIndex + "] must publish a prior matching amendment proposal.");
      }
      return parsed;
    });
    return {
      articleKey,
      reviewGroup: requireText(entry.reviewGroup, "articles[" + articleIndex + "].reviewGroup", 100),
      nextReviewDue: requireDate(entry.nextReviewDue, "articles[" + articleIndex + "].nextReviewDue"),
      ...(entry.reviewPolicy === undefined ? {} : { reviewPolicy: requireText(entry.reviewPolicy, "articles[" + articleIndex + "].reviewPolicy", 100) }),
      events,
    };
  });
  return { schemaVersion: REVIEW_REGISTER_SCHEMA_VERSION, articles };
}

export function assertAppendOnlyReviewHistory(
  previous: EditorialReviewRegister,
  next: EditorialReviewRegister,
) {
  const nextByKey = new Map(next.articles.map((article) => [article.articleKey, article]));
  for (const previousArticle of previous.articles) {
    const nextArticle = nextByKey.get(previousArticle.articleKey);
    if (!nextArticle) throw new Error("existing review article records cannot be removed.");
    if (nextArticle.events.length < previousArticle.events.length) throw new Error("review events cannot be removed.");
    for (let index = 0; index < previousArticle.events.length; index += 1) {
      if (JSON.stringify(nextArticle.events[index]) !== JSON.stringify(previousArticle.events[index])) {
        throw new Error("existing review events cannot be changed or reordered.");
      }
    }
  }
}

function latestCompletedReview(events: readonly ReviewEvent[]): ReviewEvent | undefined {
  return [...events].reverse().find((event) =>
    event.eventType === "REVIEW_COMPLETED_NO_MATERIAL_CHANGE" || event.eventType === "CHANGE_DETECTED_REQUIRES_INVESTIGATION",
  );
}

function outstandingStatus(events: readonly ReviewEvent[]): ReviewReportRow["outstandingStatus"] {
  const proposed = new Set(events.filter((event): event is Extract<ReviewEvent, { eventType: "AMENDMENT_PROPOSED" }> => event.eventType === "AMENDMENT_PROPOSED").map((event) => event.proposalId));
  for (const event of events) {
    if (event.eventType === "AMENDMENT_PUBLISHED") proposed.delete(event.proposalId);
  }
  if (proposed.size) return "AMENDMENT_PROPOSED";
  const latest = events.at(-1);
  if (latest?.eventType === "CHANGE_DETECTED_REQUIRES_INVESTIGATION") return "INVESTIGATION_REQUIRED";
  if (latest?.eventType === "REVIEW_UNABLE_TO_COMPLETE") return "REVIEW_UNABLE_TO_COMPLETE";
  return undefined;
}

export function reportEditorialReviews(
  register: EditorialReviewRegister,
  currentDate: string,
  dueWithinDays: number,
): readonly ReviewReportRow[] {
  const today = requireDate(currentDate, "currentDate");
  if (!Number.isInteger(dueWithinDays) || dueWithinDays < 0) throw new Error("dueWithinDays must be a non-negative integer.");
  const dueLimit = new Date(Date.parse(today + "T00:00:00Z"));
  dueLimit.setUTCDate(dueLimit.getUTCDate() + dueWithinDays);
  const dueLimitText = dueLimit.toISOString().slice(0, 10);
  return register.articles.map((article) => {
    const dueState: ReviewReportRow["dueState"] = article.nextReviewDue < today
      ? "OVERDUE"
      : article.nextReviewDue <= dueLimitText
        ? "DUE_SOON"
        : "NOT_DUE";
    const status = outstandingStatus(article.events);
    return {
      articleKey: article.articleKey,
      reviewGroup: article.reviewGroup,
      lastCompletedReview: latestCompletedReview(article.events),
      nextReviewDue: article.nextReviewDue,
      dueState,
      ...(status ? { outstandingStatus: status } : {}),
    };
  }).sort((left, right) => left.nextReviewDue.localeCompare(right.nextReviewDue) || left.articleKey.localeCompare(right.articleKey));
}
