import { describe, expect, it } from "vitest";
import { isBladeDetail, isBladeSummary } from "../src/web/lib/api";

const summary = {
  slug: "calibration-katana",
  name: "Calibration Katana",
  culture: "Placeholder culture",
  era: "Placeholder era",
  authenticity: "fictional",
  preservationStatus: "unknown",
};

const detail = {
  ...summary,
  nativeName: null,
  type: "katana",
  publicationStatus: "published",
  description: "placeholder",
  currentLocation: null,
  annotations: [{ id: "blade", title: "Blade", body: "…" }],
  sources: [],
  updatedAt: "2026-08-16T00:00:00.000Z",
};

describe("isBladeSummary", () => {
  it("accepts a well-formed summary", () => {
    expect(isBladeSummary(summary)).toBe(true);
  });

  it("rejects objects with missing or non-string fields", () => {
    expect(isBladeSummary(null)).toBe(false);
    expect(isBladeSummary("katana")).toBe(false);
    expect(isBladeSummary({ ...summary, era: 42 })).toBe(false);
    const { slug: _slug, ...withoutSlug } = summary;
    expect(isBladeSummary(withoutSlug)).toBe(false);
  });
});

describe("isBladeDetail", () => {
  it("accepts a well-formed detail record", () => {
    expect(isBladeDetail(detail)).toBe(true);
  });

  it("accepts nativeName and currentLocation as string or null", () => {
    expect(isBladeDetail({ ...detail, nativeName: "本城正宗" })).toBe(true);
    expect(isBladeDetail({ ...detail, currentLocation: "Somewhere" })).toBe(true);
  });

  it("rejects malformed annotations and sources arrays", () => {
    expect(isBladeDetail({ ...detail, annotations: "none" })).toBe(false);
    expect(isBladeDetail({ ...detail, annotations: [{ id: 1, title: "x", body: "y" }] })).toBe(
      false,
    );
    expect(isBladeDetail({ ...detail, sources: [{ id: "s" }] })).toBe(false);
  });

  it("rejects when updatedAt is missing", () => {
    const { updatedAt: _updatedAt, ...withoutUpdatedAt } = detail;
    expect(isBladeDetail(withoutUpdatedAt)).toBe(false);
  });
});
