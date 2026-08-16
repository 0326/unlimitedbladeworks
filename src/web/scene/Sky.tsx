import { useMemo } from "react";
import * as THREE from "three";
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
  const geometries = useMemo(() => {
    const makeRidge = (seed: number, scale: number) => {
      const rand = mulberry32(seed);
      const shape = new THREE.Shape();
      const steps = 34;
      shape.moveTo(-180, 0);
      for (let i = 0; i <= steps; i++) {
        const x = -180 + (360 / steps) * i;
        const broad = 7 + Math.sin(i * 0.72 + seed) * 4;
        const peak = rand() * 14;
        shape.lineTo(x, (broad + peak) * scale);
      }
      shape.lineTo(180, 0);
      shape.closePath();
      return new THREE.ShapeGeometry(shape);
    };
    return [makeRidge(0x5eed, 1), makeRidge(0x42d1, 0.62)];
  }, []);

  const materials = useMemo(
    () => [
      new THREE.MeshBasicMaterial({ color: PALETTE.mountain, fog: true }),
      new THREE.MeshBasicMaterial({
        color: "#151317",
        transparent: true,
        opacity: 0.72,
        fog: true,
      }),
    ],
    [],
  );

  return (
    <group>
      <mesh geometry={geometries[0]} material={materials[0]} position={[0, -14, -155]} />
      <mesh geometry={geometries[1]} material={materials[1]} position={[0, -10, -188]} />
    </group>
  );
}

/** 低成本原创云层：软块状纹理叠在地平线后方，避免纯色渐变像技术占位。 */
export function CloudLayer() {
  const texture = useMemo(() => makeCloudTexture(), []);
  return (
    <group position={[0, 24, -110]}>
      <mesh renderOrder={-6}>
        <planeGeometry args={[300, 105]} />
        <meshBasicMaterial
          map={texture}
          color="#d0a26e"
          transparent
          opacity={0.27}
          depthWrite={false}
          depthTest={false}
          side={THREE.DoubleSide}
          fog={false}
        />
      </mesh>
    </group>
  );
}

/**
 * 日食光环（设计稿 01 的标志性天体）：暗盘 + 金环 + 径向辉光。
 * 全部 Basic 材质不受雾/光照影响，3 个 mesh 低成本。
 */
export function Eclipse() {
  const glowTexture = useMemo(() => makeGlowTexture(), []);
  return (
    <group position={[0, 155, -180]}>
      {/* 辉光 */}
      <mesh renderOrder={-9}>
        <planeGeometry args={[88, 88]} />
        <meshBasicMaterial
          map={glowTexture}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
          fog={false}
        />
      </mesh>
      {/* 暗盘 */}
      <mesh renderOrder={-8}>
        <circleGeometry args={[10.2, 48]} />
        <meshBasicMaterial color="#020304" fog={false} depthTest={false} depthWrite={false} />
      </mesh>
      {/* 金环 */}
      <mesh renderOrder={-7}>
        <ringGeometry args={[10.1, 11.0, 64]} />
        <meshBasicMaterial
          color="#f0cf92"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
          fog={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** Canvas 径向渐变辉光纹理（暖金 → 透明）。 */
function makeGlowTexture(): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(240, 207, 146, 0.55)");
    gradient.addColorStop(0.28, "rgba(216, 164, 90, 0.28)");
    gradient.addColorStop(0.62, "rgba(120, 84, 40, 0.1)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeCloudTexture(): THREE.Texture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, size, size);
    const rand = mulberry32(0xc10ad);
    for (let i = 0; i < 70; i++) {
      const x = rand() * size;
      const y = rand() * size * 0.72;
      const radius = 18 + rand() * 72;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, "rgba(255, 214, 160, 0.28)");
      gradient.addColorStop(0.6, "rgba(125, 96, 68, 0.12)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
