import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { VARIANT_COUNT } from "./placement";

/**
 * 程序化低模刀剑 base meshes（10 个变体，每个 ~60–200 tris，零外部资产）。
 * 约定：局部原点在插地端，整体沿 +Y，单位总高约 1.3–1.6，实例再按 scale 放大。
 * Phase 2 的资产流水线（A-01）落地后可替换为优化 GLB，接口保持不变。
 */

export interface BladeVariant {
  geometry: THREE.BufferGeometry;
  triCount: number;
}

function mergeParts(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(parts, false);
  if (!merged) throw new Error("blade variant merge failed");
  for (const part of parts) part.dispose();
  return merged;
}

/** 刀身：4 边圆台压扁成菱形截面，可选弯曲（katana/scimitar）。 */
function bladePart(len: number, width: number, flat: number, curve: number): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(0.012, width * 0.55, len, 4, 1);
  g.scale(1, 1, flat);
  g.translate(0, 0.3 + len / 2, 0);
  if (curve > 0) {
    const pos = g.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = Math.max(0, (y - 0.3) / len);
      pos.setX(i, pos.getX(i) + curve * t * t);
    }
    pos.needsUpdate = true;
  }
  return g;
}

function crossGuard(width: number, y = 0.3): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(width, 0.045, 0.05);
  g.translate(0, y, 0);
  return g;
}

function discGuard(y = 0.3): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(0.1, 0.1, 0.03, 10);
  g.translate(0, y, 0);
  return g;
}

function gripPart(len: number, r = 0.035): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(r, r * 0.92, len, 6);
  g.translate(0, 0.29 - len / 2, 0);
  return g;
}

function pommelPart(len: number, r = 0.045): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(r, 8, 6);
  g.translate(0, 0.29 - len - r, 0);
  return g;
}

const VARIANT_FACTORIES: Array<() => THREE.BufferGeometry> = [
  // 0 katana
  () =>
    mergeParts([
      bladePart(1.02, 0.05, 0.32, 0.1),
      discGuard(),
      gripPart(0.28),
      pommelPart(0.28, 0.04),
    ]),
  // 1 longsword
  () =>
    mergeParts([bladePart(1.05, 0.06, 0.34, 0), crossGuard(0.3), gripPart(0.26), pommelPart(0.26)]),
  // 2 jian
  () =>
    mergeParts([
      bladePart(0.95, 0.042, 0.3, 0),
      crossGuard(0.16),
      gripPart(0.26, 0.032),
      pommelPart(0.26, 0.04),
    ]),
  // 3 saber
  () =>
    mergeParts([
      bladePart(0.92, 0.062, 0.34, 0.16),
      crossGuard(0.14),
      gripPart(0.24),
      pommelPart(0.24, 0.04),
    ]),
  // 4 dagger
  () =>
    mergeParts([
      bladePart(0.5, 0.05, 0.36, 0),
      crossGuard(0.18, 0.26),
      gripPart(0.2, 0.03),
      pommelPart(0.2, 0.045),
    ]),
  // 5 spatha
  () =>
    mergeParts([
      bladePart(1.15, 0.045, 0.3, 0),
      crossGuard(0.2, 0.28),
      gripPart(0.24, 0.032),
      pommelPart(0.24, 0.04),
    ]),
  // 6 scimitar
  () =>
    mergeParts([
      bladePart(0.9, 0.055, 0.32, 0.22),
      discGuard(0.28),
      gripPart(0.24, 0.032),
      pommelPart(0.24, 0.04),
    ]),
  // 7 greatsword
  () =>
    mergeParts([
      bladePart(1.2, 0.075, 0.38, 0),
      crossGuard(0.4, 0.34),
      gripPart(0.34, 0.042),
      pommelPart(0.34, 0.055),
    ]),
  // 8 gladius
  () =>
    mergeParts([
      bladePart(0.62, 0.065, 0.4, 0),
      crossGuard(0.2, 0.26),
      gripPart(0.22, 0.034),
      pommelPart(0.22, 0.05),
    ]),
  // 9 spear
  () => {
    const shaft = new THREE.CylinderGeometry(0.02, 0.02, 1.45, 6);
    shaft.translate(0, 0.72, 0);
    const head = new THREE.CylinderGeometry(0, 0.035, 0.24, 4);
    head.scale(1, 1, 0.4);
    head.translate(0, 1.42, 0);
    const collar = new THREE.CylinderGeometry(0.032, 0.032, 0.04, 6);
    collar.translate(0, 1.28, 0);
    return mergeParts([shaft, head, collar]);
  },
];

let cache: BladeVariant[] | null = null;

export function getBladeVariants(): BladeVariant[] {
  if (!cache) {
    cache = VARIANT_FACTORIES.map((factory) => {
      const geometry = factory();
      geometry.computeVertexNormals();
      const index = geometry.getIndex();
      const triCount = index ? index.count / 3 : geometry.getAttribute("position").count / 3;
      return { geometry, triCount };
    });
    if (cache.length !== VARIANT_COUNT) {
      throw new Error(`blade variant count mismatch: ${cache.length} !== ${VARIANT_COUNT}`);
    }
  }
  return cache;
}

/** Artifact 与变体的固定对应（Phase 2 换 GLB 后由 asset manifest 决定）。 */
export const ARTIFACT_VARIANT: Record<string, number> = {
  "calibration-katana": 0,
  "calibration-longsword": 1,
};
