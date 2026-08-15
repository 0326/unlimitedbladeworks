import { useEffect, useRef } from "react";
import type { ComponentRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { CAMERA_INTRO_END, CAMERA_INTRO_START, CAMERA_TARGET, INTRO_DURATION_MS } from "./layout";

/**
 * 相机：开场推进（可跳过/reduced-motion 直接跳过）+ 受限 OrbitControls。
 * Reset 通过 window 事件 'field:reset-camera' 触发（页面工具栏按钮）。
 */
export function FieldCamera({
  introActive,
  onIntroDone,
}: {
  introActive: boolean;
  onIntroDone: () => void;
}) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const camera = useThree((s) => s.camera);
  const elapsedMs = useRef(0);

  useEffect(() => {
    window.addEventListener("field:reset-camera", resetControls);
    return () => window.removeEventListener("field:reset-camera", resetControls);
  }, []);

  useEffect(() => {
    if (introActive) {
      elapsedMs.current = 0;
      camera.position.copy(CAMERA_INTRO_START);
      camera.lookAt(CAMERA_TARGET);
    } else {
      // 跳过/完成/降级：直接落位并保存为 reset 基准
      camera.position.copy(CAMERA_INTRO_END);
      camera.lookAt(CAMERA_TARGET);
      const controls = controlsRef.current;
      if (controls) {
        controls.target.copy(CAMERA_TARGET);
        controls.update();
        controls.saveState();
      }
    }
  }, [introActive, camera]);

  useFrame((_, delta) => {
    if (!introActive) return;
    elapsedMs.current += delta * 1000;
    const k = Math.min(1, elapsedMs.current / INTRO_DURATION_MS);
    const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    camera.position.lerpVectors(CAMERA_INTRO_START, CAMERA_INTRO_END, eased);
    camera.lookAt(CAMERA_TARGET);
    if (k >= 1) onIntroDone();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={!introActive}
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      minDistance={7}
      maxDistance={70}
      minPolarAngle={0.15}
      maxPolarAngle={1.45}
      target={[CAMERA_TARGET.x, CAMERA_TARGET.y, CAMERA_TARGET.z]}
    />
  );

  function resetControls() {
    controlsRef.current?.reset();
  }
}
