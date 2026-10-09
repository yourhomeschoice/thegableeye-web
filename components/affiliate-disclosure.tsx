import Link from "next/link";

type AffiliateDisclosureProps = {
  variant?: "site" | "article";
};

export function AffiliateDisclosure({
  variant = "site",
}: AffiliateDisclosureProps) {
  if (variant === "article") {
    return (
      <p className="affiliate-disclosure">
        <strong>Affiliate disclosure:</strong> This article contains affiliate
        links. We may earn a commission if you purchase through them. Our
        recommendations are based on independent research.{" "}
        <Link href="/how-we-research/">How we work →</Link>
      </p>
    );
  }

  return (
    <p className="homepage-affiliate-note">
      The Gable Eye is independently researched. Some links may earn us a
      commission when you make a purchase.{" "}
      <Link href="/how-we-research/">How we work →</Link>
    </p>
  );
}