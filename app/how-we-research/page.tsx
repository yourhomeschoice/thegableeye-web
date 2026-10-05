import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "How We Research",
  description: "How The Gable Eye develops evidence-led recommendations.",
};

export default function Page() {
  return <EditorialPage eyebrow="Method" title="How we research" standfirst="We aim to say exactly as much as the evidence allows—and make that useful to the reader."><ol><li>Define the question or scenario.</li><li>Gather source evidence and verify accepted facts.</li><li>Preserve unresolved and not-researched states.</li><li>Compare relevant options within the stated scope.</li><li>Make a recommendation only where evidence supports one.</li><li>Apply human-supervised editorial review before publication.</li><li>Review updates and corrections when evidence changes.</li></ol><p>Publication is not automatic: human approval remains part of the process.</p></EditorialPage>;
}
