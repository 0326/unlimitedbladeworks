import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { mulberry32 } from "./placement";
import { PALETTE } from "./layout";

/** 渐变穹顶（顶点着色，不受雾影响），替代纹理天空。 */
export function SkyDome() {
  const geometry = useMemo(() => {
    const g = new THREE.SphereGeometry(380, 24, 14);
    const pos = g.getAttribute("position");
    const colors = new Float32Array(pos.count * 3);
    const top = new THREE.Color(PALETTE.skyTop);
    const horizon = new THREE.Color(PALETTE.skyHorizon);
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const t = THREE.MathUtils.clamp(pos.getY(i) / 380, 0, 1);
      tmp.copy(horizon).lerp(top, Math.pow(t, 0.6));
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.BackSide,
        fog: false,
        depthWrite: false,
      }),
    [],
  );

  return <mesh geometry={geometry} material={material} renderOrder={-10} />;
}

/** 远景山体剪影：确定性圆锥合并为单一 mesh（1 draw call），在雾中形成地平线。 */
export function MountainRing() {
  const geometry = useMemo(() => {
    const rand = mulberry32(0x5eed);
    const parts: THREE.BufferGeometry[] = [];
    const count = 44;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rand() * 0.06;
      const radius = 150 + rand() * 18;
      const height = 10 + rand() * 20;
      const width = 7 + rand() * 9;
      const cone = new THREE.ConeGeometry(width, height, 5, 1);
      cone.rotateY(rand() * Math.PI);
      cone.translate(Math.cos(angle) * radius, height / 2 - 3, Math.sin(angle) * radius);
      parts.push(cone);
    }
    const merged = mergeGeometries(parts, false);
    if (!merged) throw new Error("mountain ring merge failed");
    for (const part of parts) part.dispose();
    return merged;
  }, []);

  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: PALETTE.mountain }), []);

  return <mesh geometry={geometry} material={material} />;
}
