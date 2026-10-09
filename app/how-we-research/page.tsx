import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "How We Research | The Gable Eye",
  description:
    "How The Gable Eye researches products and services, evaluates evidence, makes comparisons and explains recommendations.",
};

export default function Page() {
  return (
    <EditorialPage
      eyebrow="Our Standards"
      title="How We Research"
      standfirst="Good recommendations need more than a list of features. We aim to explain what we know, how we compare options and where the evidence has limits."
    >
      <h2 className="editorial">We start with the decision</h2>
      <p>
        A useful comparison begins with a clear question. Who is choosing, what
        do they need, and which details could make a meaningful difference?
        Price, suitability, features and practical limitations may matter
        differently depending on the situation.
      </p>
      <p>
        We aim to define the circumstances behind a comparison so readers can
        judge whether its conclusions apply to them.
      </p>

      <h2 className="editorial">We examine the available evidence</h2>
      <p>
        Our research approach draws on relevant information about products and
        services, including provider specifications, published terms, pricing
        and other sources appropriate to the subject. We consider what each
        source actually establishes rather than treating every claim as equally
        certain.
      </p>
      <p>
        Information can be incomplete, conditional or subject to change. We
        distinguish supported details from questions that remain unresolved or
        have not yet been researched. An unanswered question is not evidence
        that a feature is absent.
      </p>

      <h2 className="editorial">We compare what matters for the scenario</h2>
      <p>
        We focus on relevant differences, not simply the longest specification
        list. A lower price may matter, but only when the options meet the needs
        being considered. Where appropriate, we account for requirements,
        restrictions and the scope of the comparison before drawing a conclusion.
      </p>
      <p>
        A comparison of selected products is not automatically a survey of the
        entire market. We aim to identify which options were considered and
        avoid presenting a limited finding as a universal claim.
      </p>

      <h2 className="editorial">A recommendation has to be justified</h2>
      <p>
        We believe a recommendation should follow from the available evidence
        and the needs of the scenario. When one option has a supported advantage,
        we aim to explain it plainly. When the evidence does not establish a
        clear choice, we may present the differences without declaring a winner.
      </p>
      <p>
        We do not believe uncertainty should be hidden behind confident
        language. Sometimes the most useful answer is that more information is
        needed or that the right choice depends on personal priorities.
      </p>

      <h2 className="editorial">Editorial judgement and independence</h2>
      <p>
        Research and analysis inform our editorial work, but clear writing and
        responsible judgement remain essential. We aim to review conclusions
        for accuracy, clarity and appropriate scope before publication.
      </p>
      <p>
        Some articles may contain affiliate links that earn us a commission if
        readers make a purchase. Commercial arrangements do not determine our
        recommendation conclusions. We aim to identify affiliate relationships
        clearly wherever they are relevant.
      </p>

      <h2 className="editorial">Corrections and changing information</h2>
      <p>
        Prices, availability, terms and product details can change. An article
        reflects the information available within its stated research scope and
        should not be treated as a guarantee that every detail remains current.
        We aim to review material errors and update information where
        appropriate.
      </p>
      <p>
        If you notice something inaccurate or important that we have missed,
        we welcome the opportunity to investigate and correct it.
      </p>

      <p>
        <strong>
          Our guiding principle is simple: explain the evidence, acknowledge
          its limits and help readers decide with greater confidence.
        </strong>
      </p>
    </EditorialPage>
  );
}
