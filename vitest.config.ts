import { defineConfig } from "vitest/config";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.jsonc" },
    }),
  ],
  test: {
    // 只收集单元/Worker 测试；tests/e2e/*.spec.ts 属于 Playwright。
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
  },
});
