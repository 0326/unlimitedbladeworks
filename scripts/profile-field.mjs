#!/usr/bin/env node
/**
 * Blade Field 性能采样（P1-02）：500/1000/2000 实例阶梯。
 *
 * 用法：node scripts/profile-field.mjs
 * 前提：已执行 pnpm build（脚本不重复构建）。
 *
 * 环境：headless Chromium + SwiftShader（与 e2e 相同 flag）。
 * 注意：SwiftShader 是 CPU 光栅化，fps 绝对值仅作回归对比参考；
 * draw calls / triangles / geometries 与 GPU 无关，是确定性指标。
 * 数据写入 docs/data/phase1-profile.json，并打印 markdown 表格。
 */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "docs/data/phase1-profile.json");
const PORT = 4180;
const BASE = `http://127.0.0.1:${PORT}`;
const LADDER = [500, 1000, 2000];
const SAMPLE_SECONDS = 10;

const preview = spawn(
  "pnpm",
  ["exec", "vite", "preview", "--host", "127.0.0.1", "--port", String(PORT), "--strictPort"],
  {
    cwd: ROOT,
    env: { ...process.env, NO_PROXY: "*", no_proxy: "*" },
    stdio: "ignore",
    detached: true,
  },
);

async function waitServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${BASE}/api/health`, {
        signal: AbortSignal.timeout(1000),
      });
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`preview server did not start on ${BASE}`);
}

async function sampleLadder(page, instances) {
  await page.goto(`${BASE}/lab/blade-field?instances=${instances}&debug=1`, {
    waitUntil: "domcontentloaded",
  });
  // 等 DebugBridge 首次推送（含 artifact 屏幕坐标）
  await page.waitForFunction(
    () => {
      const d = window.__fieldDebug;
      return d !== undefined && d.artifacts.length > 0;
    },
    undefined,
    { timeout: 30_000 },
  );
  // 等 intro 结束（自然完成 / 降级中断 / Escape 跳过三选一），排除开场推进的帧
  await page.waitForFunction(() => window.__fieldDebug?.introDone === true, undefined, {
    timeout: 30_000,
  });

  const samples = [];
  const deadline = Date.now() + SAMPLE_SECONDS * 1000;
  while (Date.now() < deadline) {
    const d = await page.evaluate(() => window.__fieldDebug);
    if (d) samples.push(d);
    await page.waitForTimeout(500);
  }

  const fps = median(samples.map((s) => s.fps));
  const calls = median(samples.map((s) => s.calls));
  const tris = median(samples.map((s) => s.triangles));
  const geometries = median(samples.map((s) => s.geometries));
  const textures = median(samples.map((s) => s.textures));
  const tier = samples.at(-1)?.tier ?? "unknown";
  return {
    instances,
    tier,
    fps,
    frameTimeMs: round(1000 / fps, 1),
    calls,
    triangles: tris,
    geometries,
    textures,
    sampleCount: samples.length,
  };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const v = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return Math.round(v * 10) / 10;
}

function round(n, digits) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

/** 统计 dist/client 静态资源 gzip 体积（JS/CSS），对应 Field 页面总传输。 */
function measureDistTransfer() {
  const gzipSize = (file) => gzipSync(readFileSync(file)).length;
  const listFiles = (dir) => {
    const out = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) out.push(...listFiles(full));
      else out.push(full);
    }
    return out;
  };
  const root = resolve(ROOT, "dist/client");
  const files = existsSync(root) ? listFiles(root) : [];
  const js = files.filter((f) => f.endsWith(".js"));
  const css = files.filter((f) => f.endsWith(".css"));
  const jsBytes = js.reduce((sum, f) => sum + gzipSize(f), 0);
  const cssBytes = css.reduce((sum, f) => sum + gzipSize(f), 0);
  return { jsBytes, cssBytes, totalBytes: jsBytes + cssBytes, resourceCount: files.length };
}

try {
  await waitServer();
  const browser = await chromium.launch({
    args: ["--no-proxy-server", "--enable-unsafe-swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const samples = [];
  for (const n of LADDER) {
    process.stdout.write(`sampling ${n} instances ... `);
    samples.push(await sampleLadder(page, n));
    console.log("done");
  }
  await browser.close();

  // 传输体积：Field 页面最终会加载全部懒加载 chunk（路由 + 3D），
  // 从构建产物统计磁盘 gzip 体积（本地 preview 的 performance API 无压缩语义）
  const transfer = measureDistTransfer();

  const report = {
    date: new Date().toISOString().slice(0, 10),
    device: "MacBook Pro (Apple Silicon) · headless Chromium · SwiftShader CPU rasterizer",
    viewport: "1280x720",
    note: "fps/frameTime 为 SwiftShader CPU 光栅化参考值，仅用于回归对比；calls/triangles 为确定性指标",
    samples,
    transfer,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`\nwritten: ${OUT}\n`);
  console.log(
    "| instances | tier | fps | frame ms | draw calls | triangles | geometries | textures |",
  );
  console.log("| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const s of samples) {
    console.log(
      `| ${s.instances} | ${s.tier} | ${s.fps} | ${s.frameTimeMs} | ${s.calls} | ${s.triangles} | ${s.geometries} | ${s.textures} |`,
    );
  }
  console.log(
    `\ntransfer: JS ${Math.round(transfer.jsBytes / 1024)} KB · CSS ${Math.round(transfer.cssBytes / 1024)} KB · total ${Math.round(transfer.totalBytes / 1024)} KB (${transfer.resourceCount} resources)`,
  );
} finally {
  if (preview.pid) process.kill(-preview.pid, "SIGTERM");
}
