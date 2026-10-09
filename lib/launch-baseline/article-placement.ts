import { JAPAN_ESIM_LAUNCH_BASELINE_KEY, JapanEsimLaunchBaselineReader } from "@/lib/launch-baseline/japan-esim-launch-baseline";
import { TRAVEL_ADAPTER_EBS_005_BASELINE_KEY, TravelAdapterEbs005BaselineReader } from "@/lib/launch-baseline/travel-adapter-ebs-005";
import { FRIDGE_FREEZER_EBS_006_BASELINE_KEY, FridgeFreezerEbs006BaselineReader } from "@/lib/launch-baseline/fridge-freezer-ebs-006";
import { getLocalApprovedPackage } from "@/lib/launch-baseline/local-approved-package";

/**
 * A controlled development-only placement for the first approved article.
 * The title is read from the approved baseline so it is never duplicated in
 * the website's placement configuration.
 */
export const japanEsimLaunchPlacement = {
  id: JAPAN_ESIM_LAUNCH_BASELINE_KEY,
  href: "/development-preview/japan-esim-launch-v1",
  category: "Travel / Connectivity",
  image: { src: "/images/esim.webp", alt: "Digital SIM card illustration with electronic circuitry" },
} as const;
export const travelAdapterEbs005Placement = { id: TRAVEL_ADAPTER_EBS_005_BASELINE_KEY, href: "/development-preview/travel-adapter-ebs-005-v1", category: "Travel / Travel Accessories", summary: "A comparison of four universal travel adapters for charging a phone, tablet and laptop internationally." } as const;

export type DevelopmentArticlePlacement = Readonly<{
  id: string;
  href: string;
  category: string;
  title: string;
  summary?: string;
  image?: Readonly<{ src: string; alt: string }>;
}>;

export async function getDevelopmentArticlePlacement(): Promise<DevelopmentArticlePlacement | null> {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const baseline = await new JapanEsimLaunchBaselineReader().getApprovedBaseline();

  return { ...japanEsimLaunchPlacement, title: baseline.title };
}

export async function getDevelopmentTravelAdapterPlacement(): Promise<DevelopmentArticlePlacement | null> {
  if (process.env.NODE_ENV !== "development") return null;
  const baseline = await new TravelAdapterEbs005BaselineReader().getApprovedBaseline();
  return { ...travelAdapterEbs005Placement, title: baseline.title };
}
export async function getDevelopmentFridgeFreezerPlacement(): Promise<DevelopmentArticlePlacement | null> {
  if (process.env.NODE_ENV !== "development") return null;
  const baseline = await new FridgeFreezerEbs006BaselineReader().getApprovedBaseline();
  return { id: FRIDGE_FREEZER_EBS_006_BASELINE_KEY, href: "/development-preview/fridge-freezer-ebs-006-v1", category: "Home / Kitchen Appliances", title: baseline.title, summary: "A four-model side-by-side fridge-freezer comparison for a family home." };
}
export async function getDevelopmentCoffeeEspressoPlacement(): Promise<DevelopmentArticlePlacement | null> {
  if (process.env.NODE_ENV !== "development") return null;
  const key = "coffee-espresso-machine-ebs-007-v1";
  const article = await getLocalApprovedPackage(key);
  if (!article) return null;
  return { id: key, href: `/development-preview/${key}`, category: article.manifest.preview.category, title: article.manifest.preview.title, summary: "A comparison of four espresso machines with built-in grinders for home coffee." };
}
