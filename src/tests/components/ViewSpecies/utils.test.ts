// @vitest-environment jsdom

import { describe, expect, test } from "vitest";
import { observationsTaxonomy } from "../../../data/inat_api_cache";
import {
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

  test("ignores ranks that are not subspecies", () => {
    const store = structuredClone(mapStore);
    store.observationsApiParams.rank = taxonRanks
      .filter((r) => !subspeciesRanks.includes(r))
      .join(",");

    let results = validSubspeciesForStore(store);

    expect(results).toStrictEqual([]);
  });

  test("correctly handles a mix of higher ranks and subspecies ranks", () => {
    const store = structuredClone(mapStore);
    store.observationsApiParams.rank = taxonRanks.join(",");

    let results = validSubspeciesForStore(store);

    expect(results).toStrictEqual(subspeciesRanks);
  });
});

describe("getSubspeciesIds", () => {
  test("returns data about subspecies taxa that match rank", () => {
    let data = observationsTaxonomy.results;
    let expected = new Map();
    expected.set(995125, 24935);
    expected.set(339381, 1173);
    expected.set(413788, 1173);

    let results = getSubspeciesIds(data, ["subspecies"]);

    expect(results.taxaIdCount).toStrictEqual(expected);
    expect(results.subspeciesIds).toStrictEqual([995125, 339381, 413788]);
  });

  test("returns data about subspecies taxa that match multiple ranks", () => {
    let data = observationsTaxonomy.results;
    let expected = new Map();
    expected.set(995125, 24935);
    expected.set(339381, 1173);
    expected.set(413788, 1173);
    expected.set(1566671, 63);

    let results = getSubspeciesIds(data, subspeciesRanks);

    expect(results.taxaIdCount).toStrictEqual(expected);
    expect(results.subspeciesIds).toStrictEqual([
      995125, 339381, 413788, 1566671,
    ]);
  });
});
