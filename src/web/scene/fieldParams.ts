import type { QualityTier } from "./quality";

/** Field 页 URL 参数（?tier=&instances=&debug=），用于测试阶梯与手动档位。 */
export const TIERS: readonly QualityTier[] = ["balanced", "low", "static"];
export const INSTANCE_MIN = 100;
export const INSTANCE_MAX = 4000;

export interface FieldParamsConfig {
  tierOverride: QualityTier | null;
  instancesOverride: number | null;
  debug: boolean;
}

export function parseFieldParams(search: string): FieldParamsConfig {
  const params = new URLSearchParams(search);
  const tierRaw = params.get("tier");
  const tierOverride = TIERS.includes(tierRaw as QualityTier) ? (tierRaw as QualityTier) : null;

  const instancesRaw = Number.parseInt(params.get("instances") ?? "", 10);
  const instancesOverride = Number.isFinite(instancesRaw)
    ? Math.min(INSTANCE_MAX, Math.max(INSTANCE_MIN, instancesRaw))
    : null;

  const debugRaw = params.get("debug");
  return {
    tierOverride,
    instancesOverride,
    debug: debugRaw === "1" || debugRaw === "true",
  };
}
