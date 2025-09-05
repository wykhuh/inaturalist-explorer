// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import {
  formatTaxonName,
  updateSelectedTaxa,
  addIdToCommaSeparatedString,
  removeIdFromCommaSeparatedString,
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

describe("updateSelectedTaxa", () => {
  let defaultStore: MapStore = structuredClone(mapStore);
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

    updateSelectedTaxa(store, taxon);

    expect(store.selectedTaxa).toStrictEqual(expected);
  });

  test("add new taxon to store.selectedTaxa that has taxa", () => {
    let store = {
      ...defaultStore,
      selectedTaxa: [taxon1],
    };
    let taxon = taxon2;
    let expected = [taxon1, taxon2];

    updateSelectedTaxa(store, taxon);

    expect(store.selectedTaxa).toStrictEqual(expected);
  });

  test("update existing taxon in store.selectedTaxa", () => {
    let store = {
      ...defaultStore,
      selectedTaxa: [taxon1, { ...taxon2 }],
    };
    let taxon = { ...taxon2, observations_count: 33 };
    let expected = [taxon1, { ...taxon2, observations_count: 33 }];

    updateSelectedTaxa(store, taxon);

    expect(store.selectedTaxa).toStrictEqual(expected);
  });
});

describe("addIdToCommaSeparatedString", () => {
  test("returns id as string if no current id", () => {
    let newId = 10;
    let currentId = undefined;

    let result = addIdToCommaSeparatedString(newId, currentId);

    expect(result).toBe("10");
  });

  test("appends id to current id string", () => {
    let newId = 10;
    let currentId = "20";

    let result = addIdToCommaSeparatedString(newId, currentId);

    expect(result).toBe("20,10");
  });

  test("appends id to current id string 2", () => {
    let newId = 10;
    let currentId = "20,15";

    let result = addIdToCommaSeparatedString(newId, currentId);

    expect(result).toBe("20,15,10");
  });

  test("returns undefined if no id and current id", () => {
    let newId = undefined;
    let currentId = undefined;

    let result = addIdToCommaSeparatedString(newId, currentId);

    expect(result).toBe(undefined);
  });
});

describe("removeIdFromCommaSeparatedString", () => {
  test("returns undefined if new id equals current id", () => {
    let newId = 10;
    let currentId = "10";

    let result = removeIdFromCommaSeparatedString(newId, currentId);

    expect(result).toBe(undefined);
  });

  test("removes id from current id string", () => {
    let newId = 10;
    let currentId = "20,10";

    let result = removeIdFromCommaSeparatedString(newId, currentId);

    expect(result).toBe("20");
  });

  test("removes id from current id string 2", () => {
    let newId = 10;
    let currentId = "20,10,15";

    let result = removeIdFromCommaSeparatedString(newId, currentId);

    expect(result).toBe("20,15");
  });

  test("returns undefined if no id and current id", () => {
    let newId = undefined;
    let currentId = undefined;

    let result = removeIdFromCommaSeparatedString(newId, currentId);

    expect(result).toBe(undefined);
  });
});
