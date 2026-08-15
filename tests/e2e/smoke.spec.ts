import { expect, test } from "@playwright/test";

test.describe("Gate 0 smoke", () => {
  test("home page renders the archive entrance", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("UNLIMITED");
    await expect(page.getByRole("link", { name: "Enter the Field" })).toBeVisible();
  });

  test("deep link to a blade record survives a full reload (SPA fallback)", async ({ page }) => {
    await page.goto("/blades/calibration-katana");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Calibration Katana");
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Calibration Katana");
  });

  test("unknown blade slug shows the record error state", async ({ page }) => {
    await page.goto("/blades/no-such-blade");
    await expect(page.getByText("Record unavailable")).toBeVisible();
  });

  test("client-side navigation reaches the Blade Field page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Enter the Field" }).click();
    await expect(page).toHaveURL(/\/lab\/blade-field$/);
    await expect(page.getByRole("heading", { name: "Blade Field" })).toBeVisible();
  });

  test("unknown frontend route shows the 404 page, not a blank SPA shell", async ({ page }) => {
    await page.goto("/definitely/not/a/route");
    await expect(page.getByText("This path does not exist.")).toBeVisible();
  });

  test("GET /api/health returns ok JSON", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/json");
    expect(await res.json()).toMatchObject({ status: "ok" });
  });

  test("unknown /api route returns JSON 404 instead of index.html", async ({ request }) => {
    const res = await request.get("/api/nonexistent");
    expect(res.status()).toBe(404);
    expect(res.headers()["content-type"]).toContain("application/json");
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("not_found");
  });
});
