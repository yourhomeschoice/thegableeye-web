import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "How affiliate relationships are disclosed at The Gable Eye.",
};

export default function Page() {
  return <EditorialPage eyebrow="Disclosure" title="How affiliate links work" standfirst="The Gable Eye may earn a commission when readers use some links."><p>That generally does not change the price a reader pays, though terms can vary. Commercial relationships do not determine recommendation authority, and not every provider we mention has an affiliate relationship.</p><p>You can use our publication without using affiliate links. This page is an editorial disclosure, not a full legal disclaimer.</p></EditorialPage>;
}
