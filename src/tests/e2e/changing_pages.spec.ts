import { test, expect } from "@playwright/test";
import {
  countsIdentificationsApi,
  countsObservationsApi,
  mapTilesApi,
  searchTaxa,
} from "./test_helpers";
import { redTaxaAutocompleteResults } from "../fixtures/inatApi";

let TAXA_QUERY = "red";

test("switch from observations page to identifications", async ({ page }) => {
  await countsObservationsApi(page);
  await countsIdentificationsApi(page);
  await mapTilesApi(page);

  await page.goto("http://localhost:5173/");

  expect(page).toHaveTitle(/iNaturalist Explorer/);

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  await page.getByRole("link", { name: "Identifications" }).click();

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });
});

test("switch from observations page to identifications with selected taxa", async ({
  page,
}) => {
  await countsObservationsApi(page);
  await countsIdentificationsApi(page);
  await mapTilesApi(page);
  await searchTaxa(page);

  await page.goto("http://localhost:5173/");

  // user enter search term
  await page.getByPlaceholder("Enter species name").fill(TAXA_QUERY);

  // user select one taxa
  let name = redTaxaAutocompleteResults[1].preferred_common_name as string;
  await page.getByText(name).click();

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  const taxonItems = page.getByTestId("taxon-list-item");
  await expect(taxonItems).toHaveCount(1);
  await expect(taxonItems).toHaveText([/Red Oaks/]);
  await expect(taxonItems).toHaveText([/100 observations/]);
  await expect(taxonItems).toHaveText([/Section Lobatae/]);

  await page.getByRole("link", { name: "Identifications" }).click();

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  await expect(taxonItems).toHaveCount(1);
  await expect(taxonItems).toHaveText([/Red Oaks/]);
  await expect(taxonItems).toHaveText([/100,000,000 identifications/]);
  await expect(taxonItems).toHaveText([/Section Lobatae/]);
});

test("switch from identifications page to observations", async ({ page }) => {
  await countsObservationsApi(page);
  await countsIdentificationsApi(page);
  await mapTilesApi(page);

  await page.goto("http://localhost:5173/identifications/");

  expect(page).toHaveTitle(/iNaturalist Explorer/);

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  await page.getByRole("link", { name: "Observations" }).click();

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });
});

test("switch from identifications page to observations with selected taxa", async ({
  page,
}) => {
  await countsObservationsApi(page);
  await countsIdentificationsApi(page);
  await mapTilesApi(page);
  await searchTaxa(page);

  await page.goto("http://localhost:5173/identifications/");

  // user enter search term
  await page.getByPlaceholder("Enter species name").fill(TAXA_QUERY);

  // user select one taxa
  let name = redTaxaAutocompleteResults[1].preferred_common_name as string;
  await page.getByText(name).click();

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  const taxonItems = page.getByTestId("taxon-list-item");
  await expect(taxonItems).toHaveCount(1);
  await expect(taxonItems).toHaveText([/Red Oaks/]);
  await expect(taxonItems).toHaveText([/100,000,000 identifications/]);
  await expect(taxonItems).toHaveText([/Section Lobatae/]);

  await page.getByRole("link", { name: "Observations" }).click();

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  await expect(taxonItems).toHaveCount(1);
  await expect(taxonItems).toHaveText([/Red Oaks/]);
  await expect(taxonItems).toHaveText([/100 observations/]);
  await expect(taxonItems).toHaveText([/Section Lobatae/]);
});
