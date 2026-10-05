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

export type ArticleBody = {
  readonly format: "MARKDOWN";
  readonly content: string;
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
