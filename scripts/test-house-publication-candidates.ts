import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { RecommendationArticle } from "../components/recommendation-article.tsx";
import { validatePublicationArticle } from "../lib/publication/validation.ts";
import {
  buildA001HousePublication,
  buildA002HousePublication,
  housePublicationIdentities,
} from "./house-canonical-specimens.ts";
import { requireValidPublicationCandidate } from "./publication-candidate.ts";

for (const [identity, specimen] of [
  [housePublicationIdentities.A001, buildA001HousePublication()],
  [housePublicationIdentities.A002, buildA002HousePublication()],
] as const) {
  const validation = validatePublicationArticle(specimen);
  assert.equal(validation.valid, true, `${identity.articleKey} HOUSE payload validates`);
  assert.equal(specimen.path, identity.path);
  assert.equal(specimen.category, identity.category);
  assert.equal(specimen.subcategory, identity.subcategory);

  const candidate = requireValidPublicationCandidate({
    kind: "PUBLICATION_CANDIDATE",
    version: 2,
    articleKey: identity.articleKey,
    proposalType: "CREATE",
    expectedCurrentVersion: 0,
    proposedVersion: 1,
    path: identity.path,
    authority: { publicationStatus: "AUTHORISED" },
    payload: specimen,
  });
  assert.equal(candidate.payload, specimen);

  const markup = renderToStaticMarkup(RecommendationArticle({ article: specimen }));
  assert.match(markup, /house-article-disclosure/);
  assert.match(markup, /house-article-independence/);
}

assert.deepEqual(
  buildA001HousePublication(),
  buildA001HousePublication(),
  "A001 candidate source is deterministic",
);
assert.deepEqual(
  buildA002HousePublication(),
  buildA002HousePublication(),
  "A002 candidate source is deterministic",
);

console.log("A001/A002 deterministic HOUSE publication candidates validate without publication actions.");
