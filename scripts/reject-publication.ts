import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

type ProposalRow = { id: unknown; path: unknown; proposal_type: unknown; proposal_status: unknown; proposed_version: unknown };

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function requireEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(name + " is required.");
  return value;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function main() {
  loadEnvConfig(process.cwd());
  const proposalId = argument("--proposal-id");
  const note = argument("--note");
  const dryRun = process.argv.includes("--dry-run");
  if (!proposalId || !isUuid(proposalId)) throw new Error("Usage: --proposal-id <uuid> [--note <text>] [--dry-run]");
  if (note !== undefined && note.trim().length > 500) throw new Error("rejection note must be 500 characters or fewer.");
  const url = requireEnvironment("SUPABASE_URL");
  const serviceRoleKey = requireEnvironment("SUPABASE_SERVICE_ROLE_KEY");
  const query = new URLSearchParams({ select: "id,path,proposal_type,proposal_status,proposed_version", id: "eq." + proposalId });
  const response = await fetch(url.replace(/\/$/, "") + "/rest/v1/publication_proposals?" + query.toString(), { headers: { Accept: "application/json", apikey: serviceRoleKey, Authorization: "Bearer " + serviceRoleKey } });
  if (!response.ok) throw new Error("Publication rejection preflight request failed with status " + response.status + ".");
  const rows: unknown = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1) throw new Error("PROPOSAL_NOT_FOUND");
  const proposal = rows[0] as ProposalRow;
  if (proposal.id !== proposalId || proposal.proposal_status !== "PENDING" || proposal.proposal_type !== "REPLACE" || typeof proposal.path !== "string" || !Number.isInteger(proposal.proposed_version)) throw new Error("PROPOSAL_MISMATCH");
  const proposedVersion = proposal.proposed_version as number;
  if (dryRun) {
    console.log("READY_TO_REJECT " + proposalId + " " + proposal.path + " v" + proposedVersion);
    return;
  }
  if (process.env.ALLOW_PUBLICATION_REJECT !== "YES") throw new Error("ALLOW_PUBLICATION_REJECT=YES is required for publication rejection.");
  const rejectResponse = await fetch(url.replace(/\/$/, "") + "/rest/v1/rpc/reject_publication_proposal", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json", apikey: serviceRoleKey, Authorization: "Bearer " + serviceRoleKey }, body: JSON.stringify({ p_proposal_id: proposalId, p_note: note }) });
  if (!rejectResponse.ok) throw new Error("Publication proposal rejection failed with status " + rejectResponse.status + ".");
  console.log("REJECTED " + proposalId + " " + proposal.path + " v" + proposedVersion);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Publication rejection failed.");
  process.exitCode = 1;
});
