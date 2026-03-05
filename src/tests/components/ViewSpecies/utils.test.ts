// @vitest-environment jsdom

import { describe, expect, test } from "vitest";
import { observationsTaxonomy } from "../../../data/api/taxonomy";
import {
  calculateSubspeciesIdsOffset,
  getSubspeciesIds,
  validSubspeciesForStore,
} from "../../../components/ViewSpecies/utils";
import { subspeciesRanks, taxonRanks } from "../../../data/inat_data";
import { mapStore } from "../../../lib/store";

describe("validSubspeciesForStore", () => {
  test.each(subspeciesRanks)(
    "returns subspecies ranks that are in observationsApiParams.rank",
    (rank) => {
      const store = structuredClone(mapStore);
      store.observationsApiParams.rank = rank;

      let results = validSubspeciesForStore(store);

      expect(results).toStrictEqual([rank]);
    },
  );

  test("ignores higher ranks that are not subspecies", () => {
    const store = structuredClone(mapStore);
    store.observationsApiParams.rank = taxonRanks
      .filter((r) => !subspeciesRanks.includes(r))
      .join(",");

    let results = validSubspeciesForStore(store);

    expect(results).toStrictEqual([]);
  });

  test("returns subspeices if there is a mix of higher ranks and subspecies ranks", () => {
    const store = structuredClone(mapStore);
    store.observationsApiParams.rank = taxonRanks.join(",");

    let results = validSubspeciesForStore(store);

    expect(results).toStrictEqual(subspeciesRanks);
  });
});

describe("getSubspeciesIds", () => {
  test("returns data about subspecies taxa that match rank", () => {
    let data = observationsTaxonomy.results;

    let results = getSubspeciesIds(data, ["subspecies"]);

    expect(results.taxaIdCount).toStrictEqual({
      339381: 1173,
      413788: 1173,
      995125: 24935,
    });
    expect(results.subspeciesIds).toStrictEqual([995125, 339381, 413788]);
  });

  test("returns data about subspecies taxa that match multiple ranks", () => {
    let data = observationsTaxonomy.results;

    let results = getSubspeciesIds(data, subspeciesRanks);

    expect(results.taxaIdCount).toStrictEqual({
      339381: 1173,
      413788: 1173,
      995125: 24935,
      1566671: 63,
    });
    expect(results.subspeciesIds).toStrictEqual([
      995125, 339381, 413788, 1566671,
    ]);
  });
});

describe("calculateSubspeciesIdsOffset", () => {
  test("returns undefined if all records on current page are species records", () => {
    let speciesData = { page: 1, per_page: 10, total_results: 15, results: [] };
    let subspeciesIds = [1, 2, 3, 4, 5];

    let result = calculateSubspeciesIdsOffset(speciesData, subspeciesIds);

    expect(result).toStrictEqual(undefined);
  });

  test("returns all subspeciesIds if number of species records and number of subspeciesIds is below per_page", () => {
    let speciesData = { page: 2, per_page: 10, total_results: 15, results: [] };
    let subspeciesIds = [1, 2, 3];

    let result = calculateSubspeciesIdsOffset(speciesData, subspeciesIds);

    expect(result).toStrictEqual([1, 2, 3]);
  });

  test("returns all subspeciesIds if number of species records and number of subspeciesIds equal per_page", () => {
    let speciesData = { page: 2, per_page: 10, total_results: 15, results: [] };
    let subspeciesIds = [1, 2, 3, 4, 5];

    let result = calculateSubspeciesIdsOffset(speciesData, subspeciesIds);

    expect(result).toStrictEqual([1, 2, 3, 4, 5]);
  });

  test("returns partial subspeciesIds if number of species records and number of subspeciesIds excedes per_page", () => {
    let speciesData = { page: 2, per_page: 10, total_results: 15, results: [] };
    let subspeciesIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    let result = calculateSubspeciesIdsOffset(speciesData, subspeciesIds);

    expect(result).toStrictEqual([1, 2, 3, 4, 5]);
  });

  test("returns subspeciesIds if no species records on current page and number of subspeciesIds is below per_page", () => {
    let speciesData = { page: 3, per_page: 10, total_results: 15, results: [] };
    let subspeciesIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let result = calculateSubspeciesIdsOffset(speciesData, subspeciesIds);
    expect(result).toStrictEqual([6, 7, 8, 9, 10]);
  });

  test("returns subspeciesIds if no species records on current page and number of subspeciesIds excedes per_page", () => {
    let speciesData = { page: 3, per_page: 10, total_results: 15, results: [] };
    let subspeciesIds = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ];
    let result = calculateSubspeciesIdsOffset(speciesData, subspeciesIds);
    expect(result).toStrictEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  test("returns subspeciesIds if no species records on current page and number of subspeciesIds is below per_page", () => {
    let speciesData = { page: 4, per_page: 10, total_results: 15, results: [] };
    let subspeciesIds = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ];
    let result = calculateSubspeciesIdsOffset(speciesData, subspeciesIds);
    expect(result).toStrictEqual([16, 17, 18, 19, 20]);
  });
});
