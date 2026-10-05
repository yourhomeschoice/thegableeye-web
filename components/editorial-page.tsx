import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
export function EditorialPage({ eyebrow, title, standfirst, children }: { eyebrow: string; title: string; standfirst: string; children: ReactNode }) { return <><SiteHeader /><main className="trust-page"><article className="trust-page-inner"><header><p className="eyebrow">{eyebrow}</p><h1 className="editorial">{title}</h1><p className="trust-standfirst">{standfirst}</p></header><div className="trust-body">{children}</div></article></main><SiteFooter /></>; }
