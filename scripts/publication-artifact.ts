import { readFile, realpath } from "node:fs/promises";
import path from "node:path";

export async function loadPublicationArtifact(artifactFile: string): Promise<unknown> {
  const projectRoot = await realpath(process.cwd());
  const requestedPath = path.resolve(projectRoot, artifactFile);
  const relativePath = path.relative(projectRoot, requestedPath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("artifact file must be within the project working area.");
  }

  let resolvedPath: string;
  try {
    resolvedPath = await realpath(requestedPath);
  } catch {
    throw new Error("artifact file does not exist or is unreadable.");
  }
  const resolvedRelativePath = path.relative(projectRoot, resolvedPath);
  if (resolvedRelativePath.startsWith("..") || path.isAbsolute(resolvedRelativePath)) {
    throw new Error("artifact file must resolve within the project working area.");
  }

  let contents: string;
  try {
    contents = await readFile(resolvedPath, "utf8");
  } catch {
    throw new Error("artifact file does not exist or is unreadable.");
  }
  try {
    return JSON.parse(contents) as unknown;
  } catch {
    throw new Error("artifact file contains malformed JSON.");
  }
}
