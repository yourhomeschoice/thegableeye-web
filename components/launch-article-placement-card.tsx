import Link from "next/link";
import Image from "next/image";
import type { DevelopmentArticlePlacement } from "@/lib/launch-baseline/article-placement";

export function LaunchArticlePlacementCard({
  article,
}: {
  article: DevelopmentArticlePlacement;
}) {
  return (
    <article className="travel-landing-guide">
      <Link className="travel-landing-guide-image" href={article.href} aria-label={article.title}>
        <span>Editorial image</span>
      </Link>
      <div className="travel-landing-guide-copy">
        <p className="eyebrow">{article.category}</p>
        <h3 className="editorial">
          <Link href={article.href}>{article.title}</Link>
        </h3>
        {article.summary ? <p>{article.summary}</p> : null}
      </div>
    </article>
  );
}

export function HomepageLaunchArticlePlacementCard({
  article,
}: {
  article: DevelopmentArticlePlacement;
}) {
  return (
    <article className="homepage-latest-card">
      <Link className="homepage-card-image" href={article.href} aria-label={article.title}>
        {article.image ? <Image src={article.image.src} alt={article.image.alt} fill sizes="(max-width: 760px) 100vw, (max-width: 1050px) 50vw, 25vw" style={{ objectFit: "cover" }} /> : <span>Editorial image</span>}
      </Link>
      <div className="homepage-card-content">
        <p className="eyebrow">{article.category}</p>
        <h3 className="editorial">
          <Link href={article.href}>{article.title}</Link>
        </h3>
        {article.summary ? <p>{article.summary}</p> : null}
      </div>
    </article>
  );
}
