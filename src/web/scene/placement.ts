/**
 * 环境剑的可复现放置（纯模块，不含 three 依赖，可单测）。
 * 同一 seed 在任何设备上生成完全一致的剑场。
 */

/** base mesh 变体数（bladeGeometry.ts 必须与此一致）。 */
export const VARIANT_COUNT = 10;

export const FIELD_RADIUS = 88;
const MIN_SPACING = 0.9;
const CENTER_CLEAR_RADIUS = 4;
const ANCHOR_CLEAR_RADIUS = 3.5;

/** Artifact Blade 固定锚点（不随机），保证测试与交互位置稳定。 */
export interface PlacementAnchor {
  slug: string;
  x: number;
  z: number;
}

export const ARTIFACT_ANCHORS: PlacementAnchor[] = [
  { slug: "calibration-katana", x: -7, z: -16 },
  { slug: "calibration-longsword", x: 9, z: -12 },
];

/** mulberry32 PRNG：32 位 seed，快速且跨运行确定性。 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 地形高度场：确定性纯函数，Terrain 网格与剑的插地深度共用，
 * 保证实例永远贴地。边缘抬升形成盆地感。
 */
export function terrainHeight(x: number, z: number): number {
  let h = Math.sin(x * 0.0765 + 1.3) * Math.cos(z * 0.0646 - 0.7) * 1.15;
  h += Math.sin(x * 0.012 - 0.4) * Math.cos(z * 0.015 + 2.1) * 2.2;
  h += Math.sin(x * 0.11 + z * 0.09) * 0.25;
  const r = Math.hypot(x, z);
  h += Math.max(0, r - 70) * 0.12;
  return h;
}

export interface PlacementSpec {
  seed: number;
  count: number;
}

export interface BladePlacement {
  x: number;
  y: number;
  z: number;
  rotY: number;
  tiltX: number;
  tiltZ: number;
  scale: number;
  variant: number;
  /** 0..1 材质变化因子。 */
  tint: number;
}

/**
 * 拒绝采样 + 空间哈希生成放置：
 * - 圆盘均匀分布，避开中心与 Artifact 锚点
 * - 任意两把剑间距 ≥ MIN_SPACING
 * - attempts 上限 + 饱和检测（连续拒绝）保证在极端 count 下也能快速终止
 *
 * 网格用数值 key（(cx+512)*2048+(cz+512)，坐标范围 ±110 内安全），
 * 避免大 count 下字符串拼接的开销。
 */
const GRID_OFFSET = 512;
function cellKey(cx: number, cz: number): number {
  return (cx + GRID_OFFSET) * 2048 + (cz + GRID_OFFSET);
}

export function generatePlacements(spec: PlacementSpec): BladePlacement[] {
  const rand = mulberry32(spec.seed);
  const placed: BladePlacement[] = [];
  const cell = MIN_SPACING;
  const grid = new Map<number, number[]>();
  const maxAttempts = spec.count * 40;
  // 场地容量约数万；连续 STALL_LIMIT 次拒绝即视为饱和（误判概率趋近 0，
  // 因为未饱和时接受率 > 0，连续 5 万次全被拒的概率可忽略）
  const STALL_LIMIT = 50_000;
  let consecutiveRejects = 0;

  for (let i = 0; i < maxAttempts && placed.length < spec.count; i++) {
    const angle = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * FIELD_RADIUS;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    if (Math.hypot(x, z) < CENTER_CLEAR_RADIUS) {
      consecutiveRejects++;
      if (consecutiveRejects >= STALL_LIMIT) break;
      continue;
    }
    if (ARTIFACT_ANCHORS.some((a) => Math.hypot(x - a.x, z - a.z) < ANCHOR_CLEAR_RADIUS)) {
      consecutiveRejects++;
      if (consecutiveRejects >= STALL_LIMIT) break;
      continue;
    }

    const cx = Math.floor(x / cell);
    const cz = Math.floor(z / cell);
    let clash = false;
    for (let dx = -1; dx <= 1 && !clash; dx++) {
      for (let dz = -1; dz <= 1 && !clash; dz++) {
        const list = grid.get(cellKey(cx + dx, cz + dz));
        if (!list) continue;
        for (const idx of list) {
          const p = placed[idx];
          if (p === undefined) continue;
          const ddx = p.x - x;
          const ddz = p.z - z;
          if (ddx * ddx + ddz * ddz < MIN_SPACING * MIN_SPACING) {
            clash = true;
            break;
          }
        }
      }
    }
    if (clash) {
      consecutiveRejects++;
      if (consecutiveRejects >= STALL_LIMIT) break;
      continue;
    }

    consecutiveRejects = 0;
    const key = cellKey(cx, cz);
    let list = grid.get(key);
    if (!list) {
      list = [];
      grid.set(key, list);
    }
    list.push(placed.length);
    placed.push({
      x,
      z,
      y: terrainHeight(x, z) - 0.12,
      rotY: rand() * Math.PI * 2,
      tiltX: (rand() - 0.5) * 0.22,
      tiltZ: (rand() - 0.5) * 0.22,
      scale: 1.4 + rand() * 1.2,
      variant: Math.floor(rand() * VARIANT_COUNT),
      tint: rand(),
    });
  }
  return placed;
}
