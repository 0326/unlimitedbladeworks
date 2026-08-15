import { describe, expect, it } from "vitest";
import { QUALITY_PARAMS, resolveInitialTier } from "../src/web/scene/quality";

describe("QUALITY_PARAMS", () => {
  it("orders tiers: balanced > low > static on instance count", () => {
    expect(QUALITY_PARAMS.balanced.ambientBlades).toBeGreaterThan(QUALITY_PARAMS.low.ambientBlades);
    expect(QUALITY_PARAMS.low.ambientBlades).toBeGreaterThan(QUALITY_PARAMS.static.ambientBlades);
    expect(QUALITY_PARAMS.static.ambientBlades).toBe(0);
  });

  it("keeps expensive capabilities off for low and static", () => {
    expect(QUALITY_PARAMS.balanced.shadows).toBe(true);
    expect(QUALITY_PARAMS.balanced.particles).toBe(true);
    expect(QUALITY_PARAMS.balanced.postProcessing).toBe(true);
    for (const tier of ["low", "static"] as const) {
      expect(QUALITY_PARAMS[tier].shadows).toBe(false);
      expect(QUALITY_PARAMS[tier].particles).toBe(false);
      expect(QUALITY_PARAMS[tier].postProcessing).toBe(false);
      expect(QUALITY_PARAMS[tier].particleCount).toBe(0);
    }
  });

  it("caps DPR within the design budget (desktop 1.5 / mobile 1.25 内)", () => {
    expect(QUALITY_PARAMS.balanced.maxDpr).toBeLessThanOrEqual(1.5);
    expect(QUALITY_PARAMS.low.maxDpr).toBeLessThanOrEqual(1.25);
  });
});

describe("resolveInitialTier", () => {
  it("goes static without WebGL2", () => {
    expect(
      resolveInitialTier({
        webgl2: false,
        prefersReducedMotion: false,
        coarsePointer: false,
      }),
    ).toBe("static");
  });

  it("goes low for reduced motion even on desktop GPUs", () => {
    expect(
      resolveInitialTier({
        webgl2: true,
        prefersReducedMotion: true,
        coarsePointer: false,
      }),
    ).toBe("low");
  });

  it("goes low for coarse pointer (mobile hint)", () => {
    expect(
      resolveInitialTier({
        webgl2: true,
        prefersReducedMotion: false,
        coarsePointer: true,
      }),
    ).toBe("low");
  });

  it("goes low for constrained device memory", () => {
    expect(
      resolveInitialTier({
        webgl2: true,
        prefersReducedMotion: false,
        coarsePointer: false,
        deviceMemoryGb: 2,
      }),
    ).toBe("low");
  });

  it("goes balanced on a capable desktop", () => {
    expect(
      resolveInitialTier({
        webgl2: true,
        prefersReducedMotion: false,
        coarsePointer: false,
        deviceMemoryGb: 8,
      }),
    ).toBe("balanced");
  });
});
