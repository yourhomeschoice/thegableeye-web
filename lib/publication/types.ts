export type ComparedOption = {
  readonly provider: string;
  readonly optionLabel: string;
  readonly displayedPrice: string;
  readonly attributes: readonly { readonly label: string; readonly value: string }[];
  readonly details: readonly string[];
};

export type PracticalCheck = {
  readonly title: string;
  readonly body: string;
};

export type PublicationImage = {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly caption?: string;
  readonly credit?: string;
};

export type MarkdownArticleBody = {
  readonly format: "MARKDOWN";
  readonly content: string;
};

export type EditorialHtmlArticleBody = {
  readonly format: "HTML";
  readonly content: string;
};

export type HouseGuideItem = Readonly<{ targetId: string; label: string }>;
export type HouseTextSection = Readonly<{ kind: "TEXT"; id: string; heading: string; paragraphs?: readonly string[]; subsections?: readonly Readonly<{ heading: string; paragraphs: readonly string[] }>[]; role?: "STANDARD" | "METHODOLOGY" }>;
export type HouseVerdictSection = Readonly<{ kind: "VERDICT"; id: string; paragraphs: readonly string[] }>;
export type HouseComparisonSection = Readonly<{ kind: "COMPARISON"; id: string; heading: string; introduction?: readonly string[]; columns: readonly Readonly<{ key: string; label: string }>[]; rows: readonly Readonly<{ subject: string; cells: readonly string[] }>[]; stickyFirstColumn?: boolean }>;
export type HouseAlternativeSection = Readonly<{ kind: "ALTERNATIVES"; id: string; heading: string; items: readonly Readonly<{ heading: string; paragraphs: readonly string[] }>[] }>;
export type HouseArticleSection = HouseTextSection | HouseVerdictSection | HouseComparisonSection | HouseAlternativeSection;
export type HouseArticleBody = Readonly<{ format: "HOUSE"; presentation: Readonly<{ guide: readonly HouseGuideItem[]; sections: readonly HouseArticleSection[] }> }>;

export type ArticleBody = MarkdownArticleBody | EditorialHtmlArticleBody | HouseArticleBody;

export type EditorialBaselineProvenance = {
  readonly baselineKey: string;
  readonly articleKey: string;
  readonly publicPath: string;
  readonly editorialBodySha256: string;
  readonly editorialApprovalStatus: "HUMAN_APPROVED";
  readonly sourceFilename?: string;
};

type PublicationArticleCommon = {
  readonly publicationStatus: "PUBLISHED";
  readonly path: `/${string}`;
  readonly slug: string;
  readonly category: string;
  readonly subcategory: string;
  readonly articleType: string;
  readonly title: string;
  readonly standfirst: string;
  readonly author: string;
  readonly lastResearched: string;
  readonly affiliateDisclosure?: string;
  readonly image?: PublicationImage;
  readonly editorialBaselineProvenance?: EditorialBaselineProvenance;
};

type RecommendationComparisonSections = {
  readonly atAGlance: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly body: string;
  };
  readonly scenario: {
    readonly eyebrow: string;
    readonly heading: string;
  };
  readonly comparedOptions: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly introduction: string;
  };
  readonly recommendationRationale: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly body: string;
  };
  readonly alternatives: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly introduction: string;
  };
  readonly practicalChecks: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly introduction: string;
  };
  readonly uncertainties: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly introduction: string;
    readonly items: readonly string[];
  };
  readonly methodology: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly body: string;
    readonly links: readonly string[];
  };
  readonly updates: {
    readonly heading: string;
    readonly bodyBeforeLink: string;
    readonly linkText: string;
    readonly bodyAfterLink: string;
  };
  readonly authorCard: {
    readonly heading: string;
    readonly description: string;
  };
  readonly bottomLine: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly body: string;
  };
};

export type LegacyRecommendationComparisonArticle = PublicationArticleCommon & {
  readonly articleBody?: never;
  readonly recommendation: {
    readonly provider: string;
    readonly subject: string;
    readonly price: string;
    readonly reason: string;
    readonly scenarioDisplay: string;
    readonly researchScope: string;
    readonly coverage: string;
    readonly uncertainties: readonly string[];
  };
  readonly scenario: {
    readonly details: readonly { readonly label: string; readonly value: string }[];
    readonly boundaryNote: string;
  };
  readonly comparedOptions: readonly ComparedOption[];
  readonly practicalChecks: readonly PracticalCheck[];
  readonly sections: RecommendationComparisonSections;
};

export type CanonicalPublicationArticle = PublicationArticleCommon & {
  readonly articleBody: ArticleBody;
};

export type RecommendationComparisonArticle =
  | LegacyRecommendationComparisonArticle
  | CanonicalPublicationArticle;

/** A validated public publication plus its permanent database identity. */
export type PublishedRecommendationComparisonArticle =
  RecommendationComparisonArticle & {
    /** Supabase is authoritative; this is not editorial payload data. */
    readonly articleKey: string;
  };
