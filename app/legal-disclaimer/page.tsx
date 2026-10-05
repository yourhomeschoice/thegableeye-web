import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "Legal Disclaimer",
  description: "Important information about the scope and limitations of The Gable Eye's research and recommendations.",
};

export default function Page() {
  return <EditorialPage eyebrow="Legal" title="Legal disclaimer" standfirst="The Gable Eye publishes independent research, comparisons and recommendations for general informational purposes."><h2 className="editorial">Information, not individual advice</h2><p>Our articles are intended to provide general information and research. They are not personalised professional, financial, legal, medical or other specialist advice, and they should not be treated as a substitute for advice appropriate to your individual circumstances.</p><h2 className="editorial">Research and recommendations</h2><p>We aim to make recommendations only where the available evidence supports them and to explain the scope of our comparisons. A recommendation reflects the researched scenario and information available at the time of publication or review. It does not mean that a product or service will be the right choice for every reader or circumstance.</p><h2 className="editorial">Information can change</h2><p>Prices, availability, product features, provider terms and other information can change after publication. We work to identify material changes and corrections, but readers should verify important current information with the relevant provider before making a purchase or other decision.</p><h2 className="editorial">Third-party products and services</h2><p>The Gable Eye does not control third-party merchants, providers, websites, products or services. References or links to third parties do not make The Gable Eye the seller or provider of those products or services.</p><h2 className="editorial">Commercial relationships</h2><p>Some links may be affiliate links, which means The Gable Eye may receive a commission from a qualifying transaction. Commercial relationships do not determine our recommendations.</p><p>For more information, see our <Link href="/affiliate-disclosure/">Affiliate Disclosure</Link> and <Link href="/how-we-make-money/">How We Make Money</Link> pages.</p></EditorialPage>;
}
