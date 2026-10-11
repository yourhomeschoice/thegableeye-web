import type { RecommendationComparisonArticle } from "./types";
import { sanitiseTrustedEditorialHtml } from "./editorial-html";

type ValidationSuccess = {
  valid: true;
  article: RecommendationComparisonArticle;
};

type ValidationFailure = {
  valid: false;
  errors: readonly string[];
};

export type PublicationValidationResult = ValidationSuccess | ValidationFailure;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateText(value: unknown, path: string, errors: string[]) {
  if (!hasText(value)) {
    errors.push(path + " must be a non-empty string.");
  }
}

function validateTextArray(value: unknown, path: string, errors: string[]) {
  if (!Array.isArray(value) || !value.every(hasText)) {
    errors.push(path + " must be an array of non-empty strings.");
  }
}

function validateSection(
  value: unknown,
  path: string,
  fields: readonly string[],
  errors: string[],
) {
  if (!isObject(value)) {
    errors.push(path + " must be an object.");
    return;
  }

  for (const field of fields) {
    validateText(value[field], path + "." + field, errors);
  }
}

export function validatePublicationArticle(
  value: unknown,
): PublicationValidationResult {
  const errors: string[] = [];

  if (!isObject(value)) {
    return {
      valid: false,
      errors: ["article must be a non-null object."],
    };
  }

  if (value.publicationStatus !== "PUBLISHED") {
    errors.push("publicationStatus must be PUBLISHED.");
  }

  validateText(value.path, "path", errors);

  if (typeof value.path === "string" && !value.path.startsWith("/")) {
    errors.push("path must be an absolute pathname.");
  }

  for (const field of [
    "slug",
    "category",
    "subcategory",
    "articleType",
    "title",
    "standfirst",
    "author",
    "lastResearched",
  ]) {
    validateText(value[field], field, errors);
  }

  if (value.affiliateDisclosure !== undefined) {
    validateText(value.affiliateDisclosure, "affiliateDisclosure", errors);
  }

  if (value.articleBody !== undefined) {
    if (!isObject(value.articleBody)) {
      errors.push("articleBody must be an object.");
    } else {
      if (value.articleBody.format !== "MARKDOWN" && value.articleBody.format !== "HTML") {
        errors.push("articleBody.format must be MARKDOWN or HTML.");
      }
      validateText(value.articleBody.content, "articleBody.content", errors);
      if (value.articleBody.format === "HTML" && hasText(value.articleBody.content)) {
        try {
          sanitiseTrustedEditorialHtml(value.articleBody.content);
        } catch (error) {
          errors.push(error instanceof Error ? error.message : "articleBody HTML is invalid.");
        }
      }
    }
  }

  if (value.image !== undefined) {
    if (!isObject(value.image)) {
      errors.push("image must be an object.");
    } else {
      validateText(value.image.src, "image.src", errors);
      validateText(value.image.alt, "image.alt", errors);

      if (
        typeof value.image.width !== "number" ||
        !Number.isFinite(value.image.width) ||
        value.image.width <= 0
      ) {
        errors.push("image.width must be a positive finite number.");
      }

      if (
        typeof value.image.height !== "number" ||
        !Number.isFinite(value.image.height) ||
        value.image.height <= 0
      ) {
        errors.push("image.height must be a positive finite number.");
      }

      if (value.image.caption !== undefined) {
        validateText(value.image.caption, "image.caption", errors);
      }

      if (value.image.credit !== undefined) {
        validateText(value.image.credit, "image.credit", errors);
      }
    }
  }

  if (value.articleBody === undefined) {
  if (!isObject(value.recommendation)) {
    errors.push("recommendation must be an object.");
  } else {
    for (const field of [
      "provider",
      "subject",
      "price",
      "reason",
      "scenarioDisplay",
      "researchScope",
      "coverage",
    ]) {
      validateText(
        value.recommendation[field],
        "recommendation." + field,
        errors,
      );
    }

    validateTextArray(
      value.recommendation.uncertainties,
      "recommendation.uncertainties",
      errors,
    );
  }

  if (!isObject(value.scenario)) {
    errors.push("scenario must be an object.");
  } else {
    if (!Array.isArray(value.scenario.details)) {
      errors.push("scenario.details must be an array.");
    } else {
      value.scenario.details.forEach((detail, index) => {
        if (!isObject(detail)) {
          errors.push("scenario.details[" + index + "] must be an object.");
        } else {
          validateText(
            detail.label,
            "scenario.details[" + index + "].label",
            errors,
          );

          validateText(
            detail.value,
            "scenario.details[" + index + "].value",
            errors,
          );
        }
      });
    }

    validateText(
      value.scenario.boundaryNote,
      "scenario.boundaryNote",
      errors,
    );
  }

  if (
    !Array.isArray(value.comparedOptions) ||
    value.comparedOptions.length === 0
  ) {
    errors.push("comparedOptions must contain at least one option.");
  } else {
    value.comparedOptions.forEach((option, index) => {
      const path = "comparedOptions[" + index + "]";

      if (!isObject(option)) {
        errors.push(path + " must be an object.");
        return;
      }

      for (const field of ["provider", "optionLabel", "displayedPrice"]) {
        validateText(option[field], path + "." + field, errors);
      }

      if (!Array.isArray(option.attributes)) {
        errors.push(path + ".attributes must be an array.");
      } else {
        option.attributes.forEach((attribute, attributeIndex) => {
          if (!isObject(attribute)) {
            errors.push(
              path +
                ".attributes[" +
                attributeIndex +
                "] must be an object.",
            );
          } else {
            validateText(
              attribute.label,
              path + ".attributes[" + attributeIndex + "].label",
              errors,
            );

            validateText(
              attribute.value,
              path + ".attributes[" + attributeIndex + "].value",
              errors,
            );
          }
        });
      }

      validateTextArray(option.details, path + ".details", errors);
    });
  }

  if (!Array.isArray(value.practicalChecks)) {
    errors.push("practicalChecks must be an array.");
  } else {
    value.practicalChecks.forEach((check, index) => {
      if (!isObject(check)) {
        errors.push("practicalChecks[" + index + "] must be an object.");
      } else {
        validateText(
          check.title,
          "practicalChecks[" + index + "].title",
          errors,
        );

        validateText(
          check.body,
          "practicalChecks[" + index + "].body",
          errors,
        );
      }
    });
  }

  if (!isObject(value.sections)) {
    errors.push("sections must be an object when articleBody is absent.");
  } else {
    validateSection(
      value.sections.atAGlance,
      "sections.atAGlance",
      ["eyebrow", "heading", "body"],
      errors,
    );

    validateSection(
      value.sections.scenario,
      "sections.scenario",
      ["eyebrow", "heading"],
      errors,
    );

    validateSection(
      value.sections.comparedOptions,
      "sections.comparedOptions",
      ["eyebrow", "heading", "introduction"],
      errors,
    );

    validateSection(
      value.sections.recommendationRationale,
      "sections.recommendationRationale",
      ["eyebrow", "heading", "body"],
      errors,
    );

    validateSection(
      value.sections.alternatives,
      "sections.alternatives",
      ["eyebrow", "heading", "introduction"],
      errors,
    );

    validateSection(
      value.sections.practicalChecks,
      "sections.practicalChecks",
      ["eyebrow", "heading", "introduction"],
      errors,
    );

    if (!isObject(value.sections.uncertainties)) {
      errors.push("sections.uncertainties must be an object.");
    } else {
      validateText(
        value.sections.uncertainties.eyebrow,
        "sections.uncertainties.eyebrow",
        errors,
      );

      validateText(
        value.sections.uncertainties.heading,
        "sections.uncertainties.heading",
        errors,
      );

      if (typeof value.sections.uncertainties.introduction !== "string") {
        errors.push(
          "sections.uncertainties.introduction must be a string.",
        );
      } else if (
        Array.isArray(value.sections.uncertainties.items) &&
        value.sections.uncertainties.items.length > 0
      ) {
        validateText(
          value.sections.uncertainties.introduction,
          "sections.uncertainties.introduction",
          errors,
        );
      }

      validateTextArray(
        value.sections.uncertainties.items,
        "sections.uncertainties.items",
        errors,
      );
    }

    if (!isObject(value.sections.methodology)) {
      errors.push("sections.methodology must be an object.");
    } else {
      validateText(
        value.sections.methodology.eyebrow,
        "sections.methodology.eyebrow",
        errors,
      );

      validateText(
        value.sections.methodology.heading,
        "sections.methodology.heading",
        errors,
      );

      validateText(
        value.sections.methodology.body,
        "sections.methodology.body",
        errors,
      );

      validateTextArray(
        value.sections.methodology.links,
        "sections.methodology.links",
        errors,
      );
    }

    validateSection(
      value.sections.updates,
      "sections.updates",
      ["heading", "bodyBeforeLink", "linkText", "bodyAfterLink"],
      errors,
    );

    validateSection(
      value.sections.authorCard,
      "sections.authorCard",
      ["heading", "description"],
      errors,
    );

    validateSection(
      value.sections.bottomLine,
      "sections.bottomLine",
      ["eyebrow", "heading", "body"],
      errors,
    );
  }
  }

  return errors.length > 0
    ? { valid: false, errors }
    : {
        valid: true,
        article: value as RecommendationComparisonArticle,
      };
}

export function requireValidPublicationArticle(
  value: unknown,
): RecommendationComparisonArticle {
  const result = validatePublicationArticle(value);

  if (!result.valid) {
    throw new Error(
      "Publication validation failed: " + result.errors.join(" "),
    );
  }

  return result.article;
}
