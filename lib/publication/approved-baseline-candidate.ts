import { createHash } from "node:crypto";
import {
  requireValidPublicationCandidate,
  type PublicationCandidate,
} from "../../scripts/publication-candidate.ts";
import type {
  EditorialBaselineProvenance,
  PublicationImage,
  RecommendationComparisonArticle,
} from "./types.ts";
import { requireValidPublicationArticle } from "./validation.ts";

export type ApprovedEditorialBaseline = Readonly<{
  baselineKey: string;
  articleKey: string;
  publicPath: string;
  title: string;
  editorialHtml: string;
  editorialBodySha256: string;
  editorialApprovalStatus: string;
  releaseStatus: string;
  sourceFilename?: string;
}>;

export interface ApprovedEditorialBaselineSource {
  getByBaselineKey(baselineKey: string): Promise<readonly ApprovedEditorialBaseline[]>;
}

export type ApprovedBaselinePublicationMetadata = Readonly<{
  category: string;
  subcategory: string;
  articleType: string;
  standfirst: string;
  author: string;
  lastResearched: string;
  affiliateDisclosure?: string;
  image?: PublicationImage;
}>;

export type PublicationCandidateAuthority = Readonly<{
  publicationStatus: "AUTHORISED";
}>;

export type PublicationCandidateOperation =
  | Readonly<{
      proposalType: "CREATE";
      expectedCurrentVersion: 0;
      proposedVersion: 1;
    }>
  | Readonly<{
      proposalType: "REPLACE";
      expectedCurrentVersion: number;
      proposedVersion: number;
    }>;

export type BuildApprovedBaselinePublicationCandidateInput = Readonly<{
  baselineKey: string;
  metadata: ApprovedBaselinePublicationMetadata;
  authority: PublicationCandidateAuthority;
  operation: PublicationCandidateOperation;
}>;

function requireText(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(name + " must be a non-empty string.");
  }
  return value;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function selectPublicationMetadata(
  value: unknown,
): ApprovedBaselinePublicationMetadata {
  if (!isObject(value)) {
    throw new Error("publication metadata must be an object.");
  }

  const supportedKeys = new Set([
    "category",
    "subcategory",
    "articleType",
    "standfirst",
    "author",
    "lastResearched",
    "affiliateDisclosure",
    "image",
  ]);

  for (const key of Object.keys(value)) {
    if (!supportedKeys.has(key)) {
      throw new Error("publication metadata contains an unsupported field: " + key + ".");
    }
  }

  return {
    category: value.category as string,
    subcategory: value.subcategory as string,
    articleType: value.articleType as string,
    standfirst: value.standfirst as string,
    author: value.author as string,
    lastResearched: value.lastResearched as string,
    ...(value.affiliateDisclosure === undefined
      ? {}
      : { affiliateDisclosure: value.affiliateDisclosure as string }),
    ...(value.image === undefined
      ? {}
      : { image: value.image as PublicationImage }),
  };
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function slugFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const slug = segments.at(-1);
  if (!slug) throw new Error("Approved baseline publicPath must contain a slug.");
  return slug;
}

function requireApprovedBaseline(
  baselineKey: string,
  rows: readonly ApprovedEditorialBaseline[],
): ApprovedEditorialBaseline {
  requireText(baselineKey, "baselineKey");
  if (rows.length === 0) throw new Error("Approved baseline was not found.");
  if (rows.length !== 1) throw new Error("Approved baseline is ambiguous.");

  const baseline = rows[0];
  if (baseline.baselineKey !== baselineKey) {
    throw new Error("Approved baseline identity does not match the requested baselineKey.");
  }
  requireText(baseline.articleKey, "Approved baseline articleKey");
  requireText(baseline.publicPath, "Approved baseline publicPath");
  if (!baseline.publicPath.startsWith("/")) {
    throw new Error("Approved baseline publicPath must be absolute.");
  }
  requireText(baseline.title, "Approved baseline title");
  requireText(baseline.editorialHtml, "Approved baseline editorialHtml");
  if (baseline.editorialApprovalStatus !== "HUMAN_APPROVED") {
    throw new Error("Approved baseline is not HUMAN_APPROVED.");
  }
  if (baseline.releaseStatus !== "NOT_RELEASED") {
    throw new Error("Approved baseline releaseStatus must be NOT_RELEASED.");
  }
  if (!/^[a-f0-9]{64}$/.test(baseline.editorialBodySha256)) {
    throw new Error("Approved baseline editorialBodySha256 must be a lowercase SHA-256 hex digest.");
  }
  if (sha256(baseline.editorialHtml) !== baseline.editorialBodySha256) {
    throw new Error("Approved baseline editorial HTML checksum does not match.");
  }
  if (baseline.sourceFilename !== undefined) {
    requireText(baseline.sourceFilename, "Approved baseline sourceFilename");
  }
  return baseline;
}

export async function buildApprovedBaselinePublicationCandidate(
  source: ApprovedEditorialBaselineSource,
  input: BuildApprovedBaselinePublicationCandidateInput,
): Promise<PublicationCandidate> {
  const baselineKey = requireText(input.baselineKey, "baselineKey");
  const baseline = requireApprovedBaseline(
    baselineKey,
    await source.getByBaselineKey(baselineKey),
  );

  const provenance: EditorialBaselineProvenance = {
    baselineKey: baseline.baselineKey,
    articleKey: baseline.articleKey,
    publicPath: baseline.publicPath,
    editorialBodySha256: baseline.editorialBodySha256,
    editorialApprovalStatus: "HUMAN_APPROVED",
    ...(baseline.sourceFilename ? { sourceFilename: baseline.sourceFilename } : {}),
  };

  const metadata = selectPublicationMetadata(input.metadata);

  const article = requireValidPublicationArticle({
    publicationStatus: "PUBLISHED",
    path: baseline.publicPath as `/${string}`,
    slug: slugFromPath(baseline.publicPath),
    title: baseline.title,
    articleBody: { format: "HTML", content: baseline.editorialHtml },
    editorialBaselineProvenance: provenance,
    category: metadata.category,
    subcategory: metadata.subcategory,
    articleType: metadata.articleType,
    standfirst: metadata.standfirst,
    author: metadata.author,
    lastResearched: metadata.lastResearched,
    ...(metadata.affiliateDisclosure === undefined
      ? {}
      : { affiliateDisclosure: metadata.affiliateDisclosure }),
    ...(metadata.image === undefined ? {} : { image: metadata.image }),
  } satisfies RecommendationComparisonArticle);

  return requireValidPublicationCandidate({
    kind: "PUBLICATION_CANDIDATE",
    version: 2,
    articleKey: baseline.articleKey,
    path: baseline.publicPath,
    authority: input.authority,
    ...input.operation,
    payload: article,
  });
}
