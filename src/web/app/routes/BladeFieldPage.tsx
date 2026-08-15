import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { SceneErrorBoundary } from "../../components/SceneErrorBoundary";
import { StaticField } from "../../components/StaticField";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { fetchBladeList, type BladeSummary } from "../../lib/api";
import { BladeField } from "../../scene/BladeField";
import type { ArtifactBladeInfo } from "../../scene/ArtifactBlade";
import { detectWebGL2 } from "../../scene/capability";
import { parseFieldParams } from "../../scene/fieldParams";
import { ARTIFACT_ANCHORS, terrainHeight } from "../../scene/placement";
import { QUALITY_PARAMS, resolveInitialTier, type QualityTier } from "../../scene/quality";
import type { FieldDebugData } from "../../scene/debug";

const TIER_STORAGE_KEY = "ubw-field-tier";

function readStoredTier(): QualityTier | null {
  try {
    const value = window.localStorage.getItem(TIER_STORAGE_KEY);
    return value === "balanced" || value === "low" || value === "static" ? value : null;
  } catch {
    return null;
  }
}

export default function BladeFieldPage() {
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

  // 档位手动切换（Balanced / Low / Static 三档，设计文档 §11）
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

  // 开场：仅 balanced 且非 reduced-motion；可跳过（Escape / 按钮）。
  // introPlayed 只在完成/跳过时写入一次；overlay 显示由 introEnabled && !introPlayed 派生，
  // 避免 effect 内同步 setState（切档或 reduced-motion 变化时自动隐藏）。
  const introEnabled = effectiveTier === "balanced" && !prefersReducedMotion;
  const [introPlayed, setIntroPlayed] = useState(false);
  const introVisible = introEnabled && !introPlayed;
  useEffect(() => {
    if (introPlayed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIntroPlayed(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [introPlayed]);

  // 藏品列表：驱动 artifact 实体、hover 卡与 Static 路径
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

  // hover 状态：3D 拾取与 HTML 按钮共享（键盘 focus 同步高亮）
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [hudData, setHudData] = useState<FieldDebugData | null>(null);
  const handleHudData = useCallback((data: FieldDebugData) => setHudData(data), []);

  useEffect(() => {
    document.body.style.cursor = hoveredSlug ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hoveredSlug]);

  const handleSelect = useCallback((slug: string) => navigate(`/blades/${slug}`), [navigate]);

  const hoveredBlade = useMemo(
    () => bladeList?.find((b) => b.slug === hoveredSlug) ?? null,
    [bladeList, hoveredSlug],
  );

  const render3d = webgl2 && effectiveTier !== "static" && !listError;

  return (
    <main className="field-page">
      <header className="field-page__header">
        <a className="field-page__back" href="/">
          ← Archive
        </a>
        <h1 className="field-page__title">Blade Field</h1>
        <nav className="field-page__tiers" aria-label="Quality tier">
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
      </header>

      {render3d ? (
        <div className="field-stage">
          <SceneErrorBoundary>
            <BladeField
              tier={effectiveTier as "balanced" | "low"}
              instanceCount={instanceCount}
              debug={config.debug}
              introActive={introVisible}
              onIntroDone={() => setIntroPlayed(true)}
              artifactBlades={artifactBlades}
              hoveredSlug={hoveredSlug}
              onHoverChange={setHoveredSlug}
              onSelect={handleSelect}
              onDegrade={handleDegrade}
              onHudData={handleHudData}
            />
          </SceneErrorBoundary>

          {introVisible && (
            <div className="field-intro">
              <p className="field-intro__eyebrow">A digital archive of legendary blades</p>
              <h2 className="field-intro__title">
                UNLIMITED
                <br />
                BLADE
              </h2>
              <button
                type="button"
                className="field-intro__skip"
                onClick={() => setIntroPlayed(true)}
              >
                Skip intro
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

          {!introVisible && (
            <>
              {hoveredBlade && (
                <div className="field-hover-card" role="status">
                  <h2>{hoveredBlade.name}</h2>
                  <p>
                    {hoveredBlade.culture} · {hoveredBlade.era}
                  </p>
                  <p className="field-hover-card__authenticity">{hoveredBlade.authenticity}</p>
                </div>
              )}

              <ul className="field-artifact-buttons" aria-label="Artifact blades">
                {artifactBlades.map((blade) => (
                  <li key={blade.slug}>
                    <button
                      type="button"
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
