import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "About The Gable Eye",
  description: "About The Gable Eye's independent research and recommendations.",
};

export default function Page() {
  return <EditorialPage eyebrow="About" title="Independent research, clearly explained." standfirst="The Gable Eye researches products and services and makes recommendations where the available evidence supports one."><h2 className="editorial">What we publish</h2><p>Comparisons may be limited to a defined scenario or researched set. We explain that scope so readers can see what a conclusion does—and does not—cover.</p><h2 className="editorial">What we leave open</h2><p>When information is unresolved or not researched, we state that rather than guess. Commercial relationships do not determine recommendation authority.</p></EditorialPage>;
}
