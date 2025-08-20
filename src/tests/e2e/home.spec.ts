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

  await expect(page.getByText("Reduncines")).toBeVisible();
  await expect(page.getByText("American Robin")).toBeVisible();
  await expect(page.getByText("Northern Cardinal")).toBeVisible();
  await expect(page.getByText("Red-tailed Hawk")).toBeVisible();
  await expect(page.getByText("Agelaius Blackbirds")).toBeVisible();
  await expect(page.getByText("Red-winged Blackbird")).toBeVisible();
  await expect(page.getByText("Red Admiral")).toBeVisible();
  await expect(page.getByText("Red and Bordered Plant Bugs")).toBeVisible();
  await expect(page.getByText("Red Algae")).toBeVisible();
  await page.getByText("red oaks").click();

  const [response] = await Promise.all([
    page.waitForResponse((res) => {
      return (
        /api.inaturalist.org\/v1\/grid.*?taxon_id=861036/.test(res.url()) &&
        res.status() === 200
      );
    }),
  ]);
  expect(response.status()).toBe(200);

  let taxaListItem = await page.getByText("1,234 observations");
  await expect(await taxaListItem.textContent()).toMatchSnapshot();
  await expect(taxaListItem).toBeVisible();

  await expect(page).toHaveScreenshot();
});
