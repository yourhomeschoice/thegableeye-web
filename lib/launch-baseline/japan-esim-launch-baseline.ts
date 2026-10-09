import { ApprovedLaunchBaselineReader, type ApprovedLaunchBaseline } from "./approved-launch-baseline";

export const JAPAN_ESIM_LAUNCH_BASELINE_KEY = "japan-esim-launch-v1";
export type JapanEsimLaunchBaseline = ApprovedLaunchBaseline;

/** Japan's approved supplier-package evidence remains a Japan-specific requirement. */
export class JapanEsimLaunchBaselineReader extends ApprovedLaunchBaselineReader {
  constructor(url = process.env.SUPABASE_URL, serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY, fetcher: typeof fetch = fetch) {
    super({ baselineKey: JAPAN_ESIM_LAUNCH_BASELINE_KEY, articleKey: "japan-esims-compared", publicPath: "/travel/esims/japan-esims-compared", requiresRecommendedSupplierPackage: true }, url, serviceRoleKey, fetcher);
  }
}
