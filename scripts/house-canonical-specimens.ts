import { execFileSync } from "node:child_process";
import type { RecommendationComparisonArticle } from "../lib/publication/types.ts";

type WordDocument = { paragraphs: string[]; tables: string[][][] };

function readWordDocument(file: string): WordDocument {
  return JSON.parse(
    execFileSync(
      "powershell.exe",
      [
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        "scripts/read-house-docx.ps1",
        "-Path",
        file,
      ],
      { encoding: "utf8" },
    ),
  ) as WordDocument;
}

function comparisonTable(
  id: string,
  heading: string,
  rows: string[][],
  introduction?: string,
) {
  return {
    kind: "COMPARISON" as const,
    id,
    heading,
    ...(introduction ? { introduction: [introduction] } : {}),
    columns: rows[0].map((label, index) => ({
      key: index === 0 ? "subject" : `column-${index}`,
      label,
    })),
    rows: rows.slice(1).map(([subject, ...cells]) => ({ subject, cells })),
    stickyFirstColumn: true,
  };
}

function alternatives(
  id: string,
  heading: string,
  paragraphs: string[],
  start: number,
) {
  return {
    kind: "ALTERNATIVES" as const,
    id,
    heading,
    items: Array.from({ length: 9 }, (_, index) => ({
      heading: paragraphs[start + index * 2],
      paragraphs: [paragraphs[start + index * 2 + 1]],
    })),
  };
}

export const housePublicationIdentities = {
  A001: {
    articleKey: "slow-cookers-compared",
    path: "/home/slow-cookers-compared",
    category: "Home",
    subcategory: "Kitchen",
  },
  A002: {
    articleKey: "clothes-dryers-compared",
    path: "/home/clothes-dryers-compared",
    category: "Home",
    subcategory: "Appliances",
  },
} as const;

export function buildA001HousePublication(): RecommendationComparisonArticle {
  const word = readWordDocument("editorial-sources/A001_Slow_Cooker.docx");
  const paragraphs = word.paragraphs;
  const identity = housePublicationIdentities.A001;

  return {
    publicationStatus: "PUBLISHED",
    path: identity.path,
    slug: "slow-cookers-compared",
    category: identity.category,
    subcategory: identity.subcategory,
    articleType: "Comparison",
    title: paragraphs[1],
    standfirst: paragraphs[2],
    author: "The Gable Eye Editorial",
    lastResearched: "2026-10-22",
    image: {
      src: "/images/A001_Slow_Cooker.webp",
      alt: "Illustrative slow cooker in a kitchen setting",
      width: 1600,
      height: 900,
      caption: "AI-generated illustrative imagery.",
    },
    articleBody: {
      format: "HOUSE",
      presentation: {
        guide: [
          { targetId: "verdict", label: "Our verdict" },
          { targetId: "comparison", label: "Comparison at a glance" },
          { targetId: "alternatives", label: "How alternatives compare" },
          { targetId: "guidance", label: "What to check" },
          { targetId: "methodology", label: "How we compared" },
        ],
        sections: [
          { kind: "TEXT", id: "scenario", heading: paragraphs[3], paragraphs: [paragraphs[4]] },
          { kind: "VERDICT", id: "verdict", paragraphs: [paragraphs[6]] },
          { kind: "TEXT", id: "configuration", heading: paragraphs[7], paragraphs: [paragraphs[8]] },
          comparisonTable("comparison", paragraphs[9], word.tables[0]),
          alternatives("alternatives", paragraphs[10], paragraphs, 11),
          { kind: "TEXT", id: "conclusion", heading: paragraphs[29], paragraphs: [paragraphs[30]] },
          {
            kind: "TEXT",
            id: "guidance",
            heading: paragraphs[31],
            subsections: [
              { heading: "Capacity and vessel", paragraphs: [paragraphs[32]] },
              { heading: "Timer and Warm behaviour", paragraphs: [paragraphs[33]] },
              { heading: "Handling and cleaning", paragraphs: [paragraphs[34]] },
            ],
          },
          { kind: "TEXT", id: "methodology", heading: paragraphs[35], paragraphs: [paragraphs[36]], role: "METHODOLOGY" },
        ],
      },
    },
  };
}

export function buildA002HousePublication(): RecommendationComparisonArticle {
  const word = readWordDocument("editorial-sources/A002_Clothes_Dryer.docx");
  const paragraphs = word.paragraphs;
  const identity = housePublicationIdentities.A002;

  return {
    publicationStatus: "PUBLISHED",
    path: identity.path,
    slug: "clothes-dryers-compared",
    category: identity.category,
    subcategory: identity.subcategory,
    articleType: "Comparison",
    title: paragraphs[0],
    standfirst: paragraphs[1],
    author: "The Gable Eye Editorial",
    lastResearched: "2026-10-22",
    image: {
      src: "/images/A002_Clothes_Dryer.jpg",
      alt: "Illustrative clothes dryer in a home laundry room",
      width: 1600,
      height: 900,
      caption: "Illustrative imagery; it does not depict a verified model or hands-on testing.",
    },
    articleBody: {
      format: "HOUSE",
      presentation: {
        guide: [
          { targetId: "verdict", label: "Our verdict" },
          { targetId: "comparison", label: "Comparison at a glance" },
          { targetId: "alternatives", label: "How alternatives compare" },
          { targetId: "guidance", label: "What to check" },
          { targetId: "methodology", label: "How we compared" },
        ],
        sections: [
          { kind: "TEXT", id: "scenario", heading: paragraphs[2], paragraphs: [paragraphs[3]] },
          { kind: "VERDICT", id: "verdict", paragraphs: paragraphs.slice(5, 10) },
          { kind: "TEXT", id: "configuration", heading: paragraphs[10], paragraphs: paragraphs.slice(11, 13) },
          comparisonTable("comparison", paragraphs[13], word.tables[0], paragraphs[14]),
          alternatives("alternatives", paragraphs[15], paragraphs, 16),
          { kind: "TEXT", id: "conclusion", heading: paragraphs[34], paragraphs: paragraphs.slice(35, 37) },
          { kind: "TEXT", id: "guidance", heading: paragraphs[37], paragraphs: paragraphs.slice(38, 41) },
          { kind: "TEXT", id: "methodology", heading: paragraphs[41], paragraphs: [paragraphs[42]], role: "METHODOLOGY" },
        ],
      },
    },
  };
}
