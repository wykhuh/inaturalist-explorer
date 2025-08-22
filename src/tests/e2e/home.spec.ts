import { test, expect } from "@playwright/test";
import { redTaxaAutocomplete } from "../fixtures/inatApi.ts";

test("display autocomplete taxa list, selected taxon, map tiles", async ({
  page,
}) => {
  let QUERY = "red";

  await page.route(
    "https://api.inaturalist.org/v1/taxa/autocomplete?q=" + QUERY,
    async (route) => {
      const json = {
        results: redTaxaAutocomplete,
      };
      await route.fulfill({ json });
    },
  );
  await page.route(
    "https://api.inaturalist.org/v2/observations?**",
    async (route) => {
      const json = {
        total_results: 1234,
      };
      await route.fulfill({ json });
    },
  );

  await page.goto("http://localhost:5173/");
  expect(page).toHaveTitle(/iNaturalist Explorer/);

  await page.getByRole("textbox", { name: "Search species" }).fill(QUERY);

  await expect(page).toHaveScreenshot();

  let names = redTaxaAutocomplete.map((record) => record.preferred_common_name);
  for await (const name of names) {
    await expect(page.getByText(name)).toBeVisible();
  }

  let selectedTaxon = redTaxaAutocomplete[1];
  await page.getByText(selectedTaxon.preferred_common_name).click();

  const [response] = await Promise.all([
    page.waitForResponse((res) => {
      const regex = new RegExp(
        `api.inaturalist.org\/v1\/grid.*?taxon_id=${selectedTaxon.id}`,
      );
      return regex.test(res.url()) && res.status() === 200;
    }),
  ]);
  expect(response.status()).toBe(200);

  let taxaListItem = await page.getByText("1,234 observations");
  await expect(await taxaListItem.textContent()).toMatchSnapshot();
  await expect(taxaListItem).toBeVisible();

  await expect(page).toHaveScreenshot();
});
