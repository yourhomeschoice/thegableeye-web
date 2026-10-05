import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "Corrections & Updates",
  description: "How to flag potential corrections or changes to The Gable Eye's published work.",
};

export default function Page() {
  return <EditorialPage eyebrow="Updates" title="Corrections and updates" standfirst="Information can change, and readers can help us identify where an article may need review."><p>If you spot a potential error or change, email <a href="mailto:hello@thegableeye.com">hello@thegableeye.com</a>. We review material corrections against available evidence and update published articles when warranted.</p></EditorialPage>;
}
