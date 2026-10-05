import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "Editorial Standards",
  description: "The editorial standards behind The Gable Eye's research and recommendations.",
};

export default function Page() {
  return <EditorialPage eyebrow="Standards" title="Evidence before conclusions." standfirst="Our standards keep facts, recommendations, scope and uncertainty clear."><p>We separate facts from recommendations, avoid invented facts, and use recommendation language only within the evidence and comparison scope available.</p><p>Unresolved information remains unresolved. We avoid broad claims such as best, cheapest, #1 or top unless the evidence and defined comparison scope support them.</p><p>Commercial relationships do not determine recommendations. Material corrections are reviewed against evidence, with human editorial responsibility for publication.</p></EditorialPage>;
}
