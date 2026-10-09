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

export function isPubliclyReleasedArticlePath(pathname: string): boolean {
  return PUBLIC_RELEASE_PATHS.has(pathname);
}

export function hasPubliclyReleasedArticles(): boolean {
  return PUBLIC_RELEASE_PATHS.size > 0;
}
