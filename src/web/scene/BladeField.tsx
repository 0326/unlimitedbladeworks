import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Terrain } from "./Terrain";
import { MountainRing, SkyDome } from "./Sky";
import { DustParticles } from "./DustParticles";
import { AmbientBladeInstances } from "./AmbientBladeInstances";
import { ArtifactBlades, type ArtifactBladeInfo } from "./ArtifactBlade";
import { FieldCamera } from "./FieldCamera";
import { QualitySampler } from "./QualitySampler";
import { DebugBridge } from "./DebugBridge";
import { generatePlacements } from "./placement";
import { QUALITY_PARAMS, type QualityTier } from "./quality";
import { CAMERA_INTRO_START, PALETTE } from "./layout";
import type { FieldDebugData } from "./debug";

const FieldEffects = lazy(() => import("./FieldEffects"));

/** 场景 seed：固定值保证剑场跨部署一致，便于回归对比。 */
const FIELD_SEED = 20260816;

export interface BladeFieldProps {
  tier: Exclude<QualityTier, "static">;
  instanceCount: number;
  debug: boolean;
  introActive: boolean;
  onIntroDone: () => void;
  artifactBlades: ArtifactBladeInfo[];
  hoveredSlug: string | null;
  onHoverChange: (slug: string | null) => void;
  onSelect: (slug: string) => void;
  onDegrade: (reason: string) => void;
  onHudData: (data: FieldDebugData) => void;
}

/**
 * Blade Field 主场景（P1-01..P1-04）：
 * 档位驱动一切开关；页面不可见时 frameloop=never 暂停渲染；
 * WebGL 不可用走 Static 路径（页面层决定，不进此组件）。
 */
export function BladeField(props: BladeFieldProps) {
  const { tier, instanceCount, debug, introActive } = props;
  const params = QUALITY_PARAMS[tier];

  // 页面可见性：隐藏即暂停渲染循环（P1-01）
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");
  useEffect(() => {
    const onVisibility = () =>
      setFrameloop(document.visibilityState === "visible" ? "always" : "never");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const dpr = useMemo(
    () => Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, params.maxDpr),
    [params.maxDpr],
  );

  const placements = useMemo(
    () => generatePlacements({ seed: FIELD_SEED, count: instanceCount }),
    [instanceCount],
  );

  return (
    <Canvas
      shadows={params.shadows}
      dpr={dpr}
      frameloop={frameloop}
      gl={{ antialias: params.antialias, powerPreference: "high-performance" }}
      camera={{
        fov: 55,
        near: 0.1,
        far: 450,
        position: [CAMERA_INTRO_START.x, CAMERA_INTRO_START.y, CAMERA_INTRO_START.z],
      }}
      onPointerMissed={() => props.onHoverChange(null)}
    >
      <color attach="background" args={[PALETTE.fog]} />
      <fog attach="fog" args={[PALETTE.fog, params.fogNear, params.fogFar]} />

      <hemisphereLight args={["#3d4250", "#241c12", 0.6]} />
      <directionalLight
        position={[46, 52, -28]}
        intensity={1.7}
        color={PALETTE.sun}
        castShadow={params.shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-far={180}
      />

      <SkyDome />
      <MountainRing />
      <Terrain receiveShadow={params.shadows} />
      <AmbientBladeInstances placements={placements} />
      {params.particles && params.particleCount > 0 && (
        <DustParticles count={params.particleCount} />
      )}
      <ArtifactBlades
        blades={props.artifactBlades}
        hoveredSlug={props.hoveredSlug}
        onHoverChange={props.onHoverChange}
        onSelect={props.onSelect}
        castShadow={params.shadows}
      />

      <FieldCamera introActive={introActive} onIntroDone={props.onIntroDone} />
      <QualitySampler active={tier === "balanced"} onDegrade={props.onDegrade} />
      {debug && (
        <DebugBridge
          tier={tier}
          instanceCount={instanceCount}
          frameloop={frameloop}
          introDone={!introActive}
          artifactBlades={props.artifactBlades}
          onHudData={props.onHudData}
        />
      )}
      {params.postProcessing && (
        <Suspense fallback={null}>
          <FieldEffects />
        </Suspense>
      )}
    </Canvas>
  );
}
