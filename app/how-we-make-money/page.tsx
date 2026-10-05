import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "How We Make Money",
  description: "How The Gable Eye funds its independent research and recommendations.",
};

export default function Page() {
  return <EditorialPage eyebrow="Commercial model" title="How we make money" standfirst="Some links may earn The Gable Eye a commission, but commercial relationships do not determine our recommendations."><h2 className="editorial">Affiliate commissions</h2><p>Some links to merchants or providers may be affiliate links. If a reader follows one of those links and completes a qualifying purchase or transaction, The Gable Eye may receive a commission from the merchant or provider.</p><h2 className="editorial">Recommendation independence</h2><p>A commercial relationship does not determine whether we recommend a product or service. Recommendations are made within the stated research and comparison scope where the available evidence supports one.</p><h2 className="editorial">No requirement to use affiliate links</h2><p>Readers can use The Gable Eye without using affiliate links. Not every product, service or provider we research will necessarily have a commercial relationship with us.</p></EditorialPage>;
}
