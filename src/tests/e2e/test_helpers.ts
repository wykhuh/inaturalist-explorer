import type { Page } from "@playwright/test";

import { redTaxaAutocompleteResults } from "../fixtures/inatApi";
import {
  observations,
  threatenedSpecies,
  observers,
  identifiers,
} from "../../data/api/observations";
import { identifications } from "../../data/api/identifications";

export async function countsObservationsApi(page: Page) {
  await iNatPhotos(page);
  await page.route(
    "https://api.inaturalist.org/v2/observations**",
    async (route) => {
      const json = observations;
      await route.fulfill({ json });
    },
  );
  await page.route(
    "https://api.inaturalist.org/v2/observations/identifiers?**",
    async (route) => {
      const json = identifiers;
      await route.fulfill({ json });
    },
  );

  await page.route(
    "https://api.inaturalist.org/v2/observations/observers**",
    async (route) => {
      const json = observers;
      await route.fulfill({ json });
    },
  );
  await page.route(
    "https://api.inaturalist.org/v2/observations/species_counts?**",
    async (route) => {
      const json = threatenedSpecies;
      await route.fulfill({ json });
    },
  );
}

export async function countsIdentificationsApi(page: Page) {
  await iNatPhotos(page);
  await page.route(
    "https://api.inaturalist.org/v2/observations**",
    async (route) => {
      const json = observations;
      await route.fulfill({ json });
    },
  );
  await page.route(
    "https://api.inaturalist.org/v1/identifications/**",
    async (route) => {
      const json = identifications;
      await route.fulfill({ json });
    },
  );
  await page.route(
    "https://api.inaturalist.org/v1/identifications/identifiers?**",
    async (route) => {
      const json = identifiers;
      await route.fulfill({ json });
    },
  );

  await page.route(
    "https://api.inaturalist.org/v1/identifications/observers**",
    async (route) => {
      const json = observers;
      await route.fulfill({ json });
    },
  );
  await page.route(
    "https://api.inaturalist.org/v1/identifications/species_counts?**",
    async (route) => {
      const json = threatenedSpecies;
      await route.fulfill({ json });
    },
  );
}

export async function mapTilesApi(page: Page) {
  await page.route("https://api.inaturalist.org/v1/grid/**", async (route) => {
    const json = { total_results: 10 };
    await route.fulfill({ json });
  });
}

export async function searchTaxa(page: Page) {
  await iNatPhotos(page);
  await page.route(
    "https://api.inaturalist.org/v1/taxa/autocomplete?**",
    async (route) => {
      const json = { results: redTaxaAutocompleteResults };
      await route.fulfill({ json });
    },
  );
}

async function iNatPhotos(page: Page) {
  await page.route(
    "https://inaturalist-open-data.s3.amazonaws.com/photos/*/**",
    async (route) => {
      const json = {};
      await route.fulfill({ json });
    },
  );

  await page.route(
    "https://static.inaturalist.org/attachments/users/icons/*/**",
    async (route) => {
      const json = {};
      await route.fulfill({ json });
    },
  );
}
