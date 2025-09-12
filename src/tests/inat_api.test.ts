// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import { redOaksSpeciesCount } from "./fixtures/inatApi.js";
import { getiNatMapTiles } from "../lib/inat_api.js";
import type { iNatApiParams } from "../types/app.js";
import { lifeBasic } from "./test_helpers.js";

test("observations species count", () => {
  let res = redOaksSpeciesCount.results.reduce((prev, current) => {
    return prev + current.count;
  }, 0);
  expect(res).toBe(394602);
});

describe("getiNatMapTiles", () => {
  test("returns 3 iNaturalist tiles if no inatApiParams", () => {
    let inatApiParams: iNatApiParams = {};
    let taxon = lifeBasic;
    let result = getiNatMapTiles(inatApiParams, taxon);

    expect(result.iNatGrid.url).toBe(
      "https://api.inaturalist.org/v1/grid/{z}/{x}/{y}.png?color=%23EB5528",
    );
    expect(result.iNatHeatmap.url).toBe(
      "https://api.inaturalist.org/v1/heatmap/{z}/{x}/{y}.png?",
    );
    expect(result.iNatPoint.url).toBe(
      "https://api.inaturalist.org/v1/points/{z}/{x}/{y}.png?color=%23EB5528",
    );
    expect(result.iNatTaxonRange).toBe(undefined);
  });

  test("returns 3 iNaturalist tiles if taxon_id is zero", () => {
    let inatApiParams: iNatApiParams = { taxon_id: "0" };
    let taxon = lifeBasic;
    let result = getiNatMapTiles(inatApiParams, taxon);

    expect(result.iNatGrid.url).toBe(
      "https://api.inaturalist.org/v1/grid/{z}/{x}/{y}.png?color=%23EB5528",
    );
    expect(result.iNatHeatmap.url).toBe(
      "https://api.inaturalist.org/v1/heatmap/{z}/{x}/{y}.png?",
    );
    expect(result.iNatPoint.url).toBe(
      "https://api.inaturalist.org/v1/points/{z}/{x}/{y}.png?color=%23EB5528",
    );
    expect(result.iNatTaxonRange).toBe(undefined);
  });
});
