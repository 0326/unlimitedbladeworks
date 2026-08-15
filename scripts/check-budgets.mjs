#!/usr/bin/env node
/**
 * Gate 0 资源预算门禁：解析 Vite 构建产物，校验初始 JS 与单 chunk 体积。
 * 超预算时以非零码退出，用于 CI 阻止超预算构建。
 *
 * 用法：先 `pnpm build`，再 `pnpm check:budgets`。
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";

// Phase 0 预算：初始 JS（gzip）150 KB。Phase 1 加入 R3F 后依据 profiling 重新冻结。
const BUDGETS = {
  initialJsGzipBytes: 150 * 1024,
  maxChunkGzipBytes: 300 * 1024,
};

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function findClientRoot() {
  for (const candidate of ["dist/client", "dist"]) {
    const manifestDir = path.join(candidate, ".vite");
    if (existsSync(manifestDir)) return candidate;
    if (existsSync(path.join(candidate, "index.html"))) return candidate;
  }
  console.error("budget check: no build output found. Run `pnpm build` first.");
  process.exit(2);
}

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

const clientRoot = findClientRoot();
const manifestPath = path.join(clientRoot, ".vite", "manifest.json");

/** 计算入口及其静态 import 闭包，即首屏必须下载的 JS。 */
function resolveInitialChunks() {
  if (!existsSync(manifestPath)) {
    console.warn(
      "budget check: manifest 未找到，退化为全量 JS 检查（请在 vite.config 保留 build.manifest）。",
    );
    return null;
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const entryKeys = Object.keys(manifest).filter((key) => manifest[key].isEntry);
  const visited = new Set();
  const queue = [...entryKeys];
  while (queue.length > 0) {
    const key = queue.pop();
    if (!key || visited.has(key)) continue;
    visited.add(key);
    for (const imported of manifest[key].imports ?? []) queue.push(imported);
  }
  return [...visited]
    .map((key) => manifest[key].file)
    .filter((file) => file?.endsWith(".js"))
    .map((file) => path.join(clientRoot, file));
}

const allJsFiles = listFiles(clientRoot).filter((file) => file.endsWith(".js"));
const initialFiles = resolveInitialChunks() ?? allJsFiles;

const gzipSize = (file) => gzipSync(readFileSync(file)).length;

const initialTotal = initialFiles.reduce((sum, file) => sum + gzipSize(file), 0);
const largestChunk = allJsFiles
  .map((file) => ({ file: path.relative(clientRoot, file), gzip: gzipSize(file) }))
  .sort((a, b) => b.gzip - a.gzip)[0];

console.log(`budget check: client root = ${clientRoot}`);
console.log(`  initial JS (${initialFiles.length} chunks, gzip): ${formatKb(initialTotal)}`);
console.log(`  budget:                              ${formatKb(BUDGETS.initialJsGzipBytes)}`);
if (largestChunk) {
  console.log(
    `  largest chunk: ${largestChunk.file} — ${formatKb(largestChunk.gzip)} (budget ${formatKb(BUDGETS.maxChunkGzipBytes)})`,
  );
}

let failed = false;
if (initialTotal > BUDGETS.initialJsGzipBytes) {
  console.error(
    `FAIL: initial JS ${formatKb(initialTotal)} exceeds budget ${formatKb(BUDGETS.initialJsGzipBytes)}`,
  );
  failed = true;
}
if (largestChunk && largestChunk.gzip > BUDGETS.maxChunkGzipBytes) {
  console.error(
    `FAIL: chunk ${largestChunk.file} ${formatKb(largestChunk.gzip)} exceeds single-chunk budget ${formatKb(BUDGETS.maxChunkGzipBytes)}`,
  );
  failed = true;
}
if (!failed) console.log("budget check: PASS");
process.exit(failed ? 1 : 0);
