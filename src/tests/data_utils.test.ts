// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import {
  formatTaxonName,
  updateSelectedTaxaProxy,
  idStringAddId,
  idStringRemoveId,
  updateStoreUsingFilters,
} from "../lib/data_utils.ts";
import type { MapStore, NormalizediNatTaxon } from "../types/app.d.ts";
import { mapStore } from "../lib/store.ts";

describe("formatTaxonName", () => {
  describe("query matches common name", () => {
    test("returns object with name data", () => {
      let query = "red";
      let data = {
        name: "Buteo jamaicensis",
        default_photo: "https://inat.com/photos/101327658/square.jpg",
        preferred_common_name: "Red-tailed Hawk",
        matched_term: "Redtail",
        rank: "species",
        id: 5212,
      };
      let expected = {
        hasCommonName: true,
        subtitle: "Buteo jamaicensis",
        subtitleAriaLabel: "taxon scientific name",
        title: "Red-tailed Hawk",
        titleAriaLabel: "taxon common name",
      };

      let results = formatTaxonName(data, query);

      expect(results).toStrictEqual(expected);
    });
  });

  describe("query matches scientific name", () => {
    test("returns object with name data", () => {
      let query = "Canis";
      let data = {
        name: "Canis familiaris",
        default_photo: "https://inat.com/photos/117465258/square.jpg",
        preferred_common_name: "Domestic Dog",
        matched_term: "Canis",
        rank: "species",
        id: 47144,
      };
      let expected = {
        hasCommonName: true,
        subtitle: "Canis familiaris",
        subtitleAriaLabel: "taxon scientific name",
        title: "Domestic Dog",
        titleAriaLabel: "taxon common name",
      };

      let results = formatTaxonName(data, query);

      expect(results).toStrictEqual(expected);
    });

    test("returns scientific name as title if no common name", () => {
      let query = "Prorocentrum";
      let data = {
        name: "Prorocentrum gracile",
        default_photo: "https://inat.com/photos/26078891/square.jpg",
        preferred_common_name: undefined,
        matched_term: "Prorocentrum gracile",
        rank: "species",
        id: 783155,
      };
      let expected = {
        hasCommonName: false,
        subtitle: undefined,
        subtitleAriaLabel: undefined,
        title: "Prorocentrum gracile",
        titleAriaLabel: "taxon scientific name",
      };

      let results = formatTaxonName(data, query);

      expect(results).toStrictEqual(expected);
    });
  });

  describe("query matches matched_term", () => {
    test("returns common name (match term) as title", () => {
      let query = "red";
      let data = {
        name: "Turdus migratorius",
        default_photo: "https://inat.com/photos/34859026/square.jpg",
        preferred_common_name: "American Robin",
        matched_term: "Red Robin",
        rank: "species",
        id: 12727,
      };
      let expected = {
        hasCommonName: true,
        subtitle: "Turdus migratorius",
        subtitleAriaLabel: "taxon scientific name",
        title: "American Robin (Red Robin)",
        titleAriaLabel: "taxon common name",
      };

      let results = formatTaxonName(data, query);

      expect(results).toStrictEqual(expected);
    });
    test("returns common name as title if includeMatchedTerm is false", () => {
      let query = "red";
      let data = {
        name: "Turdus migratorius",
        default_photo: "https://inat.com/photos/34859026/square.jpg",
        preferred_common_name: "American Robin",
        matched_term: "Red Robin",
        rank: "species",
        id: 12727,
      };
      let expected = {
        hasCommonName: true,
        subtitle: "Turdus migratorius",
        subtitleAriaLabel: "taxon scientific name",
        title: "American Robin",
        titleAriaLabel: "taxon common name",
      };

      let results = formatTaxonName(data, query, false);

      expect(results).toStrictEqual(expected);
    });
  });
});

describe("updateSelectedTaxaProxy", () => {
  let defaultStore: MapStore = {
    selectedTaxa: [],
    taxaMapLayers: {},
    taxaListEl: null,
    selectedPlaces: [],
    placesMapLayers: {},
    placesListEl: null,
    inatApiParams: {},
    displayJsonEl: null,
    color: "",
    map: { map: null, layerControl: null },
    refreshMap: {
      refreshMapButtonEl: null,
      showRefreshMapButton: false,
      layer: null,
    },
    formFilters: { params: {}, string: "" },
  };
  let taxon1: NormalizediNatTaxon = {
    name: "name 1",
    matched_term: "matched_term 1",
    rank: "rank 1",
    observations_count: 10,
    id: 111,
  };

  let taxon2: NormalizediNatTaxon = {
    name: "name 2",
    matched_term: "matched_term 2",
    rank: "rank 2",
    observations_count: 20,
    id: 222,
  };

  test("add new taxon to empty store.selectedTaxa", () => {
    let store = { ...defaultStore, selectedTaxa: [] };
    let taxon = taxon1;
    let expected = [taxon1];

    updateSelectedTaxaProxy(store, taxon);

    expect(store.selectedTaxa).toStrictEqual(expected);
  });

  test("add new taxon to store.selectedTaxa that has taxa", () => {
    let store = {
      ...defaultStore,
      selectedTaxa: [taxon1],
    };
    let taxon = taxon2;
    let expected = [taxon1, taxon2];

    updateSelectedTaxaProxy(store, taxon);

    expect(store.selectedTaxa).toStrictEqual(expected);
  });

  test("update existing taxon in store.selectedTaxa", () => {
    let store = {
      ...defaultStore,
      selectedTaxa: [taxon1, { ...taxon2 }],
    };
    let taxon = { ...taxon2, observations_count: 33 };
    let expected = [taxon1, { ...taxon2, observations_count: 33 }];

    updateSelectedTaxaProxy(store, taxon);

    expect(store.selectedTaxa).toStrictEqual(expected);
  });
});

describe("idStringAddId", () => {
  test("returns id as string if no current id", () => {
    let newId = 10;
    let currentId = undefined;

    let result = idStringAddId(newId, currentId);

    expect(result).toBe("10");
  });

  test("appends id to current id string", () => {
    let newId = 10;
    let currentId = "20";

    let result = idStringAddId(newId, currentId);

    expect(result).toBe("20,10");
  });

  test("appends id to current id string 2", () => {
    let newId = 10;
    let currentId = "20,15";

    let result = idStringAddId(newId, currentId);

    expect(result).toBe("20,15,10");
  });

  test("returns undefined if no id and current id", () => {
    let newId = undefined;
    let currentId = undefined;

    let result = idStringAddId(newId, currentId);

    expect(result).toBe(undefined);
  });
});

describe("idStringRemoveId", () => {
  test("returns undefined if new id equals current id", () => {
    let newId = 10;
    let currentId = "10";

    let result = idStringRemoveId(newId, currentId);

    expect(result).toBe(undefined);
  });

  test("removes id from current id string", () => {
    let newId = 10;
    let currentId = "20,10";

    let result = idStringRemoveId(newId, currentId);

    expect(result).toBe("20");
  });

  test("removes id from current id string 2", () => {
    let newId = 10;
    let currentId = "20,10,15";

    let result = idStringRemoveId(newId, currentId);

    expect(result).toBe("20,15");
  });

  test("returns undefined if no id and current id", () => {
    let newId = undefined;
    let currentId = undefined;

    let result = idStringRemoveId(newId, currentId);

    expect(result).toBe(undefined);
  });
});

describe("updateStoreUsingFilters", () => {
  test("store remains the same if filter params has not been changed", () => {
    let store = structuredClone(mapStore);
    let filtersData = {
      params: {},
      string: "",
    };

    updateStoreUsingFilters(store, filtersData);

    let expected = structuredClone(mapStore);
    expect(store).toStrictEqual(expected);
  });

  test("update store inatApiParams with filter params", () => {
    let store = structuredClone(mapStore);

    expect(store.inatApiParams).toStrictEqual({
      spam: false,
      verifiable: true,
    });

    let filtersData = {
      params: { iconic_taxa: "Aves,Fungi", verifiable: false },
      string: "",
    };

    updateStoreUsingFilters(store, filtersData);

    let expected: MapStore = {
      ...store,
      inatApiParams: {
        spam: false,
        verifiable: false,
        iconic_taxa: "Aves,Fungi",
      },
      formFilters: filtersData,
    };
    expect(store).toStrictEqual(expected);
  });

  test(`reset filterable inatApiParams to default values if they have been
    changed, but they not in filter data`, () => {
    let store = structuredClone(mapStore);

    expect(store.inatApiParams).toStrictEqual({
      spam: false,
      verifiable: true,
    });

    let filtersData1 = {
      params: { spam: true, verifiable: false },
      string: "",
    };

    updateStoreUsingFilters(store, filtersData1);

    expect(store.inatApiParams).toStrictEqual({
      spam: true,
      verifiable: false,
    });

    let filtersData2 = {
      params: {},
      string: "",
    };

    updateStoreUsingFilters(store, filtersData2);

    let expected: MapStore = {
      ...store,
      inatApiParams: {
        spam: false,
        verifiable: true,
      },
      formFilters: filtersData2,
    };
    expect(store).toStrictEqual(expected);
  });

  test(`remove optional filterable properties if they have been changed,
    but they are not in filter data`, () => {
    let store = structuredClone(mapStore);

    expect(store.inatApiParams).toStrictEqual({
      spam: false,
      verifiable: true,
    });

    let filtersData1 = {
      params: { iconic_taxa: "Aves" },
      string: "",
    };

    updateStoreUsingFilters(store, filtersData1);

    expect(store.inatApiParams).toStrictEqual({
      iconic_taxa: "Aves",
      spam: false,
      verifiable: true,
    });

    let filtersData2 = {
      params: {},
      string: "",
    };

    updateStoreUsingFilters(store, filtersData2);

    let expected: MapStore = {
      ...store,
      inatApiParams: {
        spam: false,
        verifiable: true,
      },
      formFilters: filtersData2,
    };
    expect(store).toStrictEqual(expected);
  });
});
