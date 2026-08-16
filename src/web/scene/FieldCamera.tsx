import { useEffect, useRef } from "react";
import type { ComponentRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  CAMERA_HOME_TARGET,
  CAMERA_INTRO_END,
  CAMERA_INTRO_START,
  CAMERA_TARGET,
  INTRO_DURATION_MS,
} from "./layout";

export type FieldMode = "home" | "transition" | "explore" | "focused";

/** WASD/方向键平移速度（单位/秒）与活动半径。 */
const PAN_SPEED = 10;
const PAN_RADIUS = 46;
const HEADING_REPORT_MS = 150;
const FOCUS_DURATION_MS = 760;
const FOCUS_OFFSET = new THREE.Vector3(5.5, 4.1, 10.5);

/**
 * 相机三态机（设计稿 01→02）：
 * - home：停在远景位，轻微环境漂移（driftEnabled 时），等待 ENTER
 * - transition：ENTER 后推进到探索位，完成后 onIntroDone
 * - explore：受限 OrbitControls + WASD 平移 + 方位角上报（罗盘）
 * Reset 通过 window 事件 'field:reset-camera' 触发。
 */
export function FieldCamera({
  mode,
  driftEnabled,
  onIntroDone,
  onHeading,
  focusTarget,
}: {
  mode: FieldMode;
  driftEnabled: boolean;
  onIntroDone: () => void;
  onHeading?: (radians: number) => void;
  focusTarget?: [number, number, number];
}) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const camera = useThree((s) => s.camera);
  const elapsedMs = useRef(0);
  const driftMs = useRef(0);
  const keys = useRef(new Set<string>());
  const lastHeadingAt = useRef(0);
  const focusElapsedMs = useRef(0);
  const focusStartPosition = useRef(new THREE.Vector3());
  const focusStartTarget = useRef(new THREE.Vector3());
  const focusEndPosition = useRef(new THREE.Vector3());
  const focusEndTarget = useRef(new THREE.Vector3());
  const transitionStartPosition = useRef(new THREE.Vector3());
  const transitionEndPosition = useRef(CAMERA_INTRO_END.clone());
  const previousMode = useRef<FieldMode>(mode);

  useEffect(() => {
    window.addEventListener("field:reset-camera", resetControls);
    return () => window.removeEventListener("field:reset-camera", resetControls);
  }, []);

  // WASD/方向键：explore 模式平移（设计稿 02 底部 WASD MOVE 提示）
  useEffect(() => {
    if (mode !== "explore") return;
    const tracked = new Set([
      "w",
      "a",
      "s",
      "d",
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
    ]);
    const pressed = keys.current;
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!tracked.has(key)) return;
      pressed.add(key);
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => pressed.delete(e.key.toLowerCase());
    const clear = () => pressed.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      pressed.clear();
    };
  }, [mode]);

  useEffect(() => {
    if (mode === "home") {
      driftMs.current = 0;
      camera.position.copy(CAMERA_INTRO_START);
      camera.lookAt(CAMERA_HOME_TARGET);
    } else if (mode === "transition") {
      elapsedMs.current = 0;
      // Capture the actual resting position (including idle drift) and only dolly
      // toward the existing Explore position. The look target never jumps.
      transitionStartPosition.current.copy(camera.position);
    } else if (mode === "explore") {
      // 关闭 Selected 后回到进入聚焦前的镜头，而不是把用户探索位置重置掉。
      const returningFromFocus = previousMode.current === "focused";
      const completedDolly = previousMode.current === "transition";
      if (returningFromFocus) {
        camera.position.copy(focusStartPosition.current);
        camera.lookAt(focusStartTarget.current);
      } else if (!completedDolly) {
        camera.position.copy(CAMERA_INTRO_END);
        camera.lookAt(CAMERA_TARGET);
      }
      const controls = controlsRef.current;
      if (controls) {
        controls.target.copy(returningFromFocus ? focusStartTarget.current : CAMERA_TARGET);
        controls.update();
        controls.saveState();
      }
    } else if (mode === "focused") {
      // Selected 状态从当前 Explore 相机开始，不重置视角再跳到目标。
      focusElapsedMs.current = 0;
      focusStartPosition.current.copy(camera.position);
      focusStartTarget.current.copy(controlsRef.current?.target ?? CAMERA_TARGET);
      const target = focusTarget
        ? new THREE.Vector3(focusTarget[0], focusTarget[1], focusTarget[2])
        : CAMERA_TARGET.clone();
      focusEndTarget.current.copy(target);
      focusEndPosition.current.copy(target).add(FOCUS_OFFSET);
    }
    previousMode.current = mode;
  }, [mode, camera, focusTarget]);

  useFrame((state, delta) => {
    if (mode === "home") {
      if (!driftEnabled) return;
      // 环境漂移：极缓的呼吸式推移，保证首页是"活的"（reduced-motion 关闭）
      driftMs.current += delta * 1000;
      const t = driftMs.current / 1000;
      camera.position.set(
        CAMERA_INTRO_START.x + Math.sin(t * 0.11) * 1.4,
        CAMERA_INTRO_START.y + Math.sin(t * 0.07) * 0.5,
        CAMERA_INTRO_START.z + Math.sin(t * 0.05) * 1.8,
      );
      camera.lookAt(CAMERA_HOME_TARGET);
      return;
    }

    if (mode === "transition") {
      elapsedMs.current += delta * 1000;
      const k = Math.min(1, elapsedMs.current / INTRO_DURATION_MS);
      const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      camera.position.lerpVectors(
        transitionStartPosition.current,
        transitionEndPosition.current,
        eased,
      );
      camera.lookAt(CAMERA_HOME_TARGET);
      if (k >= 1) onIntroDone();
      return;
    }

    if (mode === "focused") {
      focusElapsedMs.current += delta * 1000;
      const k = Math.min(1, focusElapsedMs.current / FOCUS_DURATION_MS);
      const eased = 1 - Math.pow(1 - k, 3);
      camera.position.lerpVectors(focusStartPosition.current, focusEndPosition.current, eased);
      const target = focusStartTarget.current.clone().lerp(focusEndTarget.current, eased);
      camera.lookAt(target);
      return;
    }

    // explore：WASD 平移（相机与 target 同步移动，限制活动半径）
    const pressed = keys.current;
    if (pressed.size > 0) {
      const controls = controlsRef.current;
      if (controls) {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));
        const move = new THREE.Vector3();
        if (pressed.has("w") || pressed.has("arrowup")) move.add(forward);
        if (pressed.has("s") || pressed.has("arrowdown")) move.sub(forward);
        if (pressed.has("d") || pressed.has("arrowright")) move.add(right);
        if (pressed.has("a") || pressed.has("arrowleft")) move.sub(right);
        if (move.lengthSq() > 0) {
          move.normalize().multiplyScalar(PAN_SPEED * delta);
          const nextTarget = controls.target.clone().add(move);
          if (Math.hypot(nextTarget.x, nextTarget.z) <= PAN_RADIUS) {
            controls.target.copy(nextTarget);
            camera.position.add(move);
          }
        }
      }
    }

    // 罗盘方位角低频上报
    if (onHeading && state.clock.elapsedTime * 1000 - lastHeadingAt.current > HEADING_REPORT_MS) {
      lastHeadingAt.current = state.clock.elapsedTime * 1000;
      const controls = controlsRef.current;
      if (controls) onHeading(controls.getAzimuthalAngle());
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={mode === "explore"}
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
    keys.current.clear();
    controlsRef.current?.reset();
  }
}
