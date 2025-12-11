// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import { redOaksSpeciesCountApi } from "./fixtures/inatApi.js";
import { getiNatMapTiles } from "../lib/inat_api.js";
import type { MapTilesAPIParams, NormalizediNatTaxon } from "../types/app.js";
import { lifeBasic } from "./test_helpers.js";
import { iNatOrange } from "../lib/map_colors_utils.js";
import { allTaxaRecord } from "../data/inat_data.js";

test("observations species count", () => {
  let res = redOaksSpeciesCountApi.results.reduce((prev, current) => {
    return prev + current.count;
  }, 0);
  expect(res).toBe(394602);
});

describe("getiNatMapTiles", () => {
  let color = new URLSearchParams({ color: iNatOrange });

  test("returns 4 iNaturalist tiles for a taxon", () => {
    let mapTilesAPIParams: MapTilesAPIParams = {
      color: iNatOrange,
      taxon_id: `${lifeBasic.id}`,
    };
    let taxon = { ...lifeBasic, color: iNatOrange };

    let result = getiNatMapTiles(mapTilesAPIParams, taxon);

    expect(result.iNatGrid.url).toBe(
      `https://api.inaturalist.org/v1/grid/{z}/{x}/{y}.png?${color}&taxon_id=${lifeBasic.id}`,
    );
    expect(result.iNatHeatmap.url).toBe(
      `https://api.inaturalist.org/v1/heatmap/{z}/{x}/{y}.png?taxon_id=${lifeBasic.id}`,
    );
    expect(result.iNatPoint.url).toBe(
      `https://api.inaturalist.org/v1/points/{z}/{x}/{y}.png?${color}&taxon_id=${lifeBasic.id}`,
    );
    expect(result.iNatTaxonRange?.url).toBe(
      `https://api.inaturalist.org/v1/taxon_ranges/${lifeBasic.id}/{z}/{x}/{y}.png?${color}`,
    );
  });

  test("returns 3 iNaturalist tiles for allTaxaRecord taxon", () => {
    let mapTilesAPIParams: MapTilesAPIParams = {
      color: iNatOrange,
      taxon_id: `${allTaxaRecord.id}`,
    };
    let taxon = { ...allTaxaRecord, color: iNatOrange };

    let result = getiNatMapTiles(mapTilesAPIParams, taxon);

    expect(result.iNatGrid.url).toBe(
      `https://api.inaturalist.org/v1/grid/{z}/{x}/{y}.png?${color}`,
    );
    expect(result.iNatHeatmap.url).toBe(
      `https://api.inaturalist.org/v1/heatmap/{z}/{x}/{y}.png?`,
    );
    expect(result.iNatPoint.url).toBe(
      `https://api.inaturalist.org/v1/points/{z}/{x}/{y}.png?${color}`,
    );
    expect(result.iNatTaxonRange).toBe(undefined);
  });

  test("returns 3 iNaturalist tiles if no taxon", () => {
    let mapTilesAPIParams: MapTilesAPIParams = {
      color: iNatOrange,
    };
    let taxon = {} as NormalizediNatTaxon;

    let result = getiNatMapTiles(mapTilesAPIParams, taxon);

    expect(result.iNatGrid.url).toBe(
      `https://api.inaturalist.org/v1/grid/{z}/{x}/{y}.png?${color}`,
    );
    expect(result.iNatHeatmap.url).toBe(
      `https://api.inaturalist.org/v1/heatmap/{z}/{x}/{y}.png?`,
    );
    expect(result.iNatPoint.url).toBe(
      `https://api.inaturalist.org/v1/points/{z}/{x}/{y}.png?${color}`,
    );
    expect(result.iNatTaxonRange).toBe(undefined);
  });
});
