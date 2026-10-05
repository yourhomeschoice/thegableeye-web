import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact The Gable Eye.",
};

export default function Page() {
  return <EditorialPage eyebrow="Contact" title="Get in touch" standfirst="Questions, corrections and other enquiries can be sent to The Gable Eye by email."><h2 className="editorial">Email</h2><p>Contact us at <a href="mailto:hello@thegableeye.com">hello@thegableeye.com</a>.</p><p>If you are reporting a potential factual error or changed information, please include the relevant article and enough detail for us to review the issue.</p></EditorialPage>;
}
