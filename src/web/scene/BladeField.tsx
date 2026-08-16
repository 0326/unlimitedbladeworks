import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Terrain } from "./Terrain";
import { CloudLayer, Eclipse, MountainRing, SkyDome } from "./Sky";
import { DustParticles } from "./DustParticles";
import { AmbientBladeInstances, ForegroundBladeInstances } from "./AmbientBladeInstances";
import { ArtifactBlades, type ArtifactBladeInfo } from "./ArtifactBlade";
import { FieldCamera, type FieldMode } from "./FieldCamera";
import { QualitySampler } from "./QualitySampler";
import { DebugBridge } from "./DebugBridge";
import { generateForegroundPlacements, generatePlacements } from "./placement";
import { QUALITY_PARAMS, type QualityTier } from "./quality";
import { CAMERA_INTRO_START, PALETTE } from "./layout";
import type { FieldDebugData } from "./debug";

const FieldEffects = lazy(() => import("./FieldEffects"));

/** 场景 seed：固定值保证剑场跨部署一致，便于回归对比。 */
const FIELD_SEED = 20260816;

/** hover 空间标签的屏幕锚点。 */
export interface LabelAnchor {
  x: number;
  y: number;
  /** 锚点靠近右边缘时标签翻到左侧。 */
  flip: boolean;
}

export interface BladeFieldProps {
  tier: Exclude<QualityTier, "static">;
  instanceCount: number;
  debug: boolean;
  mode: FieldMode;
  /** home 模式的环境漂移（balanced 且非 reduced-motion）。 */
  driftEnabled: boolean;
  onIntroDone: () => void;
  artifactBlades: ArtifactBladeInfo[];
  hoveredSlug: string | null;
  selectedSlug: string | null;
  dimmedSlugs?: ReadonlySet<string>;
  onHoverChange: (slug: string | null) => void;
  onSelect: (slug: string) => void;
  onDegrade: (reason: string) => void;
  onHudData: (data: FieldDebugData) => void;
  onHeading?: (radians: number) => void;
  focusTarget?: [number, number, number];
  /** hover 标签锚点（世界坐标 → 屏幕像素，~15Hz）。 */
  onAnchor?: (anchor: LabelAnchor | null) => void;
}

/**
 * Blade Field 主场景：
 * 档位驱动一切开关；页面不可见时 frameloop=never 暂停渲染；
 * WebGL 不可用走 Static 路径（页面层决定，不进此组件）。
 */
export function BladeField(props: BladeFieldProps) {
  const { tier, instanceCount, debug, mode } = props;
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
  const foregroundPlacements = useMemo(() => generateForegroundPlacements(), []);

  return (
    <Canvas
      shadows={params.shadows}
      dpr={dpr}
      frameloop={frameloop}
      gl={{
        antialias: params.antialias,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
      }}
      camera={{
        fov: 55,
        near: 0.1,
        far: 450,
        position: [CAMERA_INTRO_START.x, CAMERA_INTRO_START.y, CAMERA_INTRO_START.z],
      }}
      onPointerMissed={() => props.onHoverChange(null)}
    >
      <color attach="background" args={[PALETTE.background]} />
      <fog attach="fog" args={[PALETTE.fog, params.fogNear, params.fogFar]} />

      <hemisphereLight args={["#303644", "#0b0908", 0.34]} />
      <directionalLight
        position={[30, 30, -65]}
        intensity={2.25}
        color={PALETTE.sun}
        castShadow={params.shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-far={180}
      />
      <pointLight
        position={[10, 6, 5]}
        intensity={2.4}
        distance={18}
        decay={2}
        color={PALETTE.sun}
      />
      <pointLight position={[0, 10, 14]} intensity={0.55} distance={34} decay={2} color="#b88d5b" />

      <SkyDome />
      {tier === "balanced" && <CloudLayer />}
      <Eclipse />
      <MountainRing />
      <Terrain receiveShadow={params.shadows} />
      <AmbientBladeInstances placements={placements} />
      {tier === "balanced" && (
        <ForegroundBladeInstances placements={foregroundPlacements} castShadow={params.shadows} />
      )}
      {params.particles && params.particleCount > 0 && (
        <DustParticles count={params.particleCount} />
      )}
      <ArtifactBlades
        blades={props.artifactBlades}
        hoveredSlug={props.hoveredSlug}
        selectedSlug={props.selectedSlug}
        dimmedSlugs={props.dimmedSlugs}
        onHoverChange={props.onHoverChange}
        onSelect={props.onSelect}
        castShadow={params.shadows}
      />

      <FieldCamera
        mode={mode}
        driftEnabled={props.driftEnabled}
        onIntroDone={props.onIntroDone}
        onHeading={props.onHeading}
        focusTarget={props.focusTarget}
      />
      <QualitySampler
        active={tier === "balanced" && mode === "explore"}
        onDegrade={props.onDegrade}
      />
      {props.onAnchor && (
        <SpatialAnchor
          slug={props.hoveredSlug}
          blades={props.artifactBlades}
          onAnchor={props.onAnchor}
        />
      )}
      {debug && (
        <DebugBridge
          tier={tier}
          instanceCount={instanceCount}
          frameloop={frameloop}
          introDone={mode === "explore"}
          artifactBlades={props.artifactBlades}
          onHudData={props.onHudData}
        />
      )}
      {params.postProcessing && (
        <Suspense fallback={null}>
          <FieldEffects depthOfField={params.depthOfField} />
        </Suspense>
      )}
    </Canvas>
  );
}

/** 把 hovered artifact 的世界坐标投影为屏幕像素锚点（~15Hz，剑身中上部）。 */
function SpatialAnchor({
  slug,
  blades,
  onAnchor,
}: {
  slug: string | null;
  blades: ArtifactBladeInfo[];
  onAnchor: (anchor: LabelAnchor | null) => void;
}) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const lastAt = useRef(0);
  const vec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const now = state.clock.elapsedTime * 1000;
    if (now - lastAt.current < 66) return;
    lastAt.current = now;

    const blade = slug ? blades.find((b) => b.slug === slug) : undefined;
    if (!blade) {
      onAnchor(null);
      return;
    }
    vec.set(blade.position[0], blade.position[1] + 3.1, blade.position[2]).project(camera);
    if (vec.z > 1 || vec.z < -1) {
      onAnchor(null);
      return;
    }
    const x = (vec.x * 0.5 + 0.5) * size.width;
    const y = (-vec.y * 0.5 + 0.5) * size.height;
    onAnchor({ x, y, flip: x > size.width * 0.68 });
  });

  return null;
}
