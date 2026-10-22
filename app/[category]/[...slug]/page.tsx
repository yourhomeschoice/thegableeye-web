import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecommendationArticle } from "@/components/recommendation-article";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  getPublicationByPath,
  getPublicationRouteParams,
} from "@/lib/publication/registry";
import { getResolvedRelatedArticles } from "@/lib/publication/related-articles";

type ArticleRouteProps = {
  params: Promise<{ category: string; slug: string[] }>;
};

// Only routes explicitly returned by generateStaticParams may be served.
// Unapproved publication paths must not be generated on demand.
export const dynamicParams = false;

function pathnameFromParams(category: string, slug: string[]) {
  return `/${[category, ...slug].join("/")}`;
}

export async function generateStaticParams() {
  return getPublicationRouteParams();
}

export async function generateMetadata({
  params,
}: ArticleRouteProps): Promise<Metadata> {
  const { category, slug } = await params;
  const article = await getPublicationByPath(
    pathnameFromParams(category, slug),
  );

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.standfirst,
    alternates: {
      canonical: article.path,
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.standfirst,
      url: article.path,
      siteName: "The Gable Eye",
      ...(article.image
        ? {
            images: [
              {
                url: article.image.src,
                width: article.image.width,
                height: article.image.height,
                alt: article.image.alt,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function PublicationArticlePage({
  params,
}: ArticleRouteProps) {
  const { category, slug } = await params;
  const article = await getPublicationByPath(
    pathnameFromParams(category, slug),
  );

  if (!article) {
    notFound();
  }

  const relatedArticles = await getResolvedRelatedArticles(article.articleKey);

  return (
    <>
      <SiteHeader />
      <RecommendationArticle article={article} relatedArticles={relatedArticles} />
      <SiteFooter />
    </>
  );
}
