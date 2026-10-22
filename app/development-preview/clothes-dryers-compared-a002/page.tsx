import { notFound } from "next/navigation";
import { ClothesDryerPreview } from "@/components/clothes-dryer-preview";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
export const dynamic="force-dynamic";
export default function Page(){if(process.env.NODE_ENV!=="development")notFound();return <><SiteHeader/><ClothesDryerPreview/><SiteFooter/></>}
