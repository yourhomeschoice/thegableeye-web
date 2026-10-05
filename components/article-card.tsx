import Link from "next/link";

type ArticleCardProps = { category: string; title: string; summary: string; href: string; tone?: "ocean" | "stone" | "sunset" | "forest"; featured?: boolean };

export function ArticleCard({ category, title, summary, href, tone = "ocean", featured = false }: ArticleCardProps) {
  return <article className={`article-card ${featured ? "article-card-featured" : ""}`}><Link className={`article-image image-${tone}`} href={href} aria-label={title}><span className="image-caption">Demo image</span></Link><div className="article-card-copy"><p className="eyebrow">{category}</p><h3 className="article-card-title"><Link href={href}>{title}</Link></h3><p className="article-summary">{summary}</p><Link className="text-link" href={href}>Read sample <span aria-hidden="true">→</span></Link></div></article>;
}
