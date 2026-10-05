import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

function requireEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(name + " is required.");
  return value;
}

async function main() {
  loadEnvConfig(process.cwd());
  const url = requireEnvironment("SUPABASE_URL");
  const serviceRoleKey = requireEnvironment("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(url.replace(/\/$/, "") + "/rest/v1/rpc/verify_stale_publication_proposal_rejection", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", apikey: serviceRoleKey, Authorization: "Bearer " + serviceRoleKey },
    body: JSON.stringify({ p_article_key: "heathrow-car-rental-comparison", p_path: "/travel/car-rental/heathrow-car-rental-comparison", p_stale_expected_version: 1, p_synthetic_version: 99 }),
  });
  if (!response.ok) throw new Error("Stale proposal test failed with status " + response.status + ".");
  const result: unknown = await response.json();
  if (result !== "current published version does not match expected version") throw new Error("Unexpected stale proposal test result.");
  const publicationQuery = new URLSearchParams({ select: "version,publication_status", article_key: "eq.heathrow-car-rental-comparison", path: "eq./travel/car-rental/heathrow-car-rental-comparison", publication_status: "eq.PUBLISHED" });
  const publicationResponse = await fetch(url.replace(/\/$/, "") + "/rest/v1/publications?" + publicationQuery.toString(), { headers: { Accept: "application/json", apikey: serviceRoleKey, Authorization: "Bearer " + serviceRoleKey } });
  const proposalQuery = new URLSearchParams({ select: "id", article_key: "eq.heathrow-car-rental-comparison", proposed_version: "eq.99" });
  const proposalResponse = await fetch(url.replace(/\/$/, "") + "/rest/v1/publication_proposals?" + proposalQuery.toString(), { headers: { Accept: "application/json", apikey: serviceRoleKey, Authorization: "Bearer " + serviceRoleKey } });
  if (!publicationResponse.ok || !proposalResponse.ok) throw new Error("Stale proposal residue check failed.");
  const publications: unknown = await publicationResponse.json();
  const proposals: unknown = await proposalResponse.json();
  if (!Array.isArray(publications) || publications.length !== 1 || typeof publications[0] !== "object" || publications[0] === null || (publications[0] as { version?: unknown; publication_status?: unknown }).version !== 2 || (publications[0] as { publication_status?: unknown }).publication_status !== "PUBLISHED") throw new Error("Heathrow publication changed during stale proposal test.");
  if (!Array.isArray(proposals) || proposals.length !== 0) throw new Error("Synthetic proposal residue exists.");
  console.log("STALE_PROPOSAL_APPROVAL_BLOCKED " + result);
  console.log("STALE_PROPOSAL_TEST_NO_RESIDUE Heathrow v2 PUBLISHED");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Stale proposal test failed.");
  process.exitCode = 1;
});
