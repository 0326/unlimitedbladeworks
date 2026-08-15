import { describe, expect, it } from "vitest";
import {
  ARTIFACT_ANCHORS,
  FIELD_RADIUS,
  VARIANT_COUNT,
  generatePlacements,
  mulberry32,
  terrainHeight,
} from "../src/web/scene/placement";

describe("mulberry32", () => {
  it("produces a deterministic sequence for a seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 8 }, () => a());
    const seqB = Array.from({ length: 8 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("differs between seeds and stays in [0, 1)", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = Array.from({ length: 8 }, () => a());
    const seqB = Array.from({ length: 8 }, () => b());
    expect(seqA).not.toEqual(seqB);
    for (const value of seqA) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("terrainHeight", () => {
  it("is deterministic and finite", () => {
    const points: Array<[number, number]> = [
      [0, 0],
      [10, -20],
      [-88, 88],
      [51.7, 3.2],
    ];
    for (const [x, z] of points) {
      const h1 = terrainHeight(x, z);
      const h2 = terrainHeight(x, z);
      expect(Number.isFinite(h1)).toBe(true);
      expect(h1).toBe(h2);
    }
  });
});

describe("generatePlacements", () => {
  it("is fully reproducible for the same seed", () => {
    const a = generatePlacements({ seed: 20260816, count: 400 });
    const b = generatePlacements({ seed: 20260816, count: 400 });
    expect(a).toEqual(b);
  });

  it("returns exactly the requested count when achievable", () => {
    const placements = generatePlacements({ seed: 7, count: 500 });
    expect(placements).toHaveLength(500);
  });

  it("keeps clear of the center and artifact anchors", () => {
    const placements = generatePlacements({ seed: 9, count: 800 });
    expect(placements.length).toBeGreaterThan(0);
    for (const p of placements) {
      expect(Math.hypot(p.x, p.z)).toBeGreaterThanOrEqual(4 - 1e-9);
      for (const anchor of ARTIFACT_ANCHORS) {
        expect(Math.hypot(p.x - anchor.x, p.z - anchor.z)).toBeGreaterThanOrEqual(3.5 - 1e-9);
      }
    }
  });

  it("stays inside the field radius", () => {
    const placements = generatePlacements({ seed: 11, count: 600 });
    for (const p of placements) {
      expect(Math.hypot(p.x, p.z)).toBeLessThanOrEqual(FIELD_RADIUS + 1e-9);
    }
  });

  it("respects minimum spacing between blades", () => {
    const placements = generatePlacements({ seed: 13, count: 800 });
    for (let i = 0; i < placements.length; i++) {
      const a = placements[i]!;
      for (let j = i + 1; j < placements.length; j++) {
        const b = placements[j]!;
        const dx = a.x - b.x;
        const dz = a.z - b.z;
        expect(Math.hypot(dx, dz)).toBeGreaterThanOrEqual(0.9 - 1e-6);
      }
    }
  });

  it("uses valid variants and places blades on terrain", () => {
    const placements = generatePlacements({ seed: 17, count: 300 });
    for (const p of placements) {
      expect(p.variant).toBeGreaterThanOrEqual(0);
      expect(p.variant).toBeLessThan(VARIANT_COUNT);
      expect(p.scale).toBeGreaterThanOrEqual(1.4);
      expect(p.scale).toBeLessThanOrEqual(2.6);
      // 插地深度 0.12
      expect(p.y).toBeCloseTo(terrainHeight(p.x, p.z) - 0.12, 5);
    }
  });

  it("terminates even with an unachievable count", () => {
    const placements = generatePlacements({ seed: 23, count: 1_000_000 });
    expect(placements.length).toBeLessThan(1_000_000);
    expect(placements.length).toBeGreaterThan(1000);
  });
});
