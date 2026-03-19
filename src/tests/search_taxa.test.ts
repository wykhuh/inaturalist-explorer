// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import { removePopularFieldsForTaxon } from "../lib/search_taxa";
import { mapStore } from "../lib/store";
import { createPopularFieldCache, monarchBasic, redOak } from "./test_helpers";
import type {
  NormalizediNatTaxonType,
  PopularFieldsByTermId,
} from "../types/app";

describe("removePopularFieldsForTaxon", () => {
  function setupCache(
    plantTaxa: NormalizediNatTaxonType[],
    animalTaxa: NormalizediNatTaxonType[],
  ) {
    let cache = {} as PopularFieldsByTermId;
    plantTaxa.forEach((taxon) => {
      if (!cache["12"]) {
        cache["12"] = [];
      }
      cache["12"].push(createPopularFieldCache(taxon, 12));

      if (!cache["9"]) {
        cache["9"] = [];
      }
      cache["9"].push(createPopularFieldCache(taxon, 9));
    });

    animalTaxa.forEach((taxon) => {
      if (!cache["1"]) {
        cache["1"] = [];
      }
      cache["1"].push(createPopularFieldCache(taxon, 1));

      if (!cache["9"]) {
        cache["9"] = [];
      }
      cache["9"].push(createPopularFieldCache(taxon, 9));
    });
    return cache;
  }

  test("remove corresponding popular fields for a given taxon", () => {
    let store = structuredClone(mapStore);
    let oak = redOak();
    store.selectedTaxa = [oak];
    store.cacheData.observations.popularFields = setupCache([oak], []);

    expect(store.cacheData.observations.popularFields).toStrictEqual({
      12: [createPopularFieldCache(oak, 12)],
      9: [createPopularFieldCache(oak, 9)],
    });

    removePopularFieldsForTaxon(store, oak.id);

    expect(store.cacheData.observations.popularFields).toStrictEqual({});
  });

  test("ignore popular fields for other taxa", () => {
    let store = structuredClone(mapStore);
    let oak = redOak();

    store.selectedTaxa = [oak, monarchBasic];
    store.cacheData.observations.popularFields = setupCache(
      [oak],
      [monarchBasic],
    );

    expect(store.cacheData.observations.popularFields).toStrictEqual({
      12: [createPopularFieldCache(oak, 12)],
      1: [createPopularFieldCache(monarchBasic, 1)],
      9: [
        createPopularFieldCache(oak, 9),
        createPopularFieldCache(monarchBasic, 9),
      ],
    });

    removePopularFieldsForTaxon(store, oak.id);

    expect(store.cacheData.observations.popularFields).toStrictEqual({
      1: [createPopularFieldCache(monarchBasic, 1)],
      9: [createPopularFieldCache(monarchBasic, 9)],
    });
  });
});
