import { test, expect } from "@playwright/test";
import {
  redTaxaAutocomplete,
  losAngelesSearchPlaces,
} from "../fixtures/inatApi.ts";

let TAXA_QUERY = "red";
let PLACES_QUERY = "los";

test.beforeEach(async ({ page }) => {
  console.log(`Running ${test.info().title}`); // keep
  await page.route(
    "https://api.inaturalist.org/v1/taxa/autocomplete?**",
    async (route) => {
      const json = { results: redTaxaAutocomplete };
      await route.fulfill({ json });
    },
  );
  await page.route(
    "https://api.inaturalist.org/v2/observations?**",
    async (route) => {
      const json = { total_results: 1234 };
      await route.fulfill({ json });
    },
  );
  await page.route(
    "https://api.inaturalist.org/v1/search?sources=places**",
    async (route) => {
      const json = losAngelesSearchPlaces;
      await route.fulfill({ json });
    },
  );
});

test("search taxa workflow", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  expect(page).toHaveTitle(/iNaturalist Explorer/);

  // user enter search term
  await page.getByRole("textbox", { name: "Search species" }).fill(TAXA_QUERY);

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  // app show list of search results
  let names = redTaxaAutocomplete.map((record) => record.preferred_common_name);
  for await (const name of names) {
    await expect(page.getByText(name as string)).toBeVisible();
  }

  // user select one taxa
  let selectedTaxon = redTaxaAutocomplete[1];
  await page.getByText(selectedTaxon.preferred_common_name as string).click();

  // app makes requests for iNaturalist grid map tiles
  const [response] = await Promise.all([
    page.waitForResponse((res) => {
      const regex = new RegExp(
        `api.inaturalist.org\/v1\/grid.*?taxon_id=${selectedTaxon.id}`,
      );
      return regex.test(res.url()) && res.status() === 200;
    }),
  ]);
  expect(response.status()).toBe(200);

  // app adds taxa item
  const taxonItems = page.getByTestId("taxon-list-item");
  await expect(taxonItems).toHaveCount(1);
  await expect(taxonItems).toHaveText([/red oaks/]);
  await expect(taxonItems).toHaveText([/1,234 observations/]);
  await expect(taxonItems).toHaveText([/Lobatae/]);

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });
});

test("search taxa, remove taxa workflow", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  // user enter search term
  await page.getByRole("textbox", { name: "Search species" }).fill(TAXA_QUERY);

  // user select one taxa
  let selectedTaxon = redTaxaAutocomplete[1];
  await page.getByText(selectedTaxon.preferred_common_name as string).click();

  // add adds taxon item
  const taxonItems = page.getByTestId("taxon-list-item");
  await expect(taxonItems).toHaveCount(1);
  await expect(taxonItems).toHaveText([/red oaks/]);

  // user click taxa close button
  const closeButtons = page.getByTestId("taxon-list-item-close");
  await closeButtons.nth(0).click();

  // app removes taxon item
  await expect(taxonItems).toHaveCount(0);
  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });
});

test("search places workflow", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  expect(page).toHaveTitle(/iNaturalist Explorer/);

  // user enter search term
  await page.getByRole("textbox", { name: "Search places" }).fill(PLACES_QUERY);

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });

  // app show list of search results
  let names = losAngelesSearchPlaces.results.map(
    (result) => result.record.display_name,
  );
  for await (const name of names) {
    await expect(page.getByText(name as string)).toBeVisible();
  }

  // user select one place
  await page.getByText("Los Angeles County, US, CA").click();

  // app makes requests for iNaturalist grid map tiles
  const [response] = await Promise.all([
    page.waitForResponse((res) => {
      const regex = new RegExp(
        `api.inaturalist.org\/v1\/grid.*?taxon_id=48460`,
      );
      return regex.test(res.url()) && res.status() === 200;
    }),
  ]);
  expect(response.status()).toBe(200);

  // app adds places item
  const placeItems = page.getByTestId("place-list-item");
  await expect(placeItems).toHaveCount(1);
  await expect(placeItems).toHaveText([/Los Angeles/]);

  // app adds taxon item
  const taxonItems = page.getByTestId("taxon-list-item");
  await expect(taxonItems).toHaveCount(1);
  await expect(taxonItems).toHaveText([/Life/]);

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });
});

test("search places, remove place workflow", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  // user enter search term
  await page.getByRole("textbox", { name: "Search places" }).fill(PLACES_QUERY);

  // user select one place
  await page.getByText("Los Angeles County, US, CA").click();

  // app adds place item
  const placeItems = page.getByTestId("place-list-item");
  await expect(placeItems).toHaveCount(1);
  await expect(placeItems).toHaveText([/Los Angeles/]);

  // app adds taxon item
  const taxonItems = page.getByTestId("taxon-list-item");
  await expect(taxonItems).toHaveCount(1);
  await expect(taxonItems).toHaveText([/Life/]);

  // user click places close button
  const closeButtons = page.getByTestId("place-list-item-close");
  await closeButtons.nth(0).click();

  // app removes place and taxon items
  await expect(placeItems).toHaveCount(0);
  await expect(taxonItems).toHaveCount(0);

  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });
});

test("search places, remove taxon workflow", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  // user enter search term
  await page.getByRole("textbox", { name: "Search places" }).fill(PLACES_QUERY);

  // user select one place
  await page.getByText("Los Angeles County, US, CA").click();

  // app adds place item
  const placeItems = page.getByTestId("place-list-item");
  await expect(placeItems).toHaveCount(1);
  await expect(placeItems).toHaveText([/Los Angeles/]);

  // app adds tacon item
  const taxonItems = page.getByTestId("taxon-list-item");
  await expect(taxonItems).toHaveCount(1);
  await expect(taxonItems).toHaveText([/Life/]);

  // user click taxon close button
  const closeButtons = page.getByTestId("taxon-list-item-close");
  await closeButtons.nth(0).click();

  // app removes taxon item
  await expect(placeItems).toHaveCount(1);
  await expect(taxonItems).toHaveCount(0);

  // await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });
});

test("search taxa, search place workflow", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  // user enter search term
  await page.getByRole("textbox", { name: "Search species" }).fill(TAXA_QUERY);

  // user select one taxa
  let selectedTaxon = redTaxaAutocomplete[1];
  await page.getByText(selectedTaxon.preferred_common_name as string).click();

  // user enter search term
  await page.getByRole("textbox", { name: "Search places" }).fill(PLACES_QUERY);

  // user select one place
  await page.getByText("Los Angeles County, US, CA").click();

  // app adds place item
  const placeItems = page.getByTestId("place-list-item");
  await expect(placeItems).toHaveCount(1);
  await expect(placeItems).toHaveText([/Los Angeles/]);

  // app adds taxon item
  const taxonItems = page.getByTestId("taxon-list-item");
  await expect(taxonItems).toHaveCount(1);
  await expect(taxonItems).toHaveText([/red oaks/]);
});
