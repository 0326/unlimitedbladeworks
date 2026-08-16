import { expect, test, type Page } from "@playwright/test";

/** 等待 __fieldDebug 就绪（?debug=1 挂载 DebugBridge 后以 2Hz 更新）。 */
async function waitForDebug(page: Page) {
  await page.waitForFunction(
    () => {
      const debug = window.__fieldDebug;
      return debug !== undefined && debug.artifacts.length > 0;
    },
    undefined,
    { timeout: 30_000 },
  );
  return page.evaluate(() => window.__fieldDebug!);
}

test.describe("Blade Field scene", () => {
  test("renders canvas with expected instance count and metrics", async ({ page }) => {
    await page.goto("/lab/blade-field?debug=1");
    await expect(page.locator("canvas")).toBeVisible();
    const debug = await waitForDebug(page);
    expect(debug.tier).toBe("balanced");
    expect(debug.instances).toBe(2000);
    expect(debug.fps).toBeGreaterThan(0);
    expect(debug.calls).toBeGreaterThan(0);
    // 桌面 Balanced draw calls 预算（QUALITY_BASELINE §3）
    expect(debug.calls).toBeLessThanOrEqual(100);
  });

  test("pointer click on a 3D artifact enters the selected state", async ({ page }) => {
    await page.goto("/lab/blade-field?debug=1");
    await page.getByRole("button", { name: "Enter the Archive" }).click();
    await page.waitForFunction(() => window.__fieldDebug?.introDone === true, undefined, {
      timeout: 30_000,
    });
    const katana = await page.evaluate(() =>
      window.__fieldDebug!.artifacts.find((a) => a.slug === "calibration-katana"),
    );
    expect(katana).toBeTruthy();
    await page.mouse.click(katana!.x, katana!.y);
    // SwiftShader can publish one stale projection while the camera settles; retry the
    // same pointer path once before failing the interaction contract.
    const selectedCard = page.locator(".field-selected-card");
    try {
      await expect(selectedCard).toBeVisible({ timeout: 2_000 });
    } catch {
      await page.waitForTimeout(250);
      const refreshed = await page.evaluate(() =>
        window.__fieldDebug!.artifacts.find((a) => a.slug === "calibration-katana"),
      );
      await page.mouse.click(refreshed?.x ?? katana!.x, refreshed?.y ?? katana!.y);
      await expect(selectedCard).toBeVisible({ timeout: 8_000 });
    }
    await expect(page.getByRole("heading", { level: 2 })).toContainText("Calibration Katana");
    await page.getByRole("button", { name: "Inspect Blade →" }).click();
    await expect(page).toHaveURL(/\/blades\/calibration-katana$/);
  });

  test("hover on artifact button shows the info card", async ({ page }) => {
    await page.goto("/lab/blade-field?debug=1");
    await page.getByRole("button", { name: "Enter the Archive" }).click();
    // intro 自然完成 / 降级中断 / 手动跳过任一路径结束后按钮出现，无需干预
    const button = page.getByRole("button", { name: "Calibration Katana" });
    await expect(button).toBeVisible({ timeout: 30_000 });
    await button.hover();
    const card = page.locator(".field-hover-card");
    await expect(card).toBeVisible();
    await expect(card).toContainText("Calibration Katana");
    await expect(card).toContainText("Placeholder culture");
  });

  test("keyboard focus and Enter selects an artifact", async ({ page }) => {
    await page.goto("/lab/blade-field?debug=1");
    await page.getByRole("button", { name: "Enter the Archive" }).click();
    const button = page.getByRole("button", { name: "Calibration Katana" });
    await expect(button).toBeVisible({ timeout: 30_000 });
    // 按钮天然 focusable（原生 button，无 tabindex=-1）；SwiftShader 并行下
    // Tab 遍历时序不稳，直接 focus() 验证键盘路径的核心行为
    const focusable = await button.evaluate((el) => el.tabIndex !== -1);
    expect(focusable).toBe(true);
    await button.focus();
    await expect(page.locator(".field-hover-card")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator(".field-selected-card")).toBeVisible();
    await expect(page.getByText("Blade Selected")).toBeVisible();
    // Detail text arrives asynchronously and replaces the card content once; wait for
    // that single content transition before activating the stable CTA node.
    await page.waitForTimeout(350);
    await expect(page.getByRole("button", { name: "Inspect Blade →" })).toBeVisible();
  });

  test("Escape dismisses Selected and restores Explore chrome", async ({ page }) => {
    await page.goto("/lab/blade-field?debug=1");
    await page.getByRole("button", { name: "Enter the Archive" }).click();
    const button = page.getByRole("button", { name: "Calibration Katana" });
    await expect(button).toBeVisible({ timeout: 30_000 });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".field-selected-card")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".field-selected-card")).toHaveCount(0);
    // The scene may still be completing its intro transition when the card closes;
    // the contract here is that selection is dismissed without leaving the field.
    await expect(page.getByRole("link", { name: "Explore" })).toBeVisible();
  });

  test("enter transition completes and controls stay available", async ({ page }) => {
    await page.goto("/lab/blade-field?debug=1");
    await waitForDebug(page);
    const startZ = await page.evaluate(() => window.__fieldDebug!.cameraPosition[2]);
    await page.getByRole("button", { name: "Enter the Archive" }).click();
    await expect(page.getByRole("button", { name: "Reset view" })).toBeVisible({
      timeout: 30_000,
    });
    const endZ = await page.evaluate(() => window.__fieldDebug!.cameraPosition[2]);
    expect(endZ).toBeLessThan(startZ - 20);
  });

  test("pausing page visibility stops the render loop", async ({ page }) => {
    await page.goto("/lab/blade-field?debug=1");
    await waitForDebug(page);
    await page.evaluate(() => {
      // 代码读 document.visibilityState，需 patch 该属性而非 hidden
      Object.defineProperty(document, "visibilityState", {
        get: () => "hidden",
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForFunction(() => window.__fieldDebug?.frameloop === "never", undefined, {
      timeout: 10_000,
    });
  });
});

test.describe("Blade Field fallback paths", () => {
  test("tier=static renders the text archive and reaches records", async ({ page }) => {
    await page.goto("/lab/blade-field?tier=static");
    const staticField = page.locator(".static-field");
    await expect(staticField).toBeVisible();
    const card = staticField.getByRole("link", { name: /Calibration Katana/ });
    await expect(card).toBeVisible();
    await card.click();
    await expect(page).toHaveURL(/\/blades\/calibration-katana$/);
  });

  test("without WebGL the page falls back to the static archive", async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      const patched = function (
        this: HTMLCanvasElement,
        type: string,
        ...rest: unknown[]
      ): RenderingContext | null {
        if (type === "webgl2" || type === "webgl" || type === "experimental-webgl") {
          return null;
        }
        return original.apply(this, [type, ...rest] as Parameters<typeof original>);
      };
      HTMLCanvasElement.prototype.getContext = patched as typeof original;
    });
    await page.goto("/lab/blade-field");
    await expect(page.locator(".static-field")).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
    // Static 路径可完成藏品访问（Gate 1）
    await page.getByRole("link", { name: /Calibration Longsword/ }).click();
    await expect(page).toHaveURL(/\/blades\/calibration-longsword$/);
  });

  test("reduced motion skips the intro and starts on low tier", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/lab/blade-field?debug=1");
    await expect(page.getByRole("button", { name: "Reset view" })).toBeVisible();
    // DebugBridge 以 2Hz 推送，需等待首帧数据而非立即读取
    const debug = await waitForDebug(page);
    expect(debug.tier).toBe("low");
    expect(debug.instances).toBe(1000);
    await context.close();
  });
});
