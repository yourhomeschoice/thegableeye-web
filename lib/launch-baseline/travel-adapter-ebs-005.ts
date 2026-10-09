import { ApprovedLaunchBaselineReader, type ApprovedLaunchBaseline } from "./approved-launch-baseline";

export const TRAVEL_ADAPTER_EBS_005_BASELINE_KEY = "travel-adapter-ebs-005-v1";
export const TRAVEL_ADAPTER_EBS_005_SHA256 = "0682067e3b7b17c7cdc39b9e059dcddbff13e74133205661e32d020ae36a4d7f";
export const travelAdapterEbs005Scenario = { destinations: ["USA", "Europe", "Australia", "Japan"], devices: ["Phone", "tablet", "laptop"], charging_requirement: "Multiple devices during the same trip", product_preference: "One versatile travel adapter" } as const;
export const travelAdapterEbs005Tables = {
  scenario: { presentation: "SCENARIO_TABLE", rows: [["Requirement", "Our scenario"], ["Destinations", "USA, Europe, Australia and Japan"], ["Devices", "Phone, tablet and laptop"], ["Charging priority", "Multiple devices during the same trip"], ["Product preference", "One versatile travel adapter"]] },
  comparison: { presentation: "COMPARISON_TABLE", heading: "Adapter", columns: ["Price checked*", "Main consideration"], rows: [["EPICKA TA-105 Pro — Our pick", "$39.99", "Strong overall multi-device charging capability"], ["Anker Nano Travel Adapter A9215", "$25.99", "Lighter, more compact alternative"], ["Ceptics UP-70KU", "$39.99", "Another capable multi-device option"], ["TESSAN WTA09", "$47.99", "Multiple connections and higher-powered USB-C charging"]] },
} as const;
export type TravelAdapterEbs005Baseline = ApprovedLaunchBaseline;

/** The approved adapter article has no approved supplier-package snapshot; do not invent one. */
export class TravelAdapterEbs005BaselineReader extends ApprovedLaunchBaselineReader {
  constructor(url = process.env.SUPABASE_URL, serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY, fetcher: typeof fetch = fetch) {
    super({ baselineKey: TRAVEL_ADAPTER_EBS_005_BASELINE_KEY, articleKey: "universal-travel-adapter-comparison", publicPath: "/travel/travel-accessories/universal-travel-adapter-comparison" }, url, serviceRoleKey, fetcher);
  }
}
