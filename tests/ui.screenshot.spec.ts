import { test, expect } from "@playwright/test";

test("home renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Book Smith")).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  await expect(page).toHaveScreenshot("home.png", { fullPage: true });
});


