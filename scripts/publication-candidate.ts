import { loadPublicationArtifact } from "./publication-artifact.ts";
import { requireValidPublicationArticle } from "../lib/publication/validation.ts";
import type { RecommendationComparisonArticle } from "../lib/publication/types.ts";
import { requireAudienceReadyPublicationArticle } from "../lib/publication/readiness.ts";

type PublicationCandidateCommon = {
  kind: "PUBLICATION_CANDIDATE";
  articleKey: string;
  path: string;
  authority: { publicationStatus: "AUTHORISED" };
  payload: RecommendationComparisonArticle;
};

export type PublicationCandidateV1 = PublicationCandidateCommon & {
  version: 1;
  proposalType: "REPLACE";
  expectedCurrentVersion: number;
  proposedVersion: number;
};

export type PublicationCandidateV2Create = PublicationCandidateCommon & {
  version: 2;
  proposalType: "CREATE";
  expectedCurrentVersion: 0;
  proposedVersion: 1;
};

export type PublicationCandidateV2Replace = PublicationCandidateCommon & {
  version: 2;
  proposalType: "REPLACE";
  expectedCurrentVersion: number;
  proposedVersion: number;
};

export type PublicationCandidate =
  | PublicationCandidateV1
  | PublicationCandidateV2Create
  | PublicationCandidateV2Replace;

function positiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function requireValidPublicationCandidate(
  value: unknown,
): PublicationCandidate {
  if (
    !isObject(value) ||
    value.kind !== "PUBLICATION_CANDIDATE" ||
    (value.version !== 1 && value.version !== 2)
  ) {
    throw new Error("Invalid publication candidate identity.");
  }

  if (typeof value.articleKey !== "string" || !value.articleKey.trim()) {
    throw new Error("Publication candidate articleKey must be non-empty.");
  }

  if (typeof value.path !== "string" || !value.path.startsWith("/")) {
    throw new Error("Publication candidate path must be absolute.");
  }

  if (
    !isObject(value.authority) ||
    value.authority.publicationStatus !== "AUTHORISED"
  ) {
    throw new Error("Publication candidate must be AUTHORISED.");
  }

  if (value.version === 1) {
    if (value.proposalType !== "REPLACE") {
      throw new Error("Publication candidate v1 proposalType must be REPLACE.");
    }

    if (
      !positiveInteger(value.expectedCurrentVersion) ||
      !positiveInteger(value.proposedVersion) ||
      value.proposedVersion <= value.expectedCurrentVersion
    ) {
      throw new Error("Publication candidate v1 versions are invalid.");
    }
  } else if (value.proposalType === "CREATE") {
    if (
      value.expectedCurrentVersion !== 0 ||
      value.proposedVersion !== 1
    ) {
      throw new Error(
        "Publication candidate CREATE must use expectedCurrentVersion 0 and proposedVersion 1.",
      );
    }
  } else if (value.proposalType === "REPLACE") {
    if (
      !positiveInteger(value.expectedCurrentVersion) ||
      !positiveInteger(value.proposedVersion) ||
      value.proposedVersion <= value.expectedCurrentVersion
    ) {
      throw new Error("Publication candidate v2 REPLACE versions are invalid.");
    }
  } else {
    throw new Error(
      "Publication candidate v2 proposalType must be CREATE or REPLACE.",
    );
  }

  const payload = requireAudienceReadyPublicationArticle(
    requireValidPublicationArticle(value.payload),
  );

  if (value.path !== payload.path) {
    throw new Error("Publication candidate path must match payload path.");
  }

  return {
    kind: "PUBLICATION_CANDIDATE",
    version: value.version,
    articleKey: value.articleKey,
    proposalType: value.proposalType,
    expectedCurrentVersion: value.expectedCurrentVersion,
    proposedVersion: value.proposedVersion,
    path: value.path,
    authority: { publicationStatus: "AUTHORISED" },
    payload,
  } as PublicationCandidate;
}

export async function loadPublicationCandidate(
  candidateFile: string,
): Promise<PublicationCandidate> {
  return requireValidPublicationCandidate(
    await loadPublicationArtifact(candidateFile),
  );
}