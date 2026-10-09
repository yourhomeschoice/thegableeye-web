import type { PublicationSource } from "../source";
import type { RecommendationComparisonArticle } from "../types";
import { requireValidPublicationArticle } from "../validation";
import {
  hasPubliclyReleasedArticles,
  isPubliclyReleasedArticlePath,
} from "../public-release";

type PublicationRow = { path: unknown; payload: unknown };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class SupabasePublicationSource implements PublicationSource {
  private readonly url: string;
  private readonly publishableKey: string;

  constructor(
    url = process.env.SUPABASE_URL,
    publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY,
  ) {
    if (!url || !publishableKey) {
      throw new Error(
        "Supabase publication source requires SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.",
      );
    }

    this.url = url.replace(/\/$/, "");
    this.publishableKey = publishableKey;
  }

  async getPublishedArticles(): Promise<readonly RecommendationComparisonArticle[]> {
    // With no website-approved paths, do not expose or fetch test publications.
    // The source remains read-only; Supabase records are unchanged.
    if (!hasPubliclyReleasedArticles()) {
      return [];
    }

    const articles = await this.getRows({ publication_status: "eq.PUBLISHED" });
    return articles.filter((article) => isPubliclyReleasedArticlePath(article.path));
  }

  async getPublishedArticleByPath(
    pathname: string,
  ): Promise<RecommendationComparisonArticle | undefined> {
    // This check is essential: excluding static params alone does not prevent
    // direct URL access to an unapproved publication.
    if (!isPubliclyReleasedArticlePath(pathname)) {
      return undefined;
    }

    const articles = await this.getRows({
      publication_status: "eq.PUBLISHED",
      path: "eq." + pathname,
      limit: "1",
    });
    return articles[0];
  }

  private async getRows(
    filters: Record<string, string>,
  ): Promise<readonly RecommendationComparisonArticle[]> {
    const query = new URLSearchParams({ select: "path,payload", ...filters });
    const response = await fetch(
      this.url + "/rest/v1/publications?" + query.toString(),
      {
        headers: {
          Accept: "application/json",
          apikey: this.publishableKey,
          Authorization: "Bearer " + this.publishableKey,
        },
        cache: "force-cache",
      },
    );

    if (!response.ok) {
      throw new Error(
        "Supabase publication source request failed with status " +
          response.status +
          ".",
      );
    }

    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) {
      throw new Error("Supabase publication source returned an invalid response.");
    }

    return rows.map((row, index) => this.validateRow(row, index));
  }

  private validateRow(row: unknown, index: number): RecommendationComparisonArticle {
    if (!isObject(row)) {
      throw new Error(
        "Supabase publication source returned an invalid row at index " + index + ".",
      );
    }

    const publicationRow = row as PublicationRow;
    if (typeof publicationRow.path !== "string") {
      throw new Error(
        "Supabase publication source returned a malformed publication at index " +
          index +
          ".",
      );
    }

    const article = requireValidPublicationArticle(publicationRow.payload);
    if (publicationRow.path !== article.path) {
      throw new Error(
        "Supabase publication source path mismatch at index " + index + ".",
      );
    }

    return article;
  }
}

