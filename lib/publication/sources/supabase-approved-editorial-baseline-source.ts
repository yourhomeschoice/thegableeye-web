import type {
  ApprovedEditorialBaseline,
  ApprovedEditorialBaselineSource,
} from "../approved-baseline-candidate.ts";

type BaselineRow = Record<string, unknown>;

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new Error("Supabase approved baseline " + field + " is invalid.");
  }
  return value;
}

/** Read-only adapter for approved baseline records; it never changes Supabase state. */
export class SupabaseApprovedEditorialBaselineSource
  implements ApprovedEditorialBaselineSource
{
  constructor(
    private readonly url = process.env.SUPABASE_URL,
    private readonly key = process.env.SUPABASE_BASELINE_READ_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
    private readonly fetcher: typeof fetch = fetch,
  ) {
    if (!url || !key) {
      throw new Error("Supabase approved baseline source requires server-side Supabase credentials.");
    }
  }

  async getByBaselineKey(
    baselineKey: string,
  ): Promise<readonly ApprovedEditorialBaseline[]> {
    const query = new URLSearchParams({
      select: "baseline_key,article_key,public_path,title,editorial_body,editorial_body_sha256,editorial_approval_status,release_status,editorial_source_filename",
      baseline_key: "eq." + baselineKey,
      limit: "2",
    });
    const response = await this.fetcher(
      this.url!.replace(/\/$/, "") + "/rest/v1/launch_editorial_baselines?" + query,
      {
        headers: { Accept: "application/json", apikey: this.key!, Authorization: "Bearer " + this.key! },
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new Error("Supabase approved baseline request failed with status " + response.status + ".");
    }
    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) throw new Error("Supabase approved baseline response is invalid.");
    return rows.map((row) => this.toBaseline(row));
  }

  private toBaseline(row: unknown): ApprovedEditorialBaseline {
    if (typeof row !== "object" || row === null || Array.isArray(row)) {
      throw new Error("Supabase approved baseline row is invalid.");
    }
    const value = row as BaselineRow;
    const sourceFilename = value.editorial_source_filename;
    return {
      baselineKey: requireString(value.baseline_key, "baseline_key"),
      articleKey: requireString(value.article_key, "article_key"),
      publicPath: requireString(value.public_path, "public_path"),
      title: requireString(value.title, "title"),
      editorialHtml: requireString(value.editorial_body, "editorial_body"),
      editorialBodySha256: requireString(value.editorial_body_sha256, "editorial_body_sha256"),
      editorialApprovalStatus: requireString(value.editorial_approval_status, "editorial_approval_status"),
      releaseStatus: requireString(value.release_status, "release_status"),
      ...(sourceFilename === null || sourceFilename === undefined
        ? {}
        : { sourceFilename: requireString(sourceFilename, "editorial_source_filename") }),
    };
  }
}
