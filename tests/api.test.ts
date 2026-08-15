import { describe, expect, it } from "vitest";
import { SELF } from "cloudflare:test";

describe("GET /api/health", () => {
  it("returns ok status as JSON", async () => {
    const res = await SELF.fetch("https://example.com/api/health");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("ok");
  });
});

describe("GET /api/blades", () => {
  it("returns only published blade summaries", async () => {
    const res = await SELF.fetch("https://example.com/api/blades");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      blades: { slug: string; description?: unknown; sources?: unknown }[];
      count: number;
    };
    expect(body.count).toBe(2);
    expect(body.blades.map((blade) => blade.slug)).toEqual([
      "calibration-katana",
      "calibration-longsword",
    ]);
    // 列表接口不得返回长正文或 sources（设计文档 §12）
    for (const blade of body.blades) {
      expect(blade.description).toBeUndefined();
      expect(blade.sources).toBeUndefined();
    }
  });
});

describe("GET /api/blades/:slug", () => {
  it("returns a published blade with archive fields", async () => {
    const res = await SELF.fetch("https://example.com/api/blades/calibration-katana");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      blade: { slug: string; annotations: unknown[]; sources: unknown[]; updatedAt: string };
    };
    expect(body.blade.slug).toBe("calibration-katana");
    expect(body.blade.annotations).toHaveLength(3);
    expect(body.blade.sources).toEqual([]);
    expect(typeof body.blade.updatedAt).toBe("string");
  });

  it("hides draft records with a JSON 404", async () => {
    const res = await SELF.fetch("https://example.com/api/blades/draft-jiangjun-jian");
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("not_found");
  });

  it("returns a JSON 404 for unknown slugs", async () => {
    const res = await SELF.fetch("https://example.com/api/blades/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("application/json");
  });
});

describe("unknown API routes", () => {
  it("return a JSON 404, never SPA index.html", async () => {
    const res = await SELF.fetch("https://example.com/api/nonexistent");
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("not_found");
  });
});
