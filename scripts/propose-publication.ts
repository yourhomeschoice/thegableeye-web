
import { loadEnvConfig } from "@next/env";
import { loadPublicationArtifact } from "./publication-artifact.ts";
import { loadPublicationCandidate } from "./publication-candidate.ts";
import { requireValidPublicationArticle } from "../lib/publication/validation.ts";

type PublicationRow = {
  article_key: unknown;
  version: unknown;
  path: unknown;
  publication_status: unknown;
};

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function requireEnvironment(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(name + " is required.");
  }

  return value;
}

function requirePositiveInteger(
  value: string | undefined,
  name: string,
): number {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    throw new Error(name + " must be a positive integer.");
  }

  return Number(value);
}

async function queryRows(
  url: string,
  key: string,
  table: string,
  filters: Record<string, string>,
) {
  const query = new URLSearchParams({
    select: "*",
    ...filters,
  });

  const response = await fetch(
    url.replace(/\/$/, "") +
      "/rest/v1/" +
      table +
      "?" +
      query.toString(),
    {
      headers: {
        Accept: "application/json",
        apikey: key,
        Authorization: "Bearer " + key,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      "Publication proposal preflight request failed with status " +
        response.status +
        ".",
    );
  }

  const rows: unknown = await response.json();

  if (!Array.isArray(rows)) {
    throw new Error(
      "Publication proposal preflight returned an invalid response.",
    );
  }

  return rows;
}

async function main() {
  loadEnvConfig(process.cwd());

  const artifactFile = argument("--artifact-file");
  const candidateFile = argument("--candidate-file");

  let articleKey = argument("--article-key");
  let proposalType: "CREATE" | "REPLACE" = "REPLACE";
  let expectedCurrentVersion: number;
  let proposedVersion: number;

  const dryRun = process.argv.includes("--dry-run");

  if (Boolean(artifactFile) === Boolean(candidateFile)) {
    throw new Error(
      "Usage: --candidate-file <path> [--dry-run] or --artifact-file <path> --article-key <key> --expected-current-version <number> --proposed-version <number> [--dry-run]",
    );
  }

  const url = requireEnvironment("SUPABASE_URL");
  const serviceRoleKey = requireEnvironment(
    "SUPABASE_SERVICE_ROLE_KEY",
  );

  let article;

  if (candidateFile) {
    const candidate = await loadPublicationCandidate(candidateFile);

    articleKey = candidate.articleKey;
    proposalType = candidate.proposalType;
    expectedCurrentVersion = candidate.expectedCurrentVersion;
    proposedVersion = candidate.proposedVersion;
    article = candidate.payload;
  } else {
    if (!articleKey) {
      throw new Error("article_key must be non-empty.");
    }

    expectedCurrentVersion = requirePositiveInteger(
      argument("--expected-current-version"),
      "expected current version",
    );

    proposedVersion = requirePositiveInteger(
      argument("--proposed-version"),
      "proposed version",
    );

    if (proposedVersion <= expectedCurrentVersion) {
      throw new Error(
        "proposed version must be greater than expected current version.",
      );
    }

    article = requireValidPublicationArticle(
      await loadPublicationArtifact(artifactFile!),
    );

    proposalType = "REPLACE";
  }

  if (!articleKey || !articleKey.trim()) {
    throw new Error("article_key must be non-empty.");
  }

  if (proposalType === "CREATE") {
    const articleKeyRows = await queryRows(
      url,
      serviceRoleKey,
      "publications",
      {
        article_key: "eq." + articleKey,
        publication_status: "eq.PUBLISHED",
      },
    );

    if (articleKeyRows.length !== 0) {
      throw new Error("ARTICLE_KEY_ALREADY_PUBLISHED");
    }

    const pathRows = await queryRows(
      url,
      serviceRoleKey,
      "publications",
      {
        path: "eq." + article.path,
        publication_status: "eq.PUBLISHED",
      },
    );

    if (pathRows.length !== 0) {
      throw new Error("PATH_ALREADY_PUBLISHED");
    }
  } else {
    const currentRows = await queryRows(
      url,
      serviceRoleKey,
      "publications",
      {
        article_key: "eq." + articleKey,
        path: "eq." + article.path,
        publication_status: "eq.PUBLISHED",
      },
    );

    if (currentRows.length !== 1) {
      throw new Error(
        "EXPECTED_ONE_CURRENT_PUBLISHED_ROW",
      );
    }

    const currentRow = currentRows[0] as PublicationRow;

    if (
      currentRow.article_key !== articleKey ||
      currentRow.path !== article.path ||
      currentRow.publication_status !== "PUBLISHED" ||
      currentRow.version !== expectedCurrentVersion
    ) {
      throw new Error("CURRENT_PUBLISHED_ROW_MISMATCH");
    }

    const existingVersionRows = await queryRows(
      url,
      serviceRoleKey,
      "publications",
      {
        article_key: "eq." + articleKey,
        version: "eq." + proposedVersion,
      },
    );

    if (existingVersionRows.length !== 0) {
      throw new Error("ARTICLE_VERSION_EXISTS");
    }
  }

  const pendingProposalRows = await queryRows(
    url,
    serviceRoleKey,
    "publication_proposals",
    {
      article_key: "eq." + articleKey,
      proposed_version: "eq." + proposedVersion,
      proposal_status: "eq.PENDING",
    },
  );

  if (pendingProposalRows.length !== 0) {
    throw new Error("PENDING_PROPOSAL_EXISTS");
  }

  if (dryRun) {
    if (proposalType === "CREATE") {
      console.log(
        "READY_TO_PROPOSE CREATE " +
          article.path +
          " v" +
          proposedVersion,
      );
    } else {
      console.log(
        "READY_TO_PROPOSE REPLACE " +
          article.path +
          " v" +
          expectedCurrentVersion +
          " -> v" +
          proposedVersion,
      );
    }

    return;
  }

  if (process.env.ALLOW_PUBLICATION_PROPOSE !== "YES") {
    throw new Error(
      "ALLOW_PUBLICATION_PROPOSE=YES is required for publication proposals.",
    );
  }

  const response = await fetch(
    url.replace(/\/$/, "") +
      "/rest/v1/publication_proposals",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Prefer: "return=representation",
        apikey: serviceRoleKey,
        Authorization: "Bearer " + serviceRoleKey,
      },
      body: JSON.stringify({
        article_key: articleKey,
        path: article.path,
        proposal_type: proposalType,
        expected_current_version: expectedCurrentVersion,
        proposed_version: proposedVersion,
        proposal_status: "PENDING",
        payload: article,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Publication proposal creation failed with status " +
        response.status +
        ".",
    );
  }

  const proposals: unknown = await response.json();

  if (
    !Array.isArray(proposals) ||
    proposals.length !== 1 ||
    typeof proposals[0] !== "object" ||
    proposals[0] === null ||
    typeof (proposals[0] as { id?: unknown }).id !== "string"
  ) {
    throw new Error(
      "Publication proposal creation returned an invalid response.",
    );
  }

  const proposalId = (proposals[0] as { id: string }).id;

  if (proposalType === "CREATE") {
    console.log(
      "PROPOSED " +
        proposalId +
        " CREATE " +
        article.path +
        " v" +
        proposedVersion,
    );
  } else {
    console.log(
      "PROPOSED " +
        proposalId +
        " REPLACE " +
        article.path +
        " v" +
        expectedCurrentVersion +
        " -> v" +
        proposedVersion,
    );
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : "Publication proposal failed.",
  );

  process.exitCode = 1;
});
