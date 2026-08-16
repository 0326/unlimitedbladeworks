import { useMemo } from "react";
import { ARTIFACT_VARIANT, getBladeVariants } from "./bladeGeometry";
import { PALETTE } from "./layout";

export interface ArtifactBladeInfo {
  slug: string;
  name: string;
  /** 世界坐标（已含地形高度）。 */
  position: [number, number, number];
}

/**
 * Artifact Blade：独立实体（非实例），稳定 ID = slug。
 * - 可见剑身 + 稍大变体
 * - 地面光环 ring（hover/selected 高亮）
 * - 不可见碰撞柱（拾取范围可控，pointer 与键盘共用 hover 状态）
 * - 筛选不匹配（dimmed）时淡出并退出交互（设计稿 02：filters transform the world）
 */
export function ArtifactBlades({
  blades,
  hoveredSlug,
  selectedSlug,
  dimmedSlugs,
  onHoverChange,
  onSelect,
  castShadow,
}: {
  blades: ArtifactBladeInfo[];
  hoveredSlug: string | null;
  selectedSlug: string | null;
  dimmedSlugs?: ReadonlySet<string>;
  onHoverChange: (slug: string | null) => void;
  onSelect: (slug: string) => void;
  castShadow: boolean;
}) {
  const variants = useMemo(() => getBladeVariants(), []);

  return (
    <group name="artifact-blades">
      {blades.map((blade) => {
        const hovered = hoveredSlug === blade.slug;
        const selected = selectedSlug === blade.slug;
        const dimmed = dimmedSlugs?.has(blade.slug) ?? false;
        const variant = variants[ARTIFACT_VARIANT[blade.slug] ?? 0];
        if (!variant) return null;
        const highlighted = hovered || selected;
        const presentationScale =
          (blade.slug === "calibration-longsword" ? 4.1 : 3.2) * (selected ? 1.08 : 1);
        const handlers = dimmed
          ? {}
          : {
              onPointerOver: (e: ThreePointerEvent) => {
                e.stopPropagation();
                onHoverChange(blade.slug);
              },
              onPointerOut: (e: ThreePointerEvent) => {
                e.stopPropagation();
                onHoverChange(null);
              },
              onClick: (e: ThreePointerEvent) => {
                e.stopPropagation();
                onSelect(blade.slug);
              },
            };
        return (
          <group
            key={blade.slug}
            position={blade.position}
            {...(selected ? { "data-selected": "true" } : {})}
          >
            <group scale={presentationScale}>
              <mesh geometry={variant.geometry} castShadow={castShadow} {...handlers}>
                <meshStandardMaterial
                  color={highlighted ? "#d6c18e" : PALETTE.artifactSteel}
                  metalness={0.86}
                  roughness={0.22}
                  flatShading
                  transparent={dimmed}
                  opacity={dimmed ? 0.18 : 1}
                  emissive={highlighted ? PALETTE.accent : "#000000"}
                  emissiveIntensity={selected ? 0.28 : hovered ? 0.18 : 0}
                />
              </mesh>

              {/* 拾取碰撞柱：不写颜色/深度，仅参与 raycast */}
              {!dimmed && (
                <mesh position={[0, 2.2, 0]} {...handlers}>
                  <cylinderGeometry args={[1.3, 1.3, 4.6, 8]} />
                  <meshBasicMaterial
                    transparent
                    opacity={0}
                    colorWrite={false}
                    depthWrite={false}
                  />
                </mesh>
              )}
            </group>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
              <torusGeometry args={[1.6, 0.035, 8, 44]} />
              <meshBasicMaterial
                color={highlighted ? PALETTE.accent : "#3a3627"}
                transparent
                opacity={dimmed ? 0.08 : selected ? 1 : hovered ? 0.95 : 0.45}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

interface ThreePointerEvent {
  stopPropagation: () => void;
}
