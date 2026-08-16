import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getBladeVariants } from "./bladeGeometry";
import type { BladePlacement } from "./placement";

/**
 * 环境剑实例化：每个 base mesh 变体一个 InstancedMesh，
 * 共享材质 + instanceColor 变化，draw calls = 变体数（≤ VARIANT_COUNT）。
 */
export function AmbientBladeInstances({ placements }: { placements: BladePlacement[] }) {
  const variants = useMemo(() => getBladeVariants(), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        metalness: 0.85,
        roughness: 0.42,
        flatShading: true,
      }),
    [],
  );

  const groups = useMemo(() => {
    const byVariant = new Map<number, BladePlacement[]>();
    for (const p of placements) {
      const list = byVariant.get(p.variant);
      if (list) list.push(p);
      else byVariant.set(p.variant, [p]);
    }
    return [...byVariant.entries()];
  }, [placements]);

  return (
    <group name="ambient-blades">
      {groups.map(([variant, list]) => (
        <VariantInstances
          key={variant}
          geometry={variants[variant]!.geometry}
          material={material}
          placements={list}
        />
      ))}
    </group>
  );
}

/**
 * 前景框景剑：少量独立 mesh 用来建立参考稿要求的近景尺度和景深层次。
 * 它们不是档案实体，也不参与 picking。
 */
export function ForegroundBladeInstances({
  placements,
  castShadow,
}: {
  placements: BladePlacement[];
  castShadow: boolean;
}) {
  const variants = useMemo(() => getBladeVariants(), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#96734a",
        metalness: 0.8,
        roughness: 0.36,
        flatShading: true,
        emissive: "#241407",
        emissiveIntensity: 0.28,
      }),
    [],
  );
  const groups = useMemo(() => {
    const byVariant = new Map<number, BladePlacement[]>();
    for (const placement of placements) {
      const list = byVariant.get(placement.variant);
      if (list) list.push(placement);
      else byVariant.set(placement.variant, [placement]);
    }
    return [...byVariant.entries()];
  }, [placements]);

  return (
    <group name="foreground-blades">
      {groups.map(([variantIndex, list]) => {
        const variant = variants[variantIndex];
        if (!variant) return null;
        return (
          <ForegroundVariantInstances
            key={variantIndex}
            geometry={variant.geometry}
            material={material}
            placements={list}
            castShadow={castShadow}
          />
        );
      })}
    </group>
  );
}

function ForegroundVariantInstances({
  geometry,
  material,
  placements,
  castShadow,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  placements: BladePlacement[];
  castShadow: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null!);

  useLayoutEffect(() => {
    const mesh = ref.current;
    const dummy = new THREE.Object3D();
    placements.forEach((placement, index) => {
      dummy.position.set(placement.x, placement.y, placement.z);
      dummy.rotation.set(placement.tiltX, placement.rotY, placement.tiltZ);
      dummy.scale.setScalar(placement.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [placements]);

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, placements.length]}
      castShadow={castShadow}
      frustumCulled={false}
    />
  );
}

function VariantInstances({
  geometry,
  material,
  placements,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  placements: BladePlacement[];
}) {
  const ref = useRef<THREE.InstancedMesh>(null!);

  useLayoutEffect(() => {
    const mesh = ref.current;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    placements.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.tiltX, p.rotY, p.tiltZ);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      // 钢色带暖色漂移的材质变化
      color.setHSL(0.09 + p.tint * 0.03, 0.08 + p.tint * 0.15, 0.3 + p.tint * 0.25);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [placements, geometry]);

  return (
    <instancedMesh ref={ref} args={[geometry, material, placements.length]} frustumCulled={false} />
  );
}
