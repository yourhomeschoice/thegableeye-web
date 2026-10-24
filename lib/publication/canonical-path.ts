const publicationCategories = ["Travel", "Tech", "Home", "Outdoor", "Lifestyle"] as const;
type PublicationCategory = (typeof publicationCategories)[number];

function segment(value: string): string {
  const normalised = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (!normalised) throw new Error("Canonical URL segment is empty.");
  return normalised;
}

/** Builds the one canonical public path used in publication payloads and release approval. */
export function canonicalArticlePath(
  category: PublicationCategory,
  subcategory: string,
  slug: string,
): `/${string}` {
  if (!publicationCategories.includes(category)) throw new Error("Unsupported publication category.");
  return `/${segment(category)}/${segment(subcategory)}/${segment(slug)}`;
}
