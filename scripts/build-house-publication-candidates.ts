import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  buildA001HousePublication,
  buildA002HousePublication,
  housePublicationIdentities,
} from "./house-canonical-specimens.ts";
import {
  requireValidPublicationCandidate,
  type PublicationCandidate,
} from "./publication-candidate.ts";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function candidate(
  articleKey: string,
  payload: ReturnType<typeof buildA001HousePublication>,
): PublicationCandidate {
  return requireValidPublicationCandidate({
    kind: "PUBLICATION_CANDIDATE",
    version: 2,
    articleKey,
    proposalType: "CREATE",
    expectedCurrentVersion: 0,
    proposedVersion: 1,
    path: payload.path,
    authority: { publicationStatus: "AUTHORISED" },
    payload,
  });
}

async function main() {
  const outputDirectory = argument("--output-directory");
  if (!outputDirectory) {
    throw new Error("Usage: --output-directory <project-relative-directory>");
  }

  const root = path.resolve(process.cwd());
  const destination = path.resolve(root, outputDirectory);
  const relativeDestination = path.relative(root, destination);
  if (relativeDestination.startsWith("..") || path.isAbsolute(relativeDestination)) {
    throw new Error("output directory must be within the project working area.");
  }

  const candidates = [
    candidate(housePublicationIdentities.A001.articleKey, buildA001HousePublication()),
    candidate(housePublicationIdentities.A002.articleKey, buildA002HousePublication()),
  ];

  await mkdir(destination, { recursive: true });
  for (const item of candidates) {
    const filename = path.join(destination, `${item.articleKey}.json`);
    await writeFile(filename, JSON.stringify(item, null, 2) + "\n", {
      encoding: "utf8",
      flag: "wx",
    });
    console.log(`BUILT_CANDIDATE ${filename}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "House candidate build failed.");
  process.exitCode = 1;
});
