import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "Contact Us | The Gable Eye",
  description:
    "Contact The Gable Eye with questions, factual corrections, research suggestions and general enquiries.",
};

export default function Page() {
  return (
    <EditorialPage
      eyebrow="Contact Us"
      title="We'd like to hear from you."
      standfirst="Questions, corrections or suggestions? Your feedback helps us make The Gable Eye more useful and accurate."
    >
      <h2 className="editorial">Get in touch</h2>
      <p>
        For general enquiries, feedback or suggestions about topics we should
        research, please contact us using the email address below.
      </p>
      <p>
        <strong>Email:</strong> hello@thegableeye.com
      </p>

      <h2 className="editorial">Corrections and factual updates</h2>
      <p>
        We aim to explain our research clearly and accurately. If you spot an
        error, an outdated price or a detail that may have changed, please let us
        know. Where possible, include the article title or link, the information
        in question and a source we can review.
      </p>
      <p>
        We welcome corrections and will assess information against the evidence
        available. Not every suggestion will result in a change, but we take
        factual accuracy seriously.
      </p>

      <h2 className="editorial">Research and article suggestions</h2>
      <p>
        Is there a product, service or everyday decision you would like us to
        examine? We welcome ideas from readers, although we cannot promise to
        research or publish every suggestion.
      </p>

      <h2 className="editorial">Commercial enquiries</h2>
      <p>
        Businesses and potential partners may also use our contact address.
        Commercial enquiries do not determine our editorial recommendations or
        the conclusions we publish.
      </p>

      <h2 className="editorial">A note about personal information</h2>
      <p>
        Please do not send passwords, payment-card details or other sensitive
        personal information. If you email us, we will receive the information
        you choose to share. Further details will be set out in our Privacy
        Policy.
      </p>
    </EditorialPage>
  );
}
