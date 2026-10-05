import nextEnv from "@next/env";
import { requireValidPublicationArticle } from "../lib/publication/validation.ts";

const { loadEnvConfig } = nextEnv;

type ProposalRow = { id: unknown; article_key: unknown; path: unknown; proposal_type: unknown; expected_current_version: unknown; proposed_version: unknown; proposal_status: unknown; payload: unknown };
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

async function queryRows(url: string, key: string, table: string, filters: Record<string, string>) {
  const query = new URLSearchParams({ select: "*", ...filters });
  const response = await fetch(url.replace(/\/$/, "") + "/rest/v1/" + table + "?" + query.toString(), { headers: { Accept: "application/json", apikey: key, Authorization: "Bearer " + key } });
  if (!response.ok) throw new Error("Publication approval preflight request failed with status " + response.status + ".");
  const rows: unknown = await response.json();
  if (!Array.isArray(rows)) throw new Error("Publication approval preflight returned an invalid response.");
  return rows;
}

async function main() {
  loadEnvConfig(process.cwd());
  const proposalId = argument("--proposal-id");
  if (!proposalId) throw new Error("Usage: --proposal-id <uuid> [--dry-run]");
  const dryRun = process.argv.includes("--dry-run");
  const url = requireEnvironment("SUPABASE_URL");
  const serviceRoleKey = requireEnvironment("SUPABASE_SERVICE_ROLE_KEY");
  const proposalRows = await queryRows(url, serviceRoleKey, "publication_proposals", { id: "eq." + proposalId });
  if (proposalRows.length !== 1) throw new Error("PROPOSAL_NOT_FOUND");
  const proposal = proposalRows[0] as ProposalRow;
  if (proposal.id !== proposalId || proposal.proposal_status !== "PENDING" || proposal.proposal_type !== "REPLACE" || typeof proposal.article_key !== "string" || typeof proposal.path !== "string" || !Number.isInteger(proposal.expected_current_version) || !Number.isInteger(proposal.proposed_version)) throw new Error("PROPOSAL_MISMATCH");
  const expectedCurrentVersion = proposal.expected_current_version as number;
  const proposedVersion = proposal.proposed_version as number;
  const article = requireValidPublicationArticle(proposal.payload);
  if (article.path !== proposal.path || proposedVersion <= expectedCurrentVersion) throw new Error("PROPOSAL_PAYLOAD_MISMATCH");
  const currentRows = await queryRows(url, serviceRoleKey, "publications", { article_key: "eq." + proposal.article_key, path: "eq." + proposal.path, publication_status: "eq.PUBLISHED" });
  if (currentRows.length !== 1) throw new Error("EXPECTED_ONE_CURRENT_PUBLISHED_ROW");
  const currentRow = currentRows[0] as PublicationRow;
  if (currentRow.article_key !== proposal.article_key || currentRow.path !== proposal.path || currentRow.publication_status !== "PUBLISHED" || currentRow.version !== expectedCurrentVersion) throw new Error("CURRENT_PUBLISHED_ROW_MISMATCH");
  if ((await queryRows(url, serviceRoleKey, "publications", { article_key: "eq." + proposal.article_key, version: "eq." + proposedVersion })).length !== 0) throw new Error("ARTICLE_VERSION_EXISTS");

  if (dryRun) {
    console.log("READY_TO_APPROVE " + article.path + " v" + expectedCurrentVersion + " -> v" + proposedVersion);
    return;
  }
  if (process.env.ALLOW_PUBLICATION_APPROVE !== "YES") throw new Error("ALLOW_PUBLICATION_APPROVE=YES is required for publication approval.");
  const response = await fetch(url.replace(/\/$/, "") + "/rest/v1/rpc/approve_publication_proposal", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json", apikey: serviceRoleKey, Authorization: "Bearer " + serviceRoleKey }, body: JSON.stringify({ p_proposal_id: proposalId }) });
  if (!response.ok) throw new Error("Publication proposal approval failed with status " + response.status + ".");
  console.log("APPROVED " + proposalId + " " + article.path + " v" + expectedCurrentVersion + " -> v" + proposedVersion);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Publication approval failed.");
  process.exitCode = 1;
});
