import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SlowCookerPreview } from "@/components/slow-cooker-preview";

export const dynamic = "force-dynamic";

export default function SlowCookerPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <><SiteHeader /><SlowCookerPreview /><SiteFooter /></>;
}
