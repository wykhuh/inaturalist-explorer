import { test, expect } from "@playwright/test";
import {
  countsIdentificationsApi,
  countsObservationsApi,
  mapTilesApi,
} from "./test_helpers.ts";

test("switching views on observations page", async ({ page }) => {
  await countsObservationsApi(page);
  await mapTilesApi(page);

  await page.goto("http://localhost:5173/");

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  await page.getByText("Species", { exact: true }).first().click();

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  await page.getByText("Identifiers", { exact: true }).first().click();

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  await page.getByText("Observers", { exact: true }).first().click();

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });
});

test("switching views on identifications page", async ({ page }) => {
  await countsIdentificationsApi(page);
  await mapTilesApi(page);

  await page.goto("http://localhost:5173/identifications/");

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  await page.getByText("Species", { exact: true }).first().click();

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  await page.getByText("Identifiers", { exact: true }).first().click();

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  await page.getByText("Observers", { exact: true }).first().click();

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  await page.getByText("Identifications", { exact: true }).nth(2).click();

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });
});
