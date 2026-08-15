import type { QualityTier } from "./quality";

/** window.__fieldDebug：?debug=1 时由 DebugBridge 更新，供 e2e 与 profiling 脚本读取。 */
export interface FieldDebugData {
  tier: QualityTier;
  instances: number;
  frameloop: "always" | "never";
  introDone: boolean;
  fps: number;
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
  /** Artifact 世界坐标投影到屏幕后的客户端像素坐标。 */
  artifacts: { slug: string; x: number; y: number }[];
}

declare global {
  interface Window {
    __fieldDebug?: FieldDebugData;
  }
}

export type { FieldDebugData as FieldDebugDataType };
