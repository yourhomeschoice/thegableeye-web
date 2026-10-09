import { createHash } from "node:crypto";

export type ApprovedLaunchBaselineExpectation = Readonly<{
  baselineKey: string;
  articleKey: string;
  publicPath: string;
  requiresRecommendedSupplierPackage?: boolean;
}>;

type BaselineRow = Record<string, unknown>;
type SupplierPackageRow = Record<string, unknown>;

export type ApprovedLaunchBaseline = Readonly<{ title: string; editorialHtml: string }>;

function requireString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`Approved launch baseline ${name} is incomplete.`);
  return value;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Reads an immutable, human-approved editorial baseline. Supplier-package validation is opt-in because it is only part of the eSIM baseline's approval contract. */
export class ApprovedLaunchBaselineReader {
  constructor(
    private readonly expected: ApprovedLaunchBaselineExpectation,
    private readonly url = process.env.SUPABASE_URL,
    private readonly serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY,
    private readonly fetcher: typeof fetch = fetch,
  ) {
    if (!url || !serviceRoleKey) throw new Error("Approved launch baseline reader requires server-side Supabase credentials.");
  }

  async getApprovedBaseline(): Promise<ApprovedLaunchBaseline> {
    const baselineRows = await this.getRows<BaselineRow>("launch_editorial_baselines", {
      select: "baseline_key,article_key,public_path,title,editorial_body,editorial_body_sha256,editorial_approval_status,release_status,recommended_supplier",
      baseline_key: `eq.${this.expected.baselineKey}`,
      limit: "2",
    });
    if (baselineRows.length !== 1) throw new Error("Approved launch baseline is missing or ambiguous.");
    const baseline = baselineRows[0];
    const editorialHtml = requireString(baseline.editorial_body, "editorial HTML");
    const expectedHash = requireString(baseline.editorial_body_sha256, "editorial HTML checksum");
    const recommendedSupplier = requireString(baseline.recommended_supplier, "recommended supplier");
    if (
      baseline.baseline_key !== this.expected.baselineKey || baseline.article_key !== this.expected.articleKey ||
      baseline.public_path !== this.expected.publicPath || baseline.editorial_approval_status !== "HUMAN_APPROVED" ||
      baseline.release_status !== "NOT_RELEASED"
    ) throw new Error("Approved launch baseline is not approved for controlled preview.");
    if (createHash("sha256").update(editorialHtml).digest("hex") !== expectedHash) throw new Error("Approved launch baseline editorial HTML checksum does not match.");

    if (this.expected.requiresRecommendedSupplierPackage) {
      const packages = await this.getRows<SupplierPackageRow>("launch_supplier_packages", { select: "supplier_key,approval_basis,approved_details", baseline_key: `eq.${this.expected.baselineKey}` });
      const approved = packages.some((entry) => entry.supplier_key === recommendedSupplier && entry.approval_basis === "HUMAN_FINAL_EDITORIAL_REVIEW" && isObject(entry.approved_details) && entry.approved_details.recommended === true);
      if (!approved) throw new Error("Approved launch baseline supplier package is incomplete or unapproved.");
    }
    return { title: requireString(baseline.title, "title"), editorialHtml };
  }

  private async getRows<Row>(table: "launch_editorial_baselines" | "launch_supplier_packages", filters: Record<string, string>): Promise<readonly Row[]> {
    const response = await this.fetcher(`${this.url!.replace(/\/$/, "")}/rest/v1/${table}?${new URLSearchParams(filters)}`, { headers: { Accept: "application/json", apikey: this.serviceRoleKey!, Authorization: `Bearer ${this.serviceRoleKey!}` }, cache: "no-store" });
    if (!response.ok) throw new Error(`Approved launch baseline request failed with status ${response.status}.`);
    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) throw new Error("Approved launch baseline returned an invalid response.");
    return rows as readonly Row[];
  }
}
