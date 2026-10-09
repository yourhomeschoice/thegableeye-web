import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | The Gable Eye",
  description:
    "How affiliate links support The Gable Eye and how we keep commercial relationships separate from editorial recommendations.",
};

export default function Page() {
  return (
    <EditorialPage
      eyebrow="Affiliate Disclosure"
      title="How our affiliate links work."
      standfirst="We believe readers should understand how The Gable Eye is funded and how that relates to our recommendations."
    >
      <h2 className="editorial">How we may earn money</h2>
      <p>
        Some pages on The Gable Eye contain affiliate links to retailers or service
        providers. If you follow one of these links and make a qualifying purchase,
        we may receive a commission from the retailer or affiliate partner.
      </p>
      <p>
        You do not pay a separate fee to The Gable Eye for using these links.
        Prices, offers and terms are set by the relevant retailer or provider and
        may change.
      </p>

      <h2 className="editorial">Our editorial independence</h2>
      <p>
        Affiliate relationships do not determine which products or services we
        recommend. We aim to base our conclusions on research, relevant evidence
        and the needs of the reader, not on the availability or size of a
        commission.
      </p>
      <p>
        We may conclude that no option can be recommended when the available
        information does not justify one.
      </p>

      <h2 className="editorial">How we identify affiliate content</h2>
      <p>
        We aim to make affiliate relationships clear wherever they are relevant.
        Articles containing affiliate links may include a disclosure near the
        beginning, and we may provide additional labels where the nature of the
        content requires them.
      </p>
      <p>
        A link appearing on The Gable Eye does not necessarily mean it is an
        affiliate link. We may link to sources, manufacturers, retailers and other
        resources without receiving compensation.
      </p>

      <h2 className="editorial">Making your own decision</h2>
      <p>
        Our articles are intended to help you compare options and understand the
        reasoning behind our conclusions. We encourage you to check the current
        price, availability, specifications and terms with the seller before
        purchasing.
      </p>
      <p>
        For more about how we approach comparisons and recommendations, please
        see our <Link href="/how-we-research/">How We Research</Link> page.
      </p>
    </EditorialPage>
  );
}
