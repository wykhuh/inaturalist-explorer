// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import {
  formatTaxonName,
  updateSelectedTaxa,
  addIdToCommaSeparatedString,
  removeIdFromCommaSeparatedString,
  removeIdfromInatApiParams,
  normalizeAppParams,
  cleanupObervationsParams,
} from "../lib/data_utils.ts";
import type { NormalizediNatTaxon } from "../types/app.d.ts";
import { mapStore } from "../lib/store.ts";
import {
  life,
  lifeBasic,
  losangeles,
  redOak,
  redOakBasic,
  sandiego,
} from "./test_helpers.ts";
import {
  canisTaxaAutocompleteResults,
  coastOakAutocompleteResults,
  redTaxaAutocompleteResults,
} from "./fixtures/inatApi.ts";

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

  describe("common name and matched_term are the same", () => {
    test("only include preferred_common_name", () => {
      let query = "coast oak";
      let data = {
        name: "Quercus agrifolia oxyadenia",
        default_photo: "https://inat.com/photos/34859026/square.jpg",
        preferred_common_name: "Southern Coast Live Oak",
        matched_term: "Southern Coast Live Oak",
        rank: "variety",
        id: 81309,
      };
      let expected = {
        hasCommonName: true,
        subtitle: "Quercus agrifolia oxyadenia",
        subtitleAriaLabel: "taxon scientific name",
        title: "Southern Coast Live Oak",
        titleAriaLabel: "taxon common name",
      };

      let results = formatTaxonName(data, query);

      expect(results).toStrictEqual(expected);
    });
  });

  describe("search for red", () => {
    let processed = redTaxaAutocompleteResults.map((res) => {
      return { ...res, default_photo: res.default_photo?.square_url };
    });
    let results = [
      [processed[0], "Reduncines", "Reduncini", true],
      [processed[1], "Red Oaks", "Lobatae", true],
      [processed[2], "American Robin (Red Robin)", "Turdus migratorius", true],
      [
        processed[3],
        "Northern Cardinal (Red Cardinal)",
        "Cardinalis cardinalis",
        true,
      ],
      [processed[4], "Red-tailed Hawk", "Buteo jamaicensis", true],
      [
        processed[5],
        "Agelaius Blackbirds (Red-shouldered Blackbirds and Allies)",
        "Agelaius",
        true,
      ],
      [processed[6], "Red-winged Blackbird", "Agelaius phoeniceus", true],
      [processed[7], "Red Admiral", "Vanessa atalanta", true],
      [processed[8], "Red and Bordered Plant Bugs", "Pyrrhocoroidea", true],
      [processed[9], "Red Algae", "Rhodophyta", true],
    ];

    test.each(results)(
      "returns title and subtitle",
      (processed, common, science, hasCommonName) => {
        let data = processed as NormalizediNatTaxon;

        let res = formatTaxonName(data, "red");

        expect(res.title).toBe(common);
        expect(res.subtitle).toBe(science);
        expect(res.hasCommonName).toBe(hasCommonName);
      },
    );
  });

  describe("search for canis", () => {
    let processed = canisTaxaAutocompleteResults.map((res) => {
      return { ...res, default_photo: res.default_photo?.square_url };
    });
    let results = [
      [processed[0], "Wolves and Dogs", "Canis", true],
      [processed[1], "Domestic Dog", "Canis familiaris", true],
      [processed[2], "Coyote", "Canis latrans", true],
      [processed[3], "Red Fox (Canis vulpes)", "Vulpes vulpes", true],
      [processed[4], "Gray Wolf", "Canis lupus", true],
      [processed[5], "Spotted Hyena (Canis crocuta)", "Crocuta crocuta", true],
      [
        processed[6],
        "Black-backed Jackal (Canis mesomelas)",
        "Lupulella mesomelas",
        true,
      ],
      [processed[7], "Golden Jackal", "Canis aureus", true],
      [processed[8], "Crab-eating Fox (Canis thous)", "Cerdocyon thous", true],
      [
        processed[9],
        "Southern Black-backed Jackal (Canis mesomelas mesomelas)",
        "Lupulella mesomelas mesomelas",
        true,
      ],
    ];

    test.each(results)(
      "returns title and subtitle",
      (processed, common, science, hasCommonName) => {
        let data = processed as NormalizediNatTaxon;

        let res = formatTaxonName(data, "canis");

        expect(res.title).toBe(common);
        expect(res.subtitle).toBe(science);
        expect(res.hasCommonName).toBe(hasCommonName);
      },
    );
  });

  describe("search for coast oak", () => {
    let processed = coastOakAutocompleteResults.map((res) => {
      return { ...res, default_photo: res.default_photo?.square_url };
    });

    let results = [
      [processed[0], "Coast Oak", "Quercus parvula", true],
      [processed[1], "Coast Live Oak", "Quercus agrifolia", true],
      [
        processed[2],
        "Beach Sheoak (Coast she-oak)",
        "Casuarina equisetifolia",
        true,
      ],
      [processed[3], "Coast Silver-oak", "Brachylaena discolor", true],
      [
        processed[4],
        "Nuttall's Scrub Oak (Coastal sage scrub oak)",
        "Quercus dumosa",
        true,
      ],
      [
        processed[5],
        "Southern Coast Live Oak",
        "Quercus agrifolia oxyadenia",
        true,
      ],
      [
        processed[6],
        "Coast Live × Interior Live Oak",
        "Quercus agrifolia × wislizeni",
        true,
      ],
      [
        processed[7],
        "Mainland Sheoak Skink (Coastal She-oak Slender Bluetongue)",
        "Cyclodomorphus michaeli",
        true,
      ],
      [processed[8], "Atlantic Coast Oak", "Quercus × atlantica", true],
    ];

    test.each(results)(
      "returns title and subtitle",
      (processed, common, science, hasCommonName) => {
        let data = processed as NormalizediNatTaxon;

        let res = formatTaxonName(data, "coast oak");

        expect(res.title).toBe(common);
        expect(res.subtitle).toBe(science);
        expect(res.hasCommonName).toBe(hasCommonName);
      },
    );
  });
});

describe("updateSelectedTaxa", () => {
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
    let store = structuredClone(mapStore);
    let taxon = taxon1;
    let expected = [taxon1];

    updateSelectedTaxa(store, taxon);

    expect(store.selectedTaxa).toStrictEqual(expected);
  });

  test("add new taxon to store.selectedTaxa that has taxa", () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [taxon1];

    let taxon = taxon2;
    let expected = [taxon1, taxon2];

    updateSelectedTaxa(store, taxon);

    expect(store.selectedTaxa).toStrictEqual(expected);
  });

  test("update existing taxon in store.selectedTaxa", () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [taxon1, taxon2];
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

  test("does not append id if it is already in string", () => {
    let newId = 10;
    let currentId = "20,10";

    let result = addIdToCommaSeparatedString(newId, currentId);

    expect(result).toBe("20,10");
  });
});

describe("removeIdFromCommaSeparatedString", () => {
  test("returns undefined if new id equals current id", () => {
    let newId = 10;
    let currentId = "10";

    let result = removeIdFromCommaSeparatedString(newId, currentId);

    expect(result).toBe(undefined);
  });

  test("removes id from current id string when it is last id", () => {
    let newId = 10;
    let currentId = "20,10";

    let result = removeIdFromCommaSeparatedString(newId, currentId);

    expect(result).toBe("20");
  });

  test("removes id from current id string when it is first id", () => {
    let newId = 10;
    let currentId = "10,20";

    let result = removeIdFromCommaSeparatedString(newId, currentId);

    expect(result).toBe("20");
  });

  test("removes id from current id string", () => {
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

  test("returns current id if id is not in current id", () => {
    let newId = 10;
    let currentId = "5";

    let result = removeIdFromCommaSeparatedString(newId, currentId);

    expect(result).toBe(currentId);
  });
});

describe("removeIdfromInatApiParams", () => {
  test("if no selectedTaxa, removes taxon_id and colors from inatApiParams", async () => {
    let store = structuredClone(mapStore);
    let target_id = 10;
    store.selectedTaxa = [];
    store.inatApiParams.taxon_id = target_id.toString();
    store.inatApiParams.colors = "red";

    removeIdfromInatApiParams(store, "taxon_id", target_id);

    expect(store.inatApiParams.taxon_id).toBeUndefined();
    expect(store.inatApiParams.colors).toBeUndefined();
  });

  test("if target_id not in selectedTaxa, set taxon_id and color to last item in selectedTaxa", async () => {
    let store = structuredClone(mapStore);
    let target_id = 10;
    store.selectedTaxa = [lifeBasic, redOakBasic];
    store.inatApiParams.taxon_id = target_id.toString();
    store.inatApiParams.colors = "red";

    removeIdfromInatApiParams(store, "taxon_id", target_id);

    expect(store.inatApiParams.taxon_id).toBe(redOakBasic.id.toString());
    expect(store.inatApiParams.colors).toBe(redOakBasic.color);
  });

  test("if target_id is the same as the last item in selectedTaxa, do nothing", async () => {
    let store = structuredClone(mapStore);
    let target_id = redOak().id;

    store.selectedTaxa = [life(), redOak()];
    store.inatApiParams.taxon_id = redOak().id.toString();
    store.inatApiParams.colors = redOak().color;

    removeIdfromInatApiParams(store, "taxon_id", target_id);

    expect(store.inatApiParams.taxon_id).toBe(redOak().id.toString());
    expect(store.inatApiParams.colors).toBe(redOak().color);
  });

  test("if target_id is in selectedTaxa, set taxon_id and color to last item in selectedTaxa", async () => {
    let store = structuredClone(mapStore);
    let target_id = life().id;
    store.selectedTaxa = [life(), redOak()];
    store.inatApiParams.taxon_id = life().id.toString();
    store.inatApiParams.colors = life().color;

    removeIdfromInatApiParams(store, "taxon_id", target_id);

    expect(store.inatApiParams.taxon_id).toBe(redOak().id.toString());
    expect(store.inatApiParams.colors).toBe(redOak().color);
  });

  test("if no selectedPlaces, removes place_id from inatApiParams", async () => {
    let store = structuredClone(mapStore);
    let target_id = 10;
    store.selectedPlaces = [];
    store.inatApiParams.place_id = target_id.toString();

    removeIdfromInatApiParams(store, "place_id", target_id);

    expect(store.inatApiParams.place_id).toBeUndefined();
  });

  test("if target_id is not in selectedPlaces, removes id from inatApiParams.place_id", async () => {
    let store = structuredClone(mapStore);
    let target_id = 10;
    store.selectedPlaces = [losangeles, sandiego];
    store.inatApiParams.place_id = `${target_id},${losangeles.id},${sandiego.id}`;

    removeIdfromInatApiParams(store, "place_id", target_id);

    expect(store.inatApiParams.place_id).toBe(
      `${losangeles.id},${sandiego.id}`,
    );
  });

  test("if target_id is the same as the last item in selectedPlaces, do nothing", async () => {
    let store = structuredClone(mapStore);
    let target_id = sandiego.id;
    store.selectedPlaces = [losangeles, sandiego];
    store.inatApiParams.place_id = `${losangeles.id},${sandiego.id}`;

    removeIdfromInatApiParams(store, "place_id", target_id);

    expect(store.inatApiParams.place_id).toBe(
      `${losangeles.id},${sandiego.id}`,
    );
  });

  test("if target_id is in selectedPlaces, do nothing", async () => {
    let store = structuredClone(mapStore);
    let target_id = losangeles.id;
    store.selectedPlaces = [losangeles, sandiego];
    store.inatApiParams.place_id = `${losangeles.id},${sandiego.id}`;

    removeIdfromInatApiParams(store, "place_id", target_id);

    expect(store.inatApiParams.place_id).toBe(
      `${losangeles.id},${sandiego.id}`,
    );
  });
});

describe("normalizeAppParams", () => {
  test("sets verifiable and spam if app params is empty string", () => {
    let appParams = "";
    let result = normalizeAppParams(appParams);

    expect(result.toString()).toBe("verifiable=true&spam=false");
  });

  test("does not change verifiable and spam if they are in app params", () => {
    let appParams = "verifiable=false&spam=true";
    let result = normalizeAppParams(appParams);

    expect(result.toString()).toBe(appParams);
  });

  test("does not change existing app params", () => {
    let appParams = "taxon_id=123&verifiable=false&spam=true";
    let result = normalizeAppParams(appParams);

    expect(result.toString()).toBe(appParams);
  });
});

describe("cleanupObervationsParams", () => {
  test("if no changes to store params, returns empty string", () => {
    let store = structuredClone(mapStore);

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual("");
  });

  test("returns params if params are valid properites for iNat API", () => {
    let store = structuredClone(mapStore);
    store.inatApiParams.sounds = true;
    store.inatApiParams.order = "desc";
    store.inatApiParams.order_by = "id";
    store.inatApiParams.page = 1;
    store.selectedTaxa = [
      { id: 1, color: "red" },
      { id: 2, color: "blue" },
    ];

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual(
      "taxon_id=1%2C2&verifiable=true&spam=false&sounds=true" +
        "&order=desc&order_by=id&page=1",
    );
  });

  test("ignores params if params are not properites for iNat API", () => {
    let store = structuredClone(mapStore);
    (store.inatApiParams as any).foo = true;

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual("");
  });

  test("ignores taxon_id and place_id when they are 0", () => {
    let store = structuredClone(mapStore);
    store.inatApiParams.sounds = true;
    store.inatApiParams.taxon_id = "0";
    store.inatApiParams.place_id = "0";
    store.selectedTaxa = [{ id: 0, color: "red" }];
    store.selectedPlaces = [{ id: 0 }];

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual("verifiable=true&spam=false&sounds=true");
  });

  test("ignores view, colors, subview", () => {
    let store = structuredClone(mapStore);
    store.inatApiParams.taxon_id = "1";
    store.inatApiParams.colors = "red";
    store.selectedTaxa = [{ id: 1, color: "red" }];
    store.currentView = "observations";
    store.viewMetadata.observations.subview = "table";

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual("taxon_id=1&verifiable=true&spam=false");
  });

  test("uses page, order, order from store to update params", () => {
    let store = structuredClone(mapStore);
    store.inatApiParams.sounds = true;
    store.inatApiParams.taxon_id = "1";
    store.inatApiParams.colors = "red";
    store.selectedTaxa = [{ id: 1, color: "red" }];
    store.inatApiParams.page = 3;
    store.currentView = "observations";

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual(
      "taxon_id=1&verifiable=true&spam=false&sounds=true&page=3",
    );
  });
});
