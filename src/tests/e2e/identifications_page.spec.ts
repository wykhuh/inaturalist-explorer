import { test, expect } from "@playwright/test";
import { redTaxaAutocompleteResults } from "../fixtures/inatApi.ts";
import {
  countsIdentificationsApi,
  mapTilesApi,
  searchTaxa,
} from "./test_helpers.ts";

let TAXA_QUERY = "red";

test("loads identifications page", async ({ page }) => {
  await countsIdentificationsApi(page);
  await mapTilesApi(page);

  await page.goto("http://localhost:5173/identifications/");

  expect(page).toHaveTitle(/iNaturalist Explorer/);

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  await page.getByTestId("observations-controls").scrollIntoViewIfNeeded();

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });
});

test("when user types in species name, shows dropdown menu with taxa search results", async ({
  page,
}) => {
  await countsIdentificationsApi(page);
  await mapTilesApi(page);
  await searchTaxa(page);

  await page.goto("http://localhost:5173/identifications/");

  // user enter search term
  await page.getByPlaceholder("Enter species name").fill(TAXA_QUERY);

  await expect(page).toHaveScreenshot({ maxDiffPixels: 10000 });

  // app show list of search results
  let commonNames = redTaxaAutocompleteResults.map(
    (record) => record.preferred_common_name,
  );
  for await (const name of commonNames) {
    await expect(page.getByText(name as string)).toBeVisible();
  }
});

test("when user selects a species from search results, shows selected species", async ({
  page,
}) => {
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

  // display selected taxa
  const taxonItems = page.getByTestId("taxon-list-item");
  await expect(taxonItems).toHaveCount(1);
  await expect(taxonItems).toHaveText([/Red Oaks/]);
  await expect(taxonItems).toHaveText([/100,000,000 identifications/]);
  await expect(taxonItems).toHaveText([/Section Lobatae/]);
});

test("user removes selected taxa", async ({ page }) => {
  await countsIdentificationsApi(page);
  await mapTilesApi(page);
  await searchTaxa(page);

  await page.goto("http://localhost:5173/identifications/");

  // user enter search term
  await page.getByPlaceholder("Enter species name").fill(TAXA_QUERY);

  // user select one taxa
  let name = redTaxaAutocompleteResults[1].preferred_common_name as string;
  await page.getByText(name).click();

  // user click taxa close button
  const closeButtons = page.getByTestId("taxon-list-item-close");
  await closeButtons.nth(0).click();

  // shows all species
  const taxonItems = page.getByTestId("taxon-list-item");
  await expect(taxonItems).toHaveCount(0);

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });
});
