import nextEnv from "@next/env";
import { loadPublicationArtifact } from "./publication-artifact.ts";
import { requireValidPublicationArticle } from "../lib/publication/validation.ts";

const { loadEnvConfig } = nextEnv;

type PublicationRow = { article_key: unknown; version: unknown; path: unknown; publication_status: unknown };

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function requireEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(name + " is required.");
  return value;
}

function requirePositiveInteger(value: string | undefined, name: string): number {
  if (!value || !/^[1-9]\d*$/.test(value)) throw new Error(name + " must be a positive integer.");
  return Number(value);
}

async function queryRows(url: string, key: string, filters: Record<string, string>) {
  const query = new URLSearchParams({ select: "article_key,version,path,publication_status", ...filters });
  const response = await fetch(url.replace(/\/$/, "") + "/rest/v1/publications?" + query.toString(), {
    headers: { Accept: "application/json", apikey: key, Authorization: "Bearer " + key },
  });
  if (!response.ok) throw new Error("Publication replacement preflight request failed with status " + response.status + ".");
  const rows: unknown = await response.json();
  if (!Array.isArray(rows)) throw new Error("Publication replacement preflight returned an invalid response.");
  return rows;
}

async function preflight(articleKey: string, expectedCurrentVersion: number, newVersion: number, artifact: unknown, url: string, key: string) {
  const article = requireValidPublicationArticle(artifact);
  if (!articleKey.trim()) throw new Error("article_key must be non-empty.");
  if (newVersion <= expectedCurrentVersion) throw new Error("new version must be greater than expected current version.");

  const currentRows = await queryRows(url, key, { article_key: "eq." + articleKey, path: "eq." + article.path, publication_status: "eq.PUBLISHED" });
  if (currentRows.length !== 1) throw new Error("EXPECTED_ONE_CURRENT_PUBLISHED_ROW");
  const currentRow = currentRows[0] as PublicationRow;
  if (currentRow.article_key !== articleKey || currentRow.path !== article.path || currentRow.publication_status !== "PUBLISHED" || currentRow.version !== expectedCurrentVersion) {
    throw new Error("CURRENT_PUBLISHED_ROW_MISMATCH");
  }

  const newVersionRows = await queryRows(url, key, { article_key: "eq." + articleKey, version: "eq." + newVersion });
  if (newVersionRows.length !== 0) throw new Error("ARTICLE_VERSION_EXISTS");
  return article;
}

async function main() {
  loadEnvConfig(process.cwd());
  const artifactFile = argument("--artifact-file");
  const articleKey = argument("--article-key");
  const expectedCurrentVersion = requirePositiveInteger(argument("--expected-current-version"), "expected current version");
  const newVersion = requirePositiveInteger(argument("--new-version"), "new version");
  const dryRun = process.argv.includes("--dry-run");
  if (!artifactFile || !articleKey) throw new Error("Usage: --artifact-file <path> --article-key <key> --expected-current-version <number> --new-version <number> [--dry-run]");

  const url = requireEnvironment("SUPABASE_URL");
  const serviceRoleKey = requireEnvironment("SUPABASE_SERVICE_ROLE_KEY");
  const artifact = await loadPublicationArtifact(artifactFile);
  const article = await preflight(articleKey, expectedCurrentVersion, newVersion, artifact, url, serviceRoleKey);

  if (dryRun) {
    console.log("READY_TO_REPLACE " + article.path + " v" + expectedCurrentVersion + " -> v" + newVersion);
    return;
  }
  if (process.env.ALLOW_PUBLICATION_REPLACE !== "YES") throw new Error("ALLOW_PUBLICATION_REPLACE=YES is required for publication replacement.");

  const response = await fetch(url.replace(/\/$/, "") + "/rest/v1/rpc/replace_publication", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", apikey: serviceRoleKey, Authorization: "Bearer " + serviceRoleKey },
    body: JSON.stringify({ p_article_key: articleKey, p_expected_current_version: expectedCurrentVersion, p_new_version: newVersion, p_path: article.path, p_article_type: "recommendation_comparison", p_payload: article }),
  });
  if (!response.ok) throw new Error("Publication replacement failed with status " + response.status + ".");
  console.log("REPLACED " + article.path + " v" + expectedCurrentVersion + " -> v" + newVersion);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Publication replacement failed.");
  process.exitCode = 1;
});
