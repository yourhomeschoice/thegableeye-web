import type { RecommendationComparisonArticle } from "./types";
import { createHash } from "node:crypto";
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

const houseId = /^[a-z][a-z0-9-]{0,79}$/;

function exact(value: Record<string, unknown>, keys: readonly string[], path: string, errors: string[]) {
  for (const key of Object.keys(value)) if (!keys.includes(key)) errors.push(`${path} contains unsupported field ${key}.`);
}

function houseText(value: unknown, path: string, errors: string[], max = 20_000) {
  if (!hasText(value) || value.length > max) errors.push(`${path} must be a non-empty string within the permitted length.`);
}

function houseParagraphs(value: unknown, path: string, errors: string[]) {
  if (!Array.isArray(value) || value.length === 0) { errors.push(`${path} must contain at least one paragraph.`); return; }
  value.forEach((item, index) => houseText(item, `${path}[${index}]`, errors));
}

function validateHouseBody(value: Record<string, unknown>, errors: string[]) {
  if (value.format !== "HOUSE") {
    errors.push("articleBody.format must be HOUSE.");
  }
  exact(value, ["format", "presentation"], "articleBody", errors);
  if (!isObject(value.presentation)) { errors.push("articleBody.presentation must be an object."); return; }
  const presentation = value.presentation;
  exact(presentation, ["guide", "sections"], "articleBody.presentation", errors);
  const sections = presentation.sections;
  if (!Array.isArray(sections) || sections.length === 0 || sections.length > 50) { errors.push("articleBody.presentation.sections must contain 1 to 50 sections."); return; }
  const ids = new Set<string>(); let verdicts = 0; let methodologies = 0;
  sections.forEach((raw, index) => {
    const path = `articleBody.presentation.sections[${index}]`;
    if (!isObject(raw)) { errors.push(`${path} must be an object.`); return; }
    houseText(raw.id, `${path}.id`, errors, 80);
    if (typeof raw.id === "string") { if (!houseId.test(raw.id)) errors.push(`${path}.id is malformed.`); if (ids.has(raw.id)) errors.push(`${path}.id is duplicated.`); ids.add(raw.id); }
    if (raw.kind === "TEXT") { exact(raw, ["kind", "id", "heading", "paragraphs", "subsections", "role"], path, errors); houseText(raw.heading, `${path}.heading`, errors, 200); const sub=raw.subsections; const hasP=Array.isArray(raw.paragraphs)&&raw.paragraphs.length>0, hasS=Array.isArray(sub)&&sub.length>0; if(!hasP&&!hasS)errors.push(`${path} must contain paragraphs or subsections.`); if(raw.paragraphs!==undefined)houseParagraphs(raw.paragraphs,`${path}.paragraphs`,errors); if(sub!==undefined){if(!Array.isArray(sub)||sub.length===0||sub.length>50)errors.push(`${path}.subsections must contain 1 to 50 items.`);else sub.forEach((item,i)=>{const q=`${path}.subsections[${i}]`;if(!isObject(item)){errors.push(`${q} must be an object.`);return;}exact(item,["heading","paragraphs"],q,errors);houseText(item.heading,`${q}.heading`,errors,200);houseParagraphs(item.paragraphs,`${q}.paragraphs`,errors);});} if (raw.role !== undefined && raw.role !== "STANDARD" && raw.role !== "METHODOLOGY") errors.push(`${path}.role is invalid.`); if (raw.role === "METHODOLOGY") methodologies++; return; }
    if (raw.kind === "VERDICT") { verdicts++; exact(raw, ["kind", "id", "paragraphs"], path, errors); houseParagraphs(raw.paragraphs, `${path}.paragraphs`, errors); return; }
    if (raw.kind === "COMPARISON") {
      exact(raw, ["kind", "id", "heading", "introduction", "columns", "rows", "stickyFirstColumn"], path, errors); houseText(raw.heading, `${path}.heading`, errors, 200); if (raw.introduction !== undefined) houseParagraphs(raw.introduction, `${path}.introduction`, errors);
      const columns = raw.columns;
      if (!Array.isArray(columns) || columns.length < 2 || columns.length > 12) errors.push(`${path}.columns must contain 2 to 12 columns.`);
      const keys = new Set<string>(), labels = new Set<string>();
      if (Array.isArray(columns)) columns.forEach((column, columnIndex) => { if (!isObject(column)) { errors.push(`${path}.columns[${columnIndex}] must be an object.`); return; } exact(column, ["key", "label"], `${path}.columns[${columnIndex}]`, errors); houseText(column.key, `${path}.columns[${columnIndex}].key`, errors, 200); houseText(column.label, `${path}.columns[${columnIndex}].label`, errors, 200); if (typeof column.key === "string" && keys.has(column.key)) errors.push(`${path}.columns contains duplicate keys.`); if (typeof column.label === "string" && labels.has(column.label)) errors.push(`${path}.columns contains duplicate labels.`); if (typeof column.key === "string") keys.add(column.key); if (typeof column.label === "string") labels.add(column.label); });
      const rows = raw.rows;
      if (!Array.isArray(rows) || rows.length < 1 || rows.length > 100) errors.push(`${path}.rows must contain 1 to 100 rows.`);
      const subjects = new Set<string>();
      if (Array.isArray(rows) && Array.isArray(columns)) rows.forEach((row, rowIndex) => { if (!isObject(row)) { errors.push(`${path}.rows[${rowIndex}] must be an object.`); return; } exact(row, ["subject", "cells"], `${path}.rows[${rowIndex}]`, errors); houseText(row.subject, `${path}.rows[${rowIndex}].subject`, errors); if (typeof row.subject === "string" && subjects.has(row.subject)) errors.push(`${path}.rows contains duplicate subjects.`); if (typeof row.subject === "string") subjects.add(row.subject); if (!Array.isArray(row.cells) || row.cells.length !== columns.length - 1) errors.push(`${path}.rows[${rowIndex}].cells must align with columns.`); else row.cells.forEach((cell, cellIndex) => houseText(cell, `${path}.rows[${rowIndex}].cells[${cellIndex}]`, errors)); });
      if (raw.stickyFirstColumn !== undefined && typeof raw.stickyFirstColumn !== "boolean") errors.push(`${path}.stickyFirstColumn must be boolean.`);
      return;
    }
    if (raw.kind === "ALTERNATIVES") { exact(raw, ["kind", "id", "heading", "items"], path, errors); houseText(raw.heading, `${path}.heading`, errors, 200); const items = raw.items; if (!Array.isArray(items) || items.length < 1 || items.length > 50) errors.push(`${path}.items must contain 1 to 50 alternatives.`); const headings = new Set<string>(); if (Array.isArray(items)) items.forEach((item, itemIndex) => { if (!isObject(item)) { errors.push(`${path}.items[${itemIndex}] must be an object.`); return; } exact(item, ["heading", "paragraphs"], `${path}.items[${itemIndex}]`, errors); houseText(item.heading, `${path}.items[${itemIndex}].heading`, errors, 200); if (typeof item.heading === "string" && headings.has(item.heading)) errors.push(`${path}.items contains duplicate headings.`); if (typeof item.heading === "string") headings.add(item.heading); houseParagraphs(item.paragraphs, `${path}.items[${itemIndex}].paragraphs`, errors); }); return; }
    errors.push(`${path}.kind is unsupported.`);
  });
  if (verdicts > 1) errors.push("articleBody.presentation may contain at most one verdict.");
  if (methodologies > 1) errors.push("articleBody.presentation may contain at most one methodology section.");
  const guide = presentation.guide;
  if (!Array.isArray(guide) || guide.length > 20) { errors.push("articleBody.presentation.guide must contain at most 20 items."); return; }
  const targets = new Set<string>();
  guide.forEach((item, index) => { const path = `articleBody.presentation.guide[${index}]`; if (!isObject(item)) { errors.push(`${path} must be an object.`); return; } exact(item, ["targetId", "label"], path, errors); houseText(item.targetId, `${path}.targetId`, errors, 80); houseText(item.label, `${path}.label`, errors, 200); if (typeof item.targetId === "string" && (!ids.has(item.targetId) || targets.has(item.targetId))) errors.push(`${path}.targetId is missing or duplicated.`); if (typeof item.targetId === "string") targets.add(item.targetId); });
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

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function validateEditorialBaselineProvenance(
  value: Record<string, unknown>,
  errors: string[],
) {
  const provenance = value.editorialBaselineProvenance;

  if (provenance === undefined) return;

  if (!isObject(provenance)) {
    errors.push("editorialBaselineProvenance must be an object.");
    return;
  }

  validateText(provenance.baselineKey, "editorialBaselineProvenance.baselineKey", errors);
  validateText(provenance.articleKey, "editorialBaselineProvenance.articleKey", errors);
  validateText(provenance.publicPath, "editorialBaselineProvenance.publicPath", errors);

  if (provenance.articleKey !== value.articleKey) {
    errors.push("editorialBaselineProvenance.articleKey must match articleKey.");
  }

  if (provenance.publicPath !== value.path) {
    errors.push("editorialBaselineProvenance.publicPath must match path.");
  }

  if (
    typeof provenance.editorialBodySha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(provenance.editorialBodySha256)
  ) {
    errors.push("editorialBaselineProvenance.editorialBodySha256 must be a lowercase SHA-256 hex digest.");
  } else if (
    isObject(value.articleBody) &&
    value.articleBody.format === "HTML" &&
    typeof value.articleBody.content === "string" &&
    sha256(value.articleBody.content) !== provenance.editorialBodySha256
  ) {
    errors.push("editorialBaselineProvenance.editorialBodySha256 must match articleBody HTML content.");
  } else if (!isObject(value.articleBody) || value.articleBody.format !== "HTML") {
    errors.push("editorialBaselineProvenance requires an HTML articleBody.");
  }

  if (provenance.editorialApprovalStatus !== "HUMAN_APPROVED") {
    errors.push("editorialBaselineProvenance.editorialApprovalStatus must be HUMAN_APPROVED.");
  }

  if (provenance.sourceFilename !== undefined) {
    validateText(provenance.sourceFilename, "editorialBaselineProvenance.sourceFilename", errors);
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

  validateEditorialBaselineProvenance(value, errors);

  if (value.articleBody !== undefined) {
    if (!isObject(value.articleBody)) {
      errors.push("articleBody must be an object.");
    } else {
      if (value.articleBody.format === "HOUSE") {
        validateHouseBody(value.articleBody, errors);
      } else if (value.articleBody.format !== "MARKDOWN" && value.articleBody.format !== "HTML") {
        errors.push("articleBody.format must be MARKDOWN, HTML or HOUSE.");
      } else {
        validateText(value.articleBody.content, "articleBody.content", errors);
      }
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
