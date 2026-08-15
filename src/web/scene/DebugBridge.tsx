import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { FieldDebugData } from "./debug";
import type { ArtifactBladeInfo } from "./ArtifactBlade";

/**
 * ?debug=1 时挂载：以 2Hz 把渲染指标写入 window.__fieldDebug 并回调给 HUD。
 * e2e 与 profiling 脚本都从这里取数（fps 为 EMA，calls/triangles 来自 renderer.info）。
 */
export function DebugBridge({
  tier,
  instanceCount,
  frameloop,
  introDone,
  artifactBlades,
  onHudData,
}: {
  tier: FieldDebugData["tier"];
  instanceCount: number;
  frameloop: FieldDebugData["frameloop"];
  introDone: boolean;
  artifactBlades: ArtifactBladeInfo[];
  onHudData: (data: FieldDebugData) => void;
}) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const emaMs = useRef(16.7);
  const sinceLast = useRef(0);

  // frameloop=never 后 useFrame 停止运行，该字段必须在 React 生命周期内同步，
  // 否则 __fieldDebug.frameloop 永远停留在旧值（e2e 可见性暂停断言会失效）
  useEffect(() => {
    if (window.__fieldDebug && window.__fieldDebug.frameloop !== frameloop) {
      window.__fieldDebug = { ...window.__fieldDebug, frameloop };
    }
  }, [frameloop]);

  useFrame((_, delta) => {
    emaMs.current = emaMs.current * 0.9 + Math.min(delta, 0.25) * 1000 * 0.1;
    sinceLast.current += delta;
    if (sinceLast.current < 0.5) return;
    sinceLast.current = 0;

    const rect = gl.domElement.getBoundingClientRect();
    const v = new THREE.Vector3();
    const artifacts = artifactBlades.map((blade) => {
      v.set(...blade.position).project(camera);
      return {
        slug: blade.slug,
        x: rect.left + (v.x * 0.5 + 0.5) * rect.width,
        y: rect.top + (-v.y * 0.5 + 0.5) * rect.height,
      };
    });

    const data: FieldDebugData = {
      tier,
      instances: instanceCount,
      frameloop,
      introDone,
      fps: Math.round(1000 / emaMs.current),
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      artifacts,
    };
    window.__fieldDebug = data;
    onHudData(data);
  });

  return null;
}
