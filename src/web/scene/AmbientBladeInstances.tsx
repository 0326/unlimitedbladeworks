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
