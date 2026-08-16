import { expect, test } from "@playwright/test";

/**
 * Deterministic visual contract for the first three reference screens.
 * `visual=1` disables ambient drift so geometry checks are repeatable in CI.
 */
test.describe("reference-page visual contract", () => {
  test("home composition keeps hero in the upper field", async ({ page }) => {
    await page.setViewportSize({ width: 1536, height: 1024 });
    await page.goto("/?visual=1&instances=500");
    const hero = page.locator(".field-hero__title");
    await expect(hero).toBeVisible();
    const box = await hero.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThan(360);
    expect(box!.width).toBeLessThan(700);
    await expect(page.getByRole("button", { name: "Enter the Archive" })).toBeVisible();
  });

  test("explore composition exposes navigation and filter chrome", async ({ page }) => {
    await page.setViewportSize({ width: 1536, height: 1024 });
    await page.goto("/explore?visual=1&instances=500");
    await expect(page.getByRole("heading", { name: "Explore the Field" })).toBeVisible();
    await expect(page.locator(".field-compass")).toBeVisible();
    await expect(page.locator(".filter-panel")).toBeVisible();
    const compass = await page.locator(".field-compass").boundingBox();
    expect(compass).not.toBeNull();
    expect(compass!.x + compass!.width / 2).toBeGreaterThan(500);
    expect(compass!.x + compass!.width / 2).toBeLessThan(1036);
  });

  test("mobile layout keeps the entrance and explore chrome usable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?visual=1&instances=500");
    await expect(page.locator(".field-hero__title")).toBeVisible();
    await expect(page.getByRole("button", { name: "Enter the Archive" })).toBeVisible();
    await page.goto("/explore?visual=1&instances=500");
    await expect(page.locator(".filter-panel")).toBeVisible();
    const panel = await page.locator(".filter-panel").boundingBox();
    expect(panel).not.toBeNull();
    expect(panel!.width).toBeLessThanOrEqual(390 * 0.82);
  });
});
