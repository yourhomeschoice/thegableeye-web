import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecommendationArticle } from "@/components/recommendation-article";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  getPublicationByPath,
  getPublicationRouteParams,
} from "@/lib/publication/registry";

type ArticleRouteProps = {
  params: Promise<{ category: string; slug: string[] }>;
};

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

  return (
    <>
      <SiteHeader />
      <RecommendationArticle article={article} />
      <SiteFooter />
    </>
  );
}