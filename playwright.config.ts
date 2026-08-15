/// <reference types="node" />
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    // 测试只访问本地 preview 服务，绕开系统/环境代理。
    launchOptions: { args: ["--no-proxy-server"] },
  },
  webServer: {
    // --host 127.0.0.1 强制 IPv4，避免 vite preview 仅绑定 ::1 导致探测失败。
    command: "pnpm build && pnpm exec vite preview --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
