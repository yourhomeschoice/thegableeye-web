import { notFound } from "next/navigation";
import { LaunchBaselineArticle } from "@/components/launch-baseline-article";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JapanEsimLaunchBaselineReader } from "@/lib/launch-baseline/japan-esim-launch-baseline";

export const dynamic = "force-dynamic";

export default async function JapanEsimLaunchPreviewPage() {
  // This is a local editorial review route, never a production endpoint.
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const baseline = await new JapanEsimLaunchBaselineReader().getApprovedBaseline();

  return (
    <>
      <SiteHeader />
      <LaunchBaselineArticle editorialHtml={baseline.editorialHtml} />
      <SiteFooter />
    </>
  );
}
