import nextEnv from "@next/env";
import { loadPublicationArtifact } from "./publication-artifact.ts";
import { requireValidPublicationArticle } from "../lib/publication/validation.ts";

const { loadEnvConfig } = nextEnv;

type CommitInput = {
  articleKey: string;
  version: number;
  article: unknown;
};

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function requireEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(name + " is required.");
  return value;
}

async function queryRows(url: string, key: string, filters: Record<string, string>) {
  const query = new URLSearchParams({ select: "article_key,version,path,publication_status", ...filters });
  const response = await fetch(url.replace(/\/$/, "") + "/rest/v1/publications?" + query.toString(), {
    headers: { Accept: "application/json", apikey: key, Authorization: "Bearer " + key },
  });
  if (!response.ok) throw new Error("Publication preflight request failed with status " + response.status + ".");
  const rows: unknown = await response.json();
  if (!Array.isArray(rows)) throw new Error("Publication preflight returned an invalid response.");
  return rows;
}

async function preflight(input: CommitInput, url: string, key: string) {
  const article = requireValidPublicationArticle(input.article);
  if (!input.articleKey.trim()) throw new Error("article_key must be non-empty.");
  if (!Number.isInteger(input.version) || input.version < 1) throw new Error("version must be an integer greater than or equal to 1.");

  const versionRows = await queryRows(url, key, { article_key: "eq." + input.articleKey, version: "eq." + input.version });
  if (versionRows.length > 0) throw new Error("ARTICLE_VERSION_EXISTS");

  const pathRows = await queryRows(url, key, { path: "eq." + article.path, publication_status: "eq.PUBLISHED" });
  if (pathRows.length > 0) throw new Error("PUBLISHED_VERSION_EXISTS");
  return article;
}

async function main() {
  loadEnvConfig(process.cwd());
  const articleKey = argument("--article-key");
  const versionArgument = argument("--version");
  const artifactFile = argument("--artifact-file");
  const dryRun = process.argv.includes("--dry-run");
  if (!artifactFile || !articleKey || !versionArgument) throw new Error("Usage: --artifact-file <path> --article-key <key> --version <number> [--dry-run]");
  const version = Number(versionArgument);

  const url = requireEnvironment("SUPABASE_URL");
  const serviceRoleKey = requireEnvironment("SUPABASE_SERVICE_ROLE_KEY");
  const artifact = await loadPublicationArtifact(artifactFile);
  const article = await preflight({ articleKey, version, article: artifact }, url, serviceRoleKey);

  if (dryRun) {
    console.log("READY_TO_COMMIT " + article.path + " version " + version);
    return;
  }

  if (process.env.ALLOW_PUBLICATION_WRITE !== "YES") throw new Error("ALLOW_PUBLICATION_WRITE=YES is required for publication writes.");
  const response = await fetch(url.replace(/\/$/, "") + "/rest/v1/publications", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", Prefer: "return=representation", apikey: serviceRoleKey, Authorization: "Bearer " + serviceRoleKey },
    body: JSON.stringify({ article_key: articleKey, path: article.path, article_type: "recommendation_comparison", version, publication_status: "PUBLISHED", published_at: new Date().toISOString(), payload: article }),
  });
  if (response.status === 409) throw new Error("DATABASE_CONFLICT");
  if (!response.ok) throw new Error("Publication insert failed with status " + response.status + ".");
  console.log("PUBLISHED " + article.path + " version " + version);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Publication commit failed.");
  process.exitCode = 1;
});
