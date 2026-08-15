/**
 * 质量档位参数表 —— 单一来源（设计文档 §11：V0.1 只做三档）。
 * 任何场景能力的开关都必须从这里读取，不允许组件内散落魔法数字。
 */

export type QualityTier = "balanced" | "low" | "static";

export interface QualityParams {
  /** 环境剑实例数。 */
  ambientBlades: number;
  /** 尘埃粒子数。0 = 关闭。 */
  particleCount: number;
  /** Canvas DPR 上限（桌面 1.5 / 移动 1.25，见设计文档 §10）。 */
  maxDpr: number;
  shadows: boolean;
  particles: boolean;
  postProcessing: boolean;
  antialias: boolean;
  fogNear: number;
  fogFar: number;
}

export const QUALITY_PARAMS: Record<QualityTier, QualityParams> = {
  balanced: {
    ambientBlades: 2000,
    particleCount: 700,
    maxDpr: 1.5,
    shadows: true,
    particles: true,
    postProcessing: true,
    antialias: true,
    fogNear: 30,
    fogFar: 175,
  },
  low: {
    ambientBlades: 1000,
    particleCount: 0,
    maxDpr: 1,
    shadows: false,
    particles: false,
    postProcessing: false,
    antialias: false,
    fogNear: 22,
    fogFar: 125,
  },
  static: {
    ambientBlades: 0,
    particleCount: 0,
    maxDpr: 1,
    shadows: false,
    particles: false,
    postProcessing: false,
    antialias: false,
    fogNear: 0,
    fogFar: 1,
  },
};

export interface TierInput {
  webgl2: boolean;
  prefersReducedMotion: boolean;
  /** matchMedia("(pointer: coarse)")，移动端提示。 */
  coarsePointer: boolean;
  /** navigator.deviceMemory（GB），Chrome 提供的可选提示。 */
  deviceMemoryGb?: number;
}

/**
 * 初始档位决策（纯函数，可单测）：
 * - WebGL2 不可用 → static（文字档案路径）
 * - reduced-motion / 触屏 / 低内存 → low（无强制动效、无粒子后处理）
 * - 其余 → balanced
 * 运行期 frame-time 降级见 QualitySampler（balanced → low 单向）。
 */
export function resolveInitialTier(input: TierInput): QualityTier {
  if (!input.webgl2) return "static";
  if (input.prefersReducedMotion) return "low";
  if (input.coarsePointer) return "low";
  if (input.deviceMemoryGb !== undefined && input.deviceMemoryGb <= 2) return "low";
  return "balanced";
}
