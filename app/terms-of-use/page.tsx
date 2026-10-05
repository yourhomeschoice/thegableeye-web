import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of The Gable Eye website and its published content.",
};

export default function Page() {
  return <EditorialPage eyebrow="Legal" title="Terms of use" standfirst="These terms describe the basis on which visitors may use The Gable Eye and its published content."><h2 className="editorial">Using this website</h2><p>You may use The Gable Eye for lawful personal and informational purposes. You must not use the website in a way that intentionally interferes with its operation, security or availability, or in a way that is unlawful.</p><h2 className="editorial">Our content</h2><p>The Gable Eye publishes original editorial content, research, comparisons and recommendations. Unless otherwise indicated, the site&apos;s editorial content and presentation should not be reproduced, republished or commercially redistributed without permission.</p><h2 className="editorial">Third-party links</h2><p>Our articles may link to websites operated by merchants, providers or other third parties. Those websites operate independently from The Gable Eye and may have their own terms, privacy practices, prices and conditions.</p><h2 className="editorial">Affiliate links</h2><p>Some outbound links may be affiliate links. If you follow one of those links and complete a qualifying transaction, The Gable Eye may receive a commission. Commercial relationships do not determine our recommendations.</p><h2 className="editorial">Changes to the website</h2><p>We may update, correct, add or remove published content as research, evidence, products and services change. We may also change the structure or availability of parts of the website.</p><h2 className="editorial">Questions</h2><p>For questions about these terms or The Gable Eye, contact <a href="mailto:hello@thegableeye.com">hello@thegableeye.com</a>.</p></EditorialPage>;
}
