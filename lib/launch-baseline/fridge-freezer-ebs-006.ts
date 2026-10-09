import { ApprovedLaunchBaselineReader, type ApprovedLaunchBaseline } from "./approved-launch-baseline";
export const FRIDGE_FREEZER_EBS_006_BASELINE_KEY = "fridge-freezer-ebs-006-v1";
export const FRIDGE_FREEZER_EBS_006_SHA256 = "db70f5586a5ffad4b58b6b6f4eb6afcd2d5f82e393faa01d43cd6b62ded0b8a0";
export const fridgeFreezerEbs006Tables = {
  scenario: { presentation: "SCENARIO_TABLE", rows: [["Requirement", "Our scenario"], ["Appliance type", "Side-by-side fridge-freezer"], ["Household", "Family home"], ["Main priority", "Generous refrigerator and freezer storage"], ["Everyday features", "Filtered water, ice dispensing and practical storage"], ["Buying considerations", "Capacity, usable space, temperature performance and overall value"]] },
  comparison: { presentation: "COMPARISON_TABLE", heading: "Fridge-freezer", columns: ["Price checked*", "Main consideration"], rows: [["Samsung RS27T5200SR — Our pick", "$1,394 retailer", "Largest advertised capacity and strong everyday storage"], ["GE GSS25GYPFS", "$1,799 clearance", "Higher tested ice production and consistent main-shelf temperatures"], ["LG LS27T3230S", "$1,399", "Generous capacity and connected features"], ["Whirlpool WRS325SDHZ", "$1,399", "Practical storage specification and adjustable shelving"]] },
} as const;
export type FridgeFreezerEbs006Baseline = ApprovedLaunchBaseline;
export class FridgeFreezerEbs006BaselineReader extends ApprovedLaunchBaselineReader {
  constructor(url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY, fetcher: typeof fetch = fetch) { super({ baselineKey: FRIDGE_FREEZER_EBS_006_BASELINE_KEY, articleKey: "side-by-side-fridge-freezer-comparison", publicPath: "/home/kitchen-appliances/side-by-side-fridge-freezer-comparison" }, url, key, fetcher); }
}
