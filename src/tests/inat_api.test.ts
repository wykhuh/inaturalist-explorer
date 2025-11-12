// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import { redOaksSpeciesCountApi } from "./fixtures/inatApi.js";
import { getiNatMapTiles } from "../lib/inat_api.js";
import type { ObservationsApiParams } from "../types/app.js";
import { lifeBasic } from "./test_helpers.js";
import { iNatOrange } from "../lib/map_colors_utils.js";

test("observations species count", () => {
  let res = redOaksSpeciesCountApi.results.reduce((prev, current) => {
    return prev + current.count;
  }, 0);
  expect(res).toBe(394602);
});

describe("getiNatMapTiles", () => {
  let color = new URLSearchParams({ color: iNatOrange });

  test("returns 3 iNaturalist tiles if no observationsApiParams", () => {
    let observationsApiParams: ObservationsApiParams = {};
    let taxon = lifeBasic;
    let result = getiNatMapTiles(observationsApiParams, taxon);

    expect(result.iNatGrid.url).toBe(
      `https://api.inaturalist.org/v1/grid/{z}/{x}/{y}.png?${color}`,
    );
    expect(result.iNatHeatmap.url).toBe(
      "https://api.inaturalist.org/v1/heatmap/{z}/{x}/{y}.png?",
    );
    expect(result.iNatPoint.url).toBe(
      `https://api.inaturalist.org/v1/points/{z}/{x}/{y}.png?${color}`,
    );
    expect(result.iNatTaxonRange).toBe(undefined);
  });

  test("returns 3 iNaturalist tiles if taxon_id is zero", () => {
    let observationsApiParams: ObservationsApiParams = { taxon_id: "0" };
    let taxon = lifeBasic;
    let result = getiNatMapTiles(observationsApiParams, taxon);

    expect(result.iNatGrid.url).toBe(
      `https://api.inaturalist.org/v1/grid/{z}/{x}/{y}.png?${color}`,
    );
    expect(result.iNatHeatmap.url).toBe(
      "https://api.inaturalist.org/v1/heatmap/{z}/{x}/{y}.png?",
    );
    expect(result.iNatPoint.url).toBe(
      `https://api.inaturalist.org/v1/points/{z}/{x}/{y}.png?${color}`,
    );
    expect(result.iNatTaxonRange).toBe(undefined);
  });
});
