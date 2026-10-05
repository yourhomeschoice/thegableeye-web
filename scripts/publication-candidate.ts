import { loadPublicationArtifact } from "./publication-artifact.ts";
import { requireValidPublicationArticle } from "../lib/publication/validation.ts";
import type { RecommendationComparisonArticle } from "../lib/publication/types.ts";
import { requireAudienceReadyPublicationArticle } from "../lib/publication/readiness.ts";

export type PublicationCandidate = {
  kind: "PUBLICATION_CANDIDATE";
  version: 1;
  articleKey: string;
  proposalType: "REPLACE";
  expectedCurrentVersion: number;
  proposedVersion: number;
  path: string;
  authority: { publicationStatus: "AUTHORISED" };
  payload: RecommendationComparisonArticle;
};

function positiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function requireValidPublicationCandidate(value: unknown): PublicationCandidate {
  if (!isObject(value) || value.kind !== "PUBLICATION_CANDIDATE" || value.version !== 1) throw new Error("Invalid publication candidate identity.");
  if (typeof value.articleKey !== "string" || !value.articleKey.trim()) throw new Error("Publication candidate articleKey must be non-empty.");
  if (value.proposalType !== "REPLACE") throw new Error("Publication candidate proposalType must be REPLACE.");
  if (!positiveInteger(value.expectedCurrentVersion) || !positiveInteger(value.proposedVersion) || value.proposedVersion <= value.expectedCurrentVersion) throw new Error("Publication candidate versions are invalid.");
  if (typeof value.path !== "string" || !value.path.startsWith("/")) throw new Error("Publication candidate path must be absolute.");
  if (!isObject(value.authority) || value.authority.publicationStatus !== "AUTHORISED") throw new Error("Publication candidate must be AUTHORISED.");
  const payload = requireAudienceReadyPublicationArticle(
  requireValidPublicationArticle(value.payload),
);
  if (value.path !== payload.path) throw new Error("Publication candidate path must match payload path.");
  return { kind: "PUBLICATION_CANDIDATE", version: 1, articleKey: value.articleKey, proposalType: "REPLACE", expectedCurrentVersion: value.expectedCurrentVersion, proposedVersion: value.proposedVersion, path: value.path, authority: { publicationStatus: "AUTHORISED" }, payload };
}

export async function loadPublicationCandidate(candidateFile: string): Promise<PublicationCandidate> {
  return requireValidPublicationCandidate(await loadPublicationArtifact(candidateFile));
}
