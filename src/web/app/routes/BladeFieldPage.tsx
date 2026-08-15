import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AppHeader } from "../../components/AppHeader";
import { Compass } from "../../components/Compass";
import { FilterPanel } from "../../components/FilterPanel";
import { EMPTY_FILTER, isBladeVisible, type FieldFilter } from "../../lib/fieldFilter";
import { SceneErrorBoundary } from "../../components/SceneErrorBoundary";
import { StaticField } from "../../components/StaticField";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import {
  fetchBladeDetail,
  fetchBladeList,
  type BladeDetail,
  type BladeSummary,
} from "../../lib/api";
import { BladeField, type LabelAnchor } from "../../scene/BladeField";
import type { ArtifactBladeInfo } from "../../scene/ArtifactBlade";
import { detectWebGL2 } from "../../scene/capability";
import type { FieldMode } from "../../scene/FieldCamera";
import { parseFieldParams } from "../../scene/fieldParams";
import { ARTIFACT_ANCHORS, terrainHeight } from "../../scene/placement";
import { QUALITY_PARAMS, resolveInitialTier, type QualityTier } from "../../scene/quality";
import type { FieldDebugData } from "../../scene/debug";

const TIER_STORAGE_KEY = "ubw-field-tier";

const HOME_BADGE = { num: "01", en: "Home", zh: "剑之荒原" } as const;
const EXPLORE_BADGE = { num: "02", en: "Explore", zh: "剑丘探索" } as const;

function readStoredTier(): QualityTier | null {
  try {
    const value = window.localStorage.getItem(TIER_STORAGE_KEY);
    return value === "balanced" || value === "low" || value === "static" ? value : null;
  } catch {
    return null;
  }
}

/**
 * `/`（01 Home）与 `/explore`（02 Explore）共用同一 3D 场景：
 * ENTER THE ARCHIVE → hero 淡出 + 相机推进 → 探索 UI 浮现（设计稿 01→02 空间转场）。
 */
export default function BladeFieldPage({
  initialMode = "home",
}: {
  initialMode?: "home" | "explore";
}) {
  const navigate = useNavigate();

  // URL 参数只在进入页面时读取一次（阶梯测试与手动档位入口）
  const [config] = useState(() => parseFieldParams(window.location.search));
  const webgl2 = useMemo(() => detectWebGL2(), []);
  const prefersReducedMotion = usePrefersReducedMotion();
  const coarsePointer = useMemo(() => window.matchMedia("(pointer: coarse)").matches, []);
  const deviceMemoryGb = useMemo(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    return typeof nav.deviceMemory === "number" ? nav.deviceMemory : undefined;
  }, []);

  const autoTier = useMemo(
    () => resolveInitialTier({ webgl2, prefersReducedMotion, coarsePointer, deviceMemoryGb }),
    [webgl2, prefersReducedMotion, coarsePointer, deviceMemoryGb],
  );

  const [tier, setTier] = useState<QualityTier>(
    () => config.tierOverride ?? readStoredTier() ?? autoTier,
  );
  const [degradeReason, setDegradeReason] = useState<string | null>(null);
  const effectiveTier: QualityTier = webgl2 ? tier : "static";

  const selectTier = useCallback((next: QualityTier) => {
    setTier(next);
    setDegradeReason(null);
    try {
      window.localStorage.setItem(TIER_STORAGE_KEY, next);
    } catch {
      // 无痕模式等场景下静默降级为会话内记忆
    }
  }, []);

  const handleDegrade = useCallback((reason: string) => {
    setTier((current) => (current === "balanced" ? "low" : current));
    setDegradeReason(reason);
  }, []);

  const instanceCount = config.instancesOverride ?? QUALITY_PARAMS[effectiveTier].ambientBlades;

  // ---------- 模式机：home → transition → explore ----------
  // 动画过渡只在 balanced 且非 reduced-motion 时播放，其余直接落到 explore。
  const cinematic = effectiveTier === "balanced" && !prefersReducedMotion;
  const [mode, setMode] = useState<FieldMode>(initialMode);

  const enterExplore = useCallback(() => {
    setMode((current) => {
      if (current !== "home") return current;
      return cinematic ? "transition" : "explore";
    });
    // 深链同步：进入探索后 URL 变为 /explore（native replaceState 避免路由重挂载 3D 场景）
    if (window.location.pathname === "/") {
      window.history.replaceState(null, "", `/explore${window.location.search}`);
    }
  }, [cinematic]);

  // Escape：home 等价 ENTER；explore 中关闭选中卡
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setSelectedSlug((selected) => {
        if (selected) return null;
        enterExplore();
        return selected;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterExplore]);

  // ---------- 藏品列表 ----------
  const [bladeList, setBladeList] = useState<BladeSummary[] | null>(null);
  const [listError, setListError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetchBladeList()
      .then((result) => {
        if (!cancelled) {
          setBladeList(result.blades);
          setListError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setListError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const artifactBlades = useMemo<ArtifactBladeInfo[]>(() => {
    if (!bladeList) return [];
    return ARTIFACT_ANCHORS.flatMap((anchor) => {
      const blade = bladeList.find((b) => b.slug === anchor.slug);
      if (!blade) return [];
      return [
        {
          slug: blade.slug,
          name: blade.name,
          position: [anchor.x, terrainHeight(anchor.x, anchor.z) - 0.05, anchor.z] as [
            number,
            number,
            number,
          ],
        },
      ];
    });
  }, [bladeList]);

  // ---------- 筛选（02：filters transform the world） ----------
  const [filter, setFilter] = useState<FieldFilter>(EMPTY_FILTER);
  const dimmedSlugs = useMemo(() => {
    if (!bladeList) return undefined;
    const dimmed = new Set<string>();
    for (const blade of bladeList) {
      if (!isBladeVisible(blade, filter)) dimmed.add(blade.slug);
    }
    return dimmed.size > 0 ? dimmed : undefined;
  }, [bladeList, filter]);

  const visibleArtifactBlades = useMemo(
    () => artifactBlades.filter((b) => !dimmedSlugs?.has(b.slug)),
    [artifactBlades, dimmedSlugs],
  );

  // ---------- hover / 选中 ----------
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<LabelAnchor | null>(null);
  const [heading, setHeading] = useState(0);
  const [hudData, setHudData] = useState<FieldDebugData | null>(null);
  const handleHudData = useCallback((data: FieldDebugData) => setHudData(data), []);

  useEffect(() => {
    document.body.style.cursor = hoveredSlug ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hoveredSlug]);

  // 03：选中进入"发现名剑"状态（不直接跳详情页），INSPECT 才导航
  const handleSelect = useCallback((slug: string) => setSelectedSlug(slug), []);
  const inspectBlade = useCallback((slug: string) => navigate(`/blades/${slug}`), [navigate]);

  const hoveredBlade = useMemo(
    () => bladeList?.find((b) => b.slug === hoveredSlug) ?? null,
    [bladeList, hoveredSlug],
  );
  const selectedBlade = useMemo(
    () => bladeList?.find((b) => b.slug === selectedSlug) ?? null,
    [bladeList, selectedSlug],
  );

  // 选中卡描述：按需拉详情（列表接口不含 description），会话内缓存
  const [details, setDetails] = useState<Record<string, BladeDetail>>({});
  useEffect(() => {
    if (!selectedSlug || details[selectedSlug]) return;
    let cancelled = false;
    fetchBladeDetail(selectedSlug)
      .then((detail) => {
        if (!cancelled) setDetails((map) => ({ ...map, [detail.slug]: detail }));
      })
      .catch(() => {
        // 描述缺失时卡片退化为 culture/era 行，不打断探索
      });
    return () => {
      cancelled = true;
    };
  }, [selectedSlug, details]);

  // 选中卡打开时焦点移到 INSPECT（键盘路径闭环）
  const inspectRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (selectedSlug) inspectRef.current?.focus();
  }, [selectedSlug]);

  const render3d = webgl2 && effectiveTier !== "static" && !listError;
  const exploring = mode === "explore";

  return (
    <main className="field-page">
      <AppHeader badge={exploring ? EXPLORE_BADGE : HOME_BADGE} active="explore" />

      {render3d ? (
        <div className="field-stage">
          <SceneErrorBoundary>
            <BladeField
              tier={effectiveTier as "balanced" | "low"}
              instanceCount={instanceCount}
              debug={config.debug}
              mode={mode}
              driftEnabled={cinematic}
              onIntroDone={() => setMode("explore")}
              artifactBlades={artifactBlades}
              hoveredSlug={hoveredSlug}
              selectedSlug={selectedSlug}
              dimmedSlugs={dimmedSlugs}
              onHoverChange={setHoveredSlug}
              onSelect={handleSelect}
              onDegrade={handleDegrade}
              onHudData={handleHudData}
              onHeading={setHeading}
              onAnchor={setAnchor}
            />
          </SceneErrorBoundary>

          {!exploring && (
            <div className={`field-hero${mode === "transition" ? " is-leaving" : ""}`}>
              <p className="field-hero__eyebrow">An archive of legendary blades</p>
              <h1 className="field-hero__title">UNLIMITED BLADE</h1>
              <p className="field-hero__sub">History · Myth · Imagination</p>
              <button type="button" className="field-hero__enter" onClick={enterExplore}>
                <span className="field-hero__plus" aria-hidden="true">
                  +
                </span>
                <span className="field-hero__enter-label">Enter the Archive</span>
              </button>
              <button type="button" className="field-hero__scroll" onClick={enterExplore}>
                Scroll to begin
              </button>
            </div>
          )}

          {config.debug && hudData && (
            <div className="field-hud" aria-label="Scene metrics">
              <p>
                tier <strong>{hudData.tier}</strong>
                {degradeReason && <span title="degraded"> ↓{degradeReason}</span>} · inst{" "}
                {hudData.instances} · {hudData.fps} fps · {hudData.calls} calls ·{" "}
                {(hudData.triangles / 1000).toFixed(0)}k tris · geo {hudData.geometries} · tex{" "}
                {hudData.textures} · loop {hudData.frameloop}
              </p>
            </div>
          )}

          {exploring && bladeList && (
            <FilterPanel blades={bladeList} filter={filter} onChange={setFilter} />
          )}

          {exploring && (
            <>
              <Compass heading={heading} />

              <p className="field-hints">
                {coarsePointer ? (
                  <>
                    <b>Drag</b> to look · <b>Tap</b> to select
                  </>
                ) : (
                  <>
                    <b>WASD</b> move · <b>Mouse</b> look · <b>Click</b> select
                  </>
                )}
              </p>

              {hoveredBlade && !selectedBlade && anchor && (
                <div
                  className="field-hover-card"
                  role="status"
                  style={
                    anchor.flip
                      ? {
                          right: `${Math.max(12, window.innerWidth - anchor.x + 18)}px`,
                          top: anchor.y - 14,
                        }
                      : { left: anchor.x + 18, top: anchor.y - 14 }
                  }
                >
                  <h2>{hoveredBlade.name}</h2>
                  <p>
                    {hoveredBlade.culture} · {hoveredBlade.era}
                  </p>
                  <p className="field-hover-card__authenticity">{hoveredBlade.authenticity}</p>
                </div>
              )}

              {selectedBlade && (
                <>
                  <div className="field-focus-dim" />
                  <article className="field-selected-card" aria-label="Selected blade">
                    <button
                      type="button"
                      className="field-selected-card__close"
                      aria-label="Back to exploration"
                      onClick={() => setSelectedSlug(null)}
                    >
                      ✕
                    </button>
                    <h2>{selectedBlade.name}</h2>
                    <p className="field-selected-card__origin">
                      {selectedBlade.culture} · {selectedBlade.era}
                    </p>
                    <span className="field-selected-card__tag">{selectedBlade.authenticity}</span>
                    <p className="field-selected-card__desc">
                      {details[selectedBlade.slug]?.description ??
                        `${selectedBlade.culture} · ${selectedBlade.era} · ${selectedBlade.preservationStatus}`}
                    </p>
                    <button
                      ref={inspectRef}
                      type="button"
                      className="field-selected-card__cta"
                      onClick={() => inspectBlade(selectedBlade.slug)}
                    >
                      Inspect Blade →
                    </button>
                  </article>
                </>
              )}

              <ul className="field-artifact-buttons" aria-label="Artifact blades">
                {visibleArtifactBlades.map((blade) => (
                  <li key={blade.slug}>
                    <button
                      type="button"
                      className={selectedSlug === blade.slug ? "is-selected" : ""}
                      onPointerEnter={() => setHoveredSlug(blade.slug)}
                      onPointerLeave={() => setHoveredSlug(null)}
                      onFocus={() => setHoveredSlug(blade.slug)}
                      onBlur={() => setHoveredSlug(null)}
                      onClick={() => handleSelect(blade.slug)}
                    >
                      {blade.name}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    className="field-reset"
                    onClick={() => window.dispatchEvent(new Event("field:reset-camera"))}
                  >
                    Reset view
                  </button>
                </li>
              </ul>

              <nav className="field-tiers" aria-label="Quality tier">
                {(["balanced", "low", "static"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={effectiveTier === option ? "is-active" : ""}
                    aria-pressed={effectiveTier === option}
                    onClick={() => selectTier(option)}
                  >
                    {option}
                  </button>
                ))}
              </nav>
            </>
          )}
        </div>
      ) : (
        <StaticField
          blades={bladeList}
          error={listError}
          onRetry={() => setRetryToken((t) => t + 1)}
        />
      )}
    </main>
  );
}
