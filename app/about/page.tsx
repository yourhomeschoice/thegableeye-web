import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "About Us | The Gable Eye",
  description:
    "Learn about The Gable Eye, our independent research, practical comparisons and approach to recommendations.",
};

export default function Page() {
  return (
    <EditorialPage
      eyebrow="About Us"
      title="A clearer way to choose."
      standfirst="Choosing the right product or service shouldn't require hours of searching, comparing specifications and sorting through conflicting recommendations."
    >
      <p>
        At <strong>The Gable Eye</strong>, our aim is simple: to help people make
        better-informed decisions through independent research, practical
        comparisons and clear recommendations.
      </p>
      <p>
        Whether you&apos;re choosing an eSIM for your next trip, a laptop for everyday
        work or something useful for your home, we believe good advice should
        explain not just <em>what</em> to choose, but <em>why</em>.
      </p>

      <h2 className="editorial">What we believe</h2>
      <p>
        The most expensive product isn&apos;t necessarily the right one. The longest
        list of features doesn&apos;t always mean better value. And a recommendation
        that works for one person may not suit another.
      </p>
      <p>
        We believe useful recommendations start with understanding what someone
        actually needs.
      </p>
      <p>
        That&apos;s why our approach focuses on practical questions: What does the
        product offer? What does it cost? What are its limitations? And how well
        does it fit the situation we&apos;re considering?
      </p>
      <p>Our goal is to make those answers easier to understand.</p>

      <h2 className="editorial">Research before recommendations</h2>
      <p>
        We take a structured, evidence-led approach to researching products and
        services.
      </p>
      <p>
        We examine available information, compare relevant characteristics and
        distinguish established facts from details that remain uncertain.
      </p>
      <p>
        Where the evidence supports a recommendation, we explain the reasoning.
        Where it doesn&apos;t, we believe it&apos;s better to acknowledge that limitation
        than to offer an unsupported conclusion.
      </p>
      <p>
        Not every comparison covers every product on the market, and not every
        article involves hands-on testing. We aim to make the scope and basis of
        our research clear so readers can judge how relevant a recommendation is
        to their own circumstances.
      </p>

      <h2 className="editorial">Independent thinking</h2>
      <p>
        The Gable Eye is built around a straightforward principle:{" "}
        <strong>
          recommendations should be guided by evidence and reader needs, not
          commercial relationships.
        </strong>
      </p>
      <p>
        Some of our articles may contain affiliate links. If you purchase
        through those links, we may earn a commission, at no additional cost to
        you.
      </p>
      <p>
        These arrangements help support the publication, but they do not
        determine which products we recommend or the conclusions we reach.
      </p>
      <p>
        We believe commercial transparency is an essential part of earning
        reader trust.
      </p>

      <h2 className="editorial">Built around everyday decisions</h2>
      <p>
        The Gable Eye covers Travel, Tech, Home and Lifestyle, amongst many other
        categories.
      </p>
      <p>
        Our approach remains the same: focus on the details that matter, explain
        meaningful differences and avoid unnecessary complexity.
      </p>
      <p>
        We don&apos;t believe every comparison needs a winner. Sometimes the most
        useful conclusion is that two options are closely matched, that a choice
        depends on individual preferences or that more information is needed.
      </p>

      <h2 className="editorial">Earning your trust</h2>
      <p>
        Trust isn&apos;t something a publication can simply claim. It has to be earned
        through the quality, accuracy and transparency of its work.
      </p>
      <p>
        We aim to explain our reasoning, acknowledge limitations and revisit
        information when circumstances change.
      </p>
      <p>
        If you spot an error or believe something important has been overlooked,
        we welcome the opportunity to review it.
      </p>
      <p>
        <strong>
          Our ambition is to make The Gable Eye a place readers can return to
          when they want a considered, independent view before making a decision.
        </strong>
      </p>
      <p>Because choosing well starts with understanding clearly.</p>
    </EditorialPage>
  );
}
