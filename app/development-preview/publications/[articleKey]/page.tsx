import { notFound } from "next/navigation";
import { RecommendationArticle } from "@/components/recommendation-article";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLocalInspectionPublication } from "@/lib/publication/local-inspection";

export const dynamic = "force-dynamic";

type LocalInspectionPageProps = {
  params: Promise<{ articleKey: string }>;
};

export default async function LocalInspectionPage({
  params,
}: LocalInspectionPageProps) {
  if (process.env.NODE_ENV !== "development") notFound();

  const article = await getLocalInspectionPublication((await params).articleKey);
  if (!article) notFound();

  return (
    <>
      <SiteHeader />
      <RecommendationArticle article={article} />
      <SiteFooter />
    </>
  );
}
