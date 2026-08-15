import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mulberry32 } from "./placement";

/** 环境尘埃：单 Points + 整体慢旋转（无逐帧顶点更新），档位可整体关闭。 */
export function DustParticles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const rand = mulberry32(0xd057);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * 150;
      arr[i * 3 + 1] = 0.4 + rand() * 9;
      arr[i * 3 + 2] = (rand() - 0.5) * 150;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.012;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#d9c9a0"
        transparent
        opacity={0.32}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
