import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  reportEditorialReviews,
  validateEditorialReviewRegister,
} from "../lib/editorial-review/review-register.ts";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
}

function registerPath(file: string): string {
  const root = path.resolve(process.cwd());
  const resolved = path.resolve(root, file);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("register file must be within the project working area.");
  }
  return resolved;
}

async function main() {
  const asOf = argument("--as-of");
  const dueWithinArgument = argument("--due-within-days") ?? "14";
  const registerFile = argument("--register-file") ?? "editorial-review/review-register.json";
  if (!asOf || !/^\d{4}-\d{2}-\d{2}$/.test(asOf) || !/^\d+$/.test(dueWithinArgument)) {
    throw new Error("Usage: --as-of YYYY-MM-DD [--due-within-days <non-negative integer>] [--register-file <path>]");
  }
  const contents = await readFile(registerPath(registerFile), "utf8");
  const register = validateEditorialReviewRegister(JSON.parse(contents) as unknown);
  const rows = reportEditorialReviews(register, asOf, Number(dueWithinArgument)).filter(
    (row) => row.dueState === "OVERDUE" || row.dueState === "DUE_SOON",
  );

  console.log("article_key\treview_group\tlast_completed_review\tnext_review_due\tdue_state\toutstanding_status");
  if (!rows.length) {
    console.log("NONE");
    return;
  }
  for (const row of rows) {
    console.log([
      row.articleKey,
      row.reviewGroup,
      row.lastCompletedReview?.eventDate ?? "",
      row.nextReviewDue,
      row.dueState,
      row.outstandingStatus ?? "",
    ].join("\t"));
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Editorial review report failed.");
  process.exitCode = 1;
});
