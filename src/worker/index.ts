import { Hono } from "hono";
import type { Env } from "./env.js";
import { bladesApi } from "./routes/blades.js";

const app = new Hono<{ Bindings: Env }>().basePath("/api");

app.get("/health", (c) => {
  c.header("Cache-Control", "no-store");
  return c.json({
    status: "ok",
    service: "unlimitedbladeworks",
    environment: c.env.ENVIRONMENT ?? "local",
  });
});

app.route("/blades", bladesApi);

// 统一错误结构。/api/* 由 run_worker_first 保证进入 Worker，
// 未知 API 路径在此返回 JSON 404，而不是 SPA fallback 的 index.html。
app.notFound((c) => c.json({ error: { code: "not_found", message: "Unknown API route." } }, 404));

app.onError((err, c) => {
  console.error("Unhandled API error", {
    path: c.req.path,
    method: c.req.method,
    message: err instanceof Error ? err.message : String(err),
  });
  return c.json({ error: { code: "internal_error", message: "Unexpected server error." } }, 500);
});

export default app;
