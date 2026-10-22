import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import {
  buildApprovedBaselinePublicationCandidate,
  type ApprovedBaselinePublicationMetadata,
  type PublicationCandidateAuthority,
  type PublicationCandidateOperation,
} from "../lib/publication/approved-baseline-candidate.ts";
import { SupabaseApprovedEditorialBaselineSource } from "../lib/publication/sources/supabase-approved-editorial-baseline-source.ts";

const { loadEnvConfig } = nextEnv;

type BuilderInput = Readonly<{
  metadata: ApprovedBaselinePublicationMetadata;
  authority: PublicationCandidateAuthority;
  operation: PublicationCandidateOperation;
}>;

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pathInsideWorkingDirectory(file: string): string {
  const root = path.resolve(process.cwd());
  const resolved = path.resolve(root, file);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("file path must be within the project working area.");
  }
  return resolved;
}

async function loadInput(file: string): Promise<BuilderInput> {
  let contents: string;
  try {
    contents = await readFile(pathInsideWorkingDirectory(file), "utf8");
  } catch {
    throw new Error("input file does not exist or is unreadable.");
  }
  try {
    const parsed: unknown = JSON.parse(contents);
    if (
      !isObject(parsed) ||
      !isObject(parsed.metadata) ||
      !isObject(parsed.authority) ||
      !isObject(parsed.operation)
    ) {
      throw new Error("input file must contain metadata, authority, and operation objects.");
    }
    return parsed as BuilderInput;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("input file must")) throw error;
    throw new Error("input file contains malformed JSON.");
  }
}

async function writeNewArtifact(file: string, candidate: unknown) {
  const target = pathInsideWorkingDirectory(file);
  try {
    await access(target);
    throw new Error("output file already exists.");
  } catch (error) {
    if (error instanceof Error && error.message === "output file already exists.") throw error;
  }
  try {
    await writeFile(target, JSON.stringify(candidate, null, 2) + "\n", {
      encoding: "utf8",
      flag: "wx",
    });
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new Error("output file already exists.");
    }
    throw error;
  }
}

async function main() {
  loadEnvConfig(process.cwd());
  const baselineKey = argument("--baseline-key");
  const inputFile = argument("--input-file");
  const outputFile = argument("--output-file");
  if (!baselineKey || !inputFile || !outputFile) {
    throw new Error("Usage: --baseline-key <key> --input-file <path> --output-file <path>");
  }

  const input = await loadInput(inputFile);
  const candidate = await buildApprovedBaselinePublicationCandidate(
    new SupabaseApprovedEditorialBaselineSource(),
    { baselineKey, ...input },
  );
  await writeNewArtifact(outputFile, candidate);
  console.log("BUILT_CANDIDATE " + outputFile);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Approved-baseline candidate build failed.");
  process.exitCode = 1;
});
