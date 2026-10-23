/**
 * Explicit public website release gate.
 *
 * PUBLISHED in the research/publication store does not, on its own,
 * authorize an article to appear on the public website.
 *
 * Add an exact pathname only after final human editorial approval.
 * Keep historical/test publications out of this list.
 */
const PUBLIC_RELEASE_PATHS: ReadonlySet<string> = new Set<string>([]);

export type PublicReleaseGate = Readonly<{
  hasPubliclyReleasedArticles(): boolean;
  isPubliclyReleasedArticlePath(pathname: string): boolean;
}>;

/**
 * Produces a path-only release gate for deterministic rehearsal tests.
 * Production continues to use the fixed allowlist below.
 */
export function createPublicReleaseGate(
  paths: ReadonlySet<string>,
): PublicReleaseGate {
  return {
    hasPubliclyReleasedArticles: () => paths.size > 0,
    isPubliclyReleasedArticlePath: (pathname) => paths.has(pathname),
  };
}

const publicReleaseGate = createPublicReleaseGate(PUBLIC_RELEASE_PATHS);

export function isPubliclyReleasedArticlePath(pathname: string): boolean {
  return publicReleaseGate.isPubliclyReleasedArticlePath(pathname);
}

export function hasPubliclyReleasedArticles(): boolean {
  return publicReleaseGate.hasPubliclyReleasedArticles();
}
