import { Hono } from "hono";
import type { Env } from "../env.js";
import { getBladeBySlug, listPublishedBlades } from "../data/blades.js";

export const bladesApi = new Hono<{ Bindings: Env }>();

/** 列表只返回卡片所需摘要，不返回长正文与 sources（设计文档 §12）。 */
bladesApi.get("/", (c) => {
  const blades = listPublishedBlades().map((blade) => ({
    slug: blade.slug,
    name: blade.name,
    culture: blade.culture,
    era: blade.era,
    authenticity: blade.authenticity,
    preservationStatus: blade.preservationStatus,
  }));
  c.header("Cache-Control", "public, max-age=60");
  return c.json({ blades, count: blades.length });
});

bladesApi.get("/:slug", (c) => {
  const blade = getBladeBySlug(c.req.param("slug"));
  if (!blade || blade.publicationStatus !== "published") {
    return c.json({ error: { code: "not_found", message: "Blade not found." } }, 404);
  }
  c.header("Cache-Control", "public, max-age=60");
  return c.json({ blade });
});
