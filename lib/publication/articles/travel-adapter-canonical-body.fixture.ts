import type { RecommendationComparisonArticle } from "../types";

// Test-only local specimen. It is deliberately not registered with the
// Supabase publication source or exposed as a public publication.
export const travelAdapterCanonicalBodyFixture = {
  publicationStatus: "PUBLISHED",
  path: "/travel/transport/travel-adapter-priority-comparison",
  slug: "travel-adapter-priority-comparison",
  category: "Travel",
  subcategory: "Transport / Getting Around",
  articleType: "Comparison / Recommendation Guide",
  title: "Ceptics UP-70KU or Anker A9215: which travel adapter fits your priority?",
  standfirst: "A local canonical-body rendering specimen for the Travel Adapter article.",
  author: "The Gable Eye Editorial",
  lastResearched: "test fixture",
  articleBody: {
    format: "MARKDOWN",
    content: "## Test fixture heading\n\nTest fixture paragraph.\n\n- First test item\n- Second test item",
  },
} satisfies RecommendationComparisonArticle;
