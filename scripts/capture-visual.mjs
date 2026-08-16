#!/usr/bin/env node
/** Capture deterministic Home / Explore / Selected evidence for visual review. */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";

const port = 4181;
const base = `http://127.0.0.1:${port}`;
const out = "docs/assets/verification";
const preview = spawn(
  "pnpm",
  ["exec", "vite", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
  { stdio: "ignore", detached: true },
);

try {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${base}/api/health`)).ok) break;
    } catch {
      // preview is still starting
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    args: ["--no-proxy-server", "--enable-unsafe-swiftshader"],
  });
  const page = await browser.newPage({
    viewport: { width: 1536, height: 1024 },
    deviceScaleFactor: 1,
  });

  await page.goto(`${base}/?visual=1&instances=500`);
  await page.getByRole("button", { name: "Enter the Archive" }).waitFor({ state: "visible" });
  await page.waitForTimeout(3_200);
  await page.screenshot({ path: `${out}/home-1536x1024.png` });

  await page.goto(`${base}/explore?visual=1&instances=500`);
  await page.getByRole("heading", { name: "Explore the Field" }).waitFor({ state: "visible" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/explore-1536x1024.png` });

  await page.getByRole("button", { name: "Calibration Longsword" }).click();
  await page.locator(".field-selected-card").waitFor();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/selected-1536x1024.png` });
  await browser.close();
} finally {
  if (preview.pid) process.kill(-preview.pid, "SIGTERM");
}
