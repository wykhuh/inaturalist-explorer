import { test, expect } from "@playwright/test";

test("loads about page", async ({ page }) => {
  await page.goto("http://localhost:5173/about/");

  expect(page).toHaveTitle(/iNaturalist Explorer/);

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });
});
