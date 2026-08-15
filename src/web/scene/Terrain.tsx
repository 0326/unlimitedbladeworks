import { useMemo } from "react";
import * as THREE from "three";
import { terrainHeight } from "./placement";
import { PALETTE } from "./layout";

/** 程序化噪声地形：顶点着色 + flat shading，零纹理传输。 */
export function Terrain({ receiveShadow }: { receiveShadow: boolean }) {
  const geometry = useMemo(() => {
    const size = 320;
    const segments = 96;
    const g = new THREE.PlaneGeometry(size, size, segments, segments);
    g.rotateX(-Math.PI / 2);
    const pos = g.getAttribute("position");
    const colors = new Float32Array(pos.count * 3);
    const low = new THREE.Color(PALETTE.terrainLow);
    const high = new THREE.Color(PALETTE.terrainHigh);
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = terrainHeight(x, z);
      pos.setY(i, h);
      const t = THREE.MathUtils.clamp((h + 2) / 8, 0, 1);
      tmp.copy(low).lerp(high, t);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow={receiveShadow}>
      <meshStandardMaterial vertexColors flatShading roughness={0.95} metalness={0.05} />
    </mesh>
  );
}
