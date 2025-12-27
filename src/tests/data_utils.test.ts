// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import {
  formatTaxonName,
  updateSelectedResource,
  addValueToCommaSeparatedString,
  removeValueFromCommaSeparatedString,
  removeIdfromInatApiParams,
  normalizeAppParams,
} from "../lib/data_utils.ts";
import { renderTaxonNames } from "../lib/render_utils";
import type { NormalizediNatTaxonType } from "../types/app.d.ts";
import { mapStore } from "../lib/store.ts";
import { life, losangeles, redOak, sandiego } from "./test_helpers.ts";
import {
  canisTaxaAutocompleteResults,
  coastOakAutocompleteResults,
  redTaxaAutocompleteResults,
} from "./fixtures/inatApi.ts";
import { allTaxaRecord } from "../data/inat_data.ts";

describe("formatTaxonName", () => {
  let store = structuredClone(mapStore);

  describe("searchTerm matches common name", () => {
    let searchTerm = "red";
    let data = {
      name: "Buteo jamaicensis",
      default_photo: "https://inat.com/photos/101327658/square.jpg",
      preferred_common_name: "Red-tailed Hawk",
      matched_term: "Redtail",
      rank: "species",
      id: 5212,
    };

    test("returns object with name data", () => {
      let expected = {
        hasCommonName: true,
        subtitle: "Buteo jamaicensis",
        subtitleAriaLabel: "taxon scientific name",
        title: "Red-tailed Hawk",
        titleAriaLabel: "taxon common name",
        rank: "species",
      };

      let results = formatTaxonName(data, store, searchTerm);

      expect(results).toStrictEqual(expected);
    });

    test("returns object with name data if name_order is sc", () => {
      let store = structuredClone(mapStore);
      store.viewMetadata.name_order = "sc";

      let expected = {
        hasCommonName: true,
        title: "Buteo jamaicensis",
        titleAriaLabel: "taxon scientific name",
        subtitle: "Red-tailed Hawk",
        subtitleAriaLabel: "taxon common name",
        rank: "species",
      };

      let results = formatTaxonName(data, store, searchTerm);

      expect(results).toStrictEqual(expected);
    });

    test("returns object with name data if name_order is s", () => {
      let store = structuredClone(mapStore);
      store.viewMetadata.name_order = "s";

      let expected = {
        hasCommonName: true,
        title: "Buteo jamaicensis",
        titleAriaLabel: "taxon scientific name",
        subtitle: undefined,
        subtitleAriaLabel: undefined,
        rank: "species",
      };

      let results = formatTaxonName(data, store, searchTerm);

      expect(results).toStrictEqual(expected);
    });
  });

  describe("searchTerm matches scientific name", () => {
    let canisQuery = "Canis";
    let canisData = {
      name: "Canis familiaris",
      default_photo: "https://inat.com/photos/117465258/square.jpg",
      preferred_common_name: "Domestic Dog",
      matched_term: "Canis",
      rank: "species",
      id: 47144,
    };

    let prorocentrumQuery = "Prorocentrum";
    let prorocentrumData = {
      name: "Prorocentrum gracile",
      default_photo: "https://inat.com/photos/26078891/square.jpg",
      preferred_common_name: undefined,
      matched_term: "Prorocentrum gracile",
      rank: "species",
      id: 783155,
    };

    test("returns object with name data", () => {
      let searchTerm = canisQuery;
      let data = canisData;
      let expected = {
        hasCommonName: true,
        subtitle: "Canis familiaris",
        subtitleAriaLabel: "taxon scientific name",
        title: "Domestic Dog",
        titleAriaLabel: "taxon common name",
        rank: "species",
      };

      let results = formatTaxonName(data, store, searchTerm);

      expect(results).toStrictEqual(expected);
    });

    test("returns object with name data if name_order is sc", () => {
      let store = structuredClone(mapStore);
      store.viewMetadata.name_order = "sc";

      let searchTerm = canisQuery;
      let data = canisData;

      let expected = {
        hasCommonName: true,
        title: "Canis familiaris",
        titleAriaLabel: "taxon scientific name",
        subtitle: "Domestic Dog",
        subtitleAriaLabel: "taxon common name",
        rank: "species",
      };

      let results = formatTaxonName(data, store, searchTerm);

      expect(results).toStrictEqual(expected);
    });

    test("returns object with name data if name_order is s", () => {
      let store = structuredClone(mapStore);
      store.viewMetadata.name_order = "s";

      let searchTerm = canisQuery;
      let data = canisData;

      let expected = {
        hasCommonName: true,
        title: "Canis familiaris",
        titleAriaLabel: "taxon scientific name",
        subtitle: undefined,
        subtitleAriaLabel: undefined,
        rank: "species",
      };

      let results = formatTaxonName(data, store, searchTerm);

      expect(results).toStrictEqual(expected);
    });

    test("returns scientific name if no common name", () => {
      let searchTerm = prorocentrumQuery;
      let data = prorocentrumData;
      let expected = {
        hasCommonName: false,
        title: undefined,
        titleAriaLabel: undefined,
        subtitle: "Prorocentrum gracile",
        subtitleAriaLabel: "taxon scientific name",
        rank: "species",
      };

      let results = formatTaxonName(data, store, searchTerm);

      expect(results).toStrictEqual(expected);
    });

    test("returns scientific name if no common name and name_order is sc", () => {
      let store = structuredClone(mapStore);
      store.viewMetadata.name_order = "sc";

      let searchTerm = prorocentrumQuery;
      let data = prorocentrumData;
      let expected = {
        hasCommonName: false,
        subtitle: undefined,
        subtitleAriaLabel: undefined,
        title: "Prorocentrum gracile",
        titleAriaLabel: "taxon scientific name",
        rank: "species",
      };

      let results = formatTaxonName(data, store, searchTerm);

      expect(results).toStrictEqual(expected);
    });

    test("returns scientific name if no common name and name_order is s", () => {
      let store = structuredClone(mapStore);
      store.viewMetadata.name_order = "s";

      let searchTerm = prorocentrumQuery;
      let data = prorocentrumData;
      let expected = {
        hasCommonName: false,
        subtitle: undefined,
        subtitleAriaLabel: undefined,
        title: "Prorocentrum gracile",
        titleAriaLabel: "taxon scientific name",
        rank: "species",
      };

      let results = formatTaxonName(data, store, searchTerm);

      expect(results).toStrictEqual(expected);
    });

    test("returns object with name data for allTaxaRecord", () => {
      let data = allTaxaRecord;
      let expected = {
        hasCommonName: true,
        rank: undefined,
        title: "All Species",
        titleAriaLabel: "taxon common name",
        subtitle: undefined,
        subtitleAriaLabel: undefined,
      };

      let results = formatTaxonName(data, store);

      expect(results).toStrictEqual(expected);
    });
  });

  describe("searchTerm matches matched_term", () => {
    let redQuery = "red";
    let redData = {
      name: "Turdus migratorius",
      default_photo: "https://inat.com/photos/34859026/square.jpg",
      preferred_common_name: "American Robin",
      matched_term: "Red Robin",
      rank: "species",
      id: 12727,
    };

    test("returns common name (match term) as title", () => {
      let searchTerm = redQuery;
      let data = redData;
      let expected = {
        hasCommonName: true,
        subtitle: "Turdus migratorius",
        subtitleAriaLabel: "taxon scientific name",
        title: "American Robin (Red Robin)",
        titleAriaLabel: "taxon common name",
        rank: "species",
      };

      let results = formatTaxonName(data, store, searchTerm);

      expect(results).toStrictEqual(expected);
    });

    test("returns common name (match term) as subtitle if name_order is sc", () => {
      let store = structuredClone(mapStore);
      store.viewMetadata.name_order = "sc";

      let searchTerm = redQuery;
      let data = redData;
      let expected = {
        hasCommonName: true,
        title: "Turdus migratorius",
        titleAriaLabel: "taxon scientific name",
        subtitle: "American Robin (Red Robin)",
        subtitleAriaLabel: "taxon common name",
        rank: "species",
      };

      let results = formatTaxonName(data, store, searchTerm);

      expect(results).toStrictEqual(expected);
    });

    test("returns scientific name as title if name_order is s", () => {
      let store = structuredClone(mapStore);
      store.viewMetadata.name_order = "s";

      let searchTerm = redQuery;
      let data = redData;
      let expected = {
        hasCommonName: true,
        title: "Turdus migratorius",
        titleAriaLabel: "taxon scientific name",
        subtitle: undefined,
        subtitleAriaLabel: undefined,
        rank: "species",
      };

      let results = formatTaxonName(data, store, searchTerm);

      expect(results).toStrictEqual(expected);
    });

    test("returns common name as title if no search term", () => {
      let data = redData;
      let expected = {
        hasCommonName: true,
        subtitle: "Turdus migratorius",
        subtitleAriaLabel: "taxon scientific name",
        title: "American Robin",
        titleAriaLabel: "taxon common name",
        rank: "species",
      };

      let results = formatTaxonName(data, store);

      expect(results).toStrictEqual(expected);
    });
  });

  describe("common name and matched_term are the same", () => {
    test("only include preferred_common_name", () => {
      let searchTerm = "coast oak";
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
        rank: "variety",
      };

      let results = formatTaxonName(data, store, searchTerm);

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
        let data = processed as NormalizediNatTaxonType;

        let res = formatTaxonName(data, store, "red");

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
        let data = processed as NormalizediNatTaxonType;

        let res = formatTaxonName(data, store, "canis");

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
        let data = processed as NormalizediNatTaxonType;

        let res = formatTaxonName(data, store, "coast oak");

        expect(res.title).toBe(common);
        expect(res.subtitle).toBe(science);
        expect(res.hasCommonName).toBe(hasCommonName);
      },
    );
  });
});

describe("renderTaxonNames", () => {
  let store = structuredClone(mapStore);

  let redQuery = "red";
  let redTaxon = {
    name: "Turdus migratorius",
    default_photo: "https://inat.com/photos/34859026/square.jpg",
    preferred_common_name: "American Robin",
    matched_term: "Red Robin",
    rank: "species",
    id: 12727,
  };

  test("returns common and scientific name if taxon has common and scientific name", () => {
    let taxon = redTaxon;

    let results = renderTaxonNames(taxon, store, `taxa/${taxon.id}`);

    let expected = `<a href="taxa/12727" class="title">
<span class="common-name" aria-label="taxon common name">American Robin</span>
</a>
<a href="taxa/12727" class="subtitle">
(<span class="scientific-name" aria-label="taxon scientific name">Turdus migratorius</span>)
</a>\n`;
    expect(results).toStrictEqual(expected);
  });

  test("returns scientific and common name if name_order is sc", () => {
    let store = structuredClone(mapStore);
    store.viewMetadata.name_order = "sc";

    let taxon = redTaxon;

    let results = renderTaxonNames(taxon, store, `taxa/${taxon.id}`);

    let expected = `<a href="taxa/12727" class="title">
<span class="scientific-name" aria-label="taxon scientific name">Turdus migratorius</span>
</a>
<a href="taxa/12727" class="subtitle">
(<span class="common-name" aria-label="taxon common name">American Robin</span>)
</a>\n`;
    expect(results).toStrictEqual(expected);
  });

  test("returns scientific name if name_order is s", () => {
    let store = structuredClone(mapStore);
    store.viewMetadata.name_order = "s";

    let taxon = redTaxon;

    let results = renderTaxonNames(taxon, store, `taxa/${taxon.id}`);

    let expected = `<a href="taxa/12727" class="title">
<span class="scientific-name" aria-label="taxon scientific name">Turdus migratorius</span>
</a>\n`;
    expect(results).toStrictEqual(expected);
  });

  test("returns names without link if no link and no search term", () => {
    let taxon = redTaxon;

    let results = renderTaxonNames(taxon, store);

    let expected = `<span class="title">
<span class="common-name" aria-label="taxon common name">American Robin</span>
</span>
<span class="subtitle">
(<span class="scientific-name" aria-label="taxon scientific name">Turdus migratorius</span>)
</span>\n`;
    expect(results).toStrictEqual(expected);
  });

  test("returns names without link if no link and search term", () => {
    let searchTerm = redQuery;
    let taxon = redTaxon;

    let results = renderTaxonNames(taxon, store, undefined, searchTerm);

    let expected = `<span class="title">
<span class="common-name" aria-label="taxon common name">American Robin (Red Robin)</span>
</span>
<span class="subtitle">
(<span class="scientific-name" aria-label="taxon scientific name">Turdus migratorius</span>)
</span>\n`;
    expect(results).toStrictEqual(expected);
  });

  test("returns common name (match term) as title if search term exists", () => {
    let searchTerm = redQuery;
    let taxon = redTaxon;

    let results = renderTaxonNames(
      taxon,
      store,
      `taxa/${taxon.id}`,
      searchTerm,
    );
    let expected = `<a href="taxa/12727" class="title">
<span class="common-name" aria-label="taxon common name">American Robin (Red Robin)</span>
</a>
<a href="taxa/12727" class="subtitle">
(<span class="scientific-name" aria-label="taxon scientific name">Turdus migratorius</span>)
</a>\n`;
    expect(results).toStrictEqual(expected);
  });

  test("returns scientific name if no common name", () => {
    let taxon = {
      name: "Prorocentrum gracile",
      preferred_common_name: undefined,
      matched_term: "Prorocentrum gracile",
      rank: "species",
      id: 783155,
    };

    let results = renderTaxonNames(taxon, store, `taxa/${taxon.id}`);

    let expected = `<a href="taxa/783155" class="subtitle">
(<span class="scientific-name" aria-label="taxon scientific name">Prorocentrum gracile</span>)
</a>\n`;
    expect(results).toStrictEqual(expected);
  });

  test("returns names and rank if rank is higher than species", () => {
    let taxon = {
      name: "Canis",
      preferred_common_name: "Wolves and Dogs",
      matched_term: "canis",
      rank: "genus",
      id: 42044,
    };

    let results = renderTaxonNames(taxon, store, `taxa/${taxon.id}`);

    let expected = `<a href="taxa/42044" class="title">
<span class="common-name" aria-label="taxon common name">Wolves and Dogs</span>
</a>
<a href="taxa/42044" class="subtitle">
(<span class="rank" aria-label="taxon rank">Genus</span> <span class="scientific-name" aria-label="taxon scientific name">Canis</span>)
</a>\n`;
    expect(results).toStrictEqual(expected);
  });

  test("returns names and rank if rank is higher than species and name_order is sc", () => {
    let store = structuredClone(mapStore);
    store.viewMetadata.name_order = "sc";

    let taxon = {
      name: "Canis",
      preferred_common_name: "Wolves and Dogs",
      matched_term: "canis",
      rank: "genus",
      id: 42044,
    };

    let results = renderTaxonNames(taxon, store, `taxa/${taxon.id}`);

    let expected = `<a href="taxa/42044" class="title">
<span class="rank" aria-label="taxon rank">Genus</span> <span class="scientific-name" aria-label="taxon scientific name">Canis</span>
</a>
<a href="taxa/42044" class="subtitle">
(<span class="common-name" aria-label="taxon common name">Wolves and Dogs</span>)
</a>\n`;
    expect(results).toStrictEqual(expected);
  });

  test("returns names and rank if rank is higher than species and no link", () => {
    let taxon = {
      name: "Canis",
      preferred_common_name: "Wolves and Dogs",
      matched_term: "canis",
      rank: "genus",
      id: 42044,
    };

    let results = renderTaxonNames(taxon, store);

    let expected = `<span class="title">
<span class="common-name" aria-label="taxon common name">Wolves and Dogs</span>
</span>
<span class="subtitle">
(<span class="rank" aria-label="taxon rank">Genus</span> <span class="scientific-name" aria-label="taxon scientific name">Canis</span>)
</span>\n`;
    expect(results).toStrictEqual(expected);
  });

  test("returns name and rank if rank is higher than species and no common name", () => {
    let taxon = {
      name: "Roseae",
      matched_term: "roseae",
      rank: "section",
      id: 1023141,
    };

    let results = renderTaxonNames(taxon, store, `taxa/${taxon.id}`);

    let expected = `<a href="taxa/1023141" class="subtitle">
(<span class="rank" aria-label="taxon rank">Section</span> <span class="scientific-name" aria-label="taxon scientific name">Roseae</span>)
</a>\n`;
    expect(results).toStrictEqual(expected);
  });
});

describe("updateSelectedResource", () => {
  let taxon1: NormalizediNatTaxonType = {
    name: "name 1",
    matched_term: "matched_term 1",
    rank: "rank 1",
    observations_count: 10,
    id: 111,
  };

  let taxon2: NormalizediNatTaxonType = {
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

    updateSelectedResource(taxon, "selectedTaxa", store);

    expect(store.selectedTaxa).toStrictEqual(expected);
  });

  test("add new taxon to store.selectedTaxa that has taxa", () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [taxon1];

    let taxon = taxon2;
    let expected = [taxon1, taxon2];

    updateSelectedResource(taxon, "selectedTaxa", store);

    expect(store.selectedTaxa).toStrictEqual(expected);
  });

  test("update existing taxon in store.selectedTaxa", () => {
    let store = structuredClone(mapStore);
    store.selectedTaxa = [taxon1, taxon2];
    let taxon = { ...taxon2, observations_count: 33 };
    let expected = [taxon1, { ...taxon2, observations_count: 33 }];

    updateSelectedResource(taxon, "selectedTaxa", store);

    expect(store.selectedTaxa).toStrictEqual(expected);
  });
});

describe("addValueToCommaSeparatedString", () => {
  test("returns id as string if no current id", () => {
    let newId = 10;
    let currentId = undefined;

    let result = addValueToCommaSeparatedString(newId, currentId);

    expect(result).toBe("10");
  });

  test("appends id to current id string", () => {
    let newId = 10;
    let currentId = "20";

    let result = addValueToCommaSeparatedString(newId, currentId);

    expect(result).toBe("20,10");
  });

  test("appends id to current id string 2", () => {
    let newId = 10;
    let currentId = "20,15";

    let result = addValueToCommaSeparatedString(newId, currentId);

    expect(result).toBe("20,15,10");
  });

  test("returns undefined if no id and current id", () => {
    let newId = undefined;
    let currentId = undefined;

    let result = addValueToCommaSeparatedString(newId, currentId);

    expect(result).toBe(undefined);
  });

  test("does not append id if it is already in string", () => {
    let newId = 10;
    let currentId = "20,10";

    let result = addValueToCommaSeparatedString(newId, currentId);

    expect(result).toBe("20,10");
  });
});

describe("removeValueFromCommaSeparatedString", () => {
  test("returns undefined if new id equals current id", () => {
    let newId = 10;
    let currentId = "10";

    let result = removeValueFromCommaSeparatedString(newId, currentId);

    expect(result).toBe(undefined);
  });

  test("removes id from current id string when it is last id", () => {
    let newId = 10;
    let currentId = "20,10";

    let result = removeValueFromCommaSeparatedString(newId, currentId);

    expect(result).toBe("20");
  });

  test("removes id from current id string when it is first id", () => {
    let newId = 10;
    let currentId = "10,20";

    let result = removeValueFromCommaSeparatedString(newId, currentId);

    expect(result).toBe("20");
  });

  test("removes id from current id string", () => {
    let newId = 10;
    let currentId = "20,10,15";

    let result = removeValueFromCommaSeparatedString(newId, currentId);

    expect(result).toBe("20,15");
  });

  test("returns undefined if no id and current id", () => {
    let newId = undefined;
    let currentId = undefined;

    let result = removeValueFromCommaSeparatedString(newId, currentId);

    expect(result).toBe(undefined);
  });

  test("returns current id if id is not in current id", () => {
    let newId = 10;
    let currentId = "5";

    let result = removeValueFromCommaSeparatedString(newId, currentId);

    expect(result).toBe(currentId);
  });
});

describe("removeIdfromInatApiParams", () => {
  test("if no selectedTaxa, removes taxon_id and colors from observationsApiParams", async () => {
    let store = structuredClone(mapStore);
    let target_id = 10;
    let target_color = "red";
    store.selectedTaxa = [];
    store.observationsApiParams.taxon_id = target_id.toString();
    store.observationsApiParams.colors = target_color;

    removeIdfromInatApiParams(store, "selectedTaxa", target_id);

    expect(store.observationsApiParams.taxon_id).toBeUndefined();
    expect(store.observationsApiParams.colors).toBeUndefined();
  });

  test("if target_id not in selectedTaxa, remove target id and color from observationsApiParams", async () => {
    let store = structuredClone(mapStore);
    let target_id = 10;
    let target_color = "red";
    store.selectedTaxa = [life(), redOak()];
    store.observationsApiParams.taxon_id = `${life().id},${target_id},${redOak().id}`;
    store.observationsApiParams.colors = `${life().color},${target_color},${redOak().color}`;

    removeIdfromInatApiParams(store, "selectedTaxa", target_id);

    expect(store.observationsApiParams.taxon_id).toBe(
      `${life().id},${redOak().id}`,
    );
    expect(store.observationsApiParams.colors).toBe(
      `${life().color},${redOak().color}`,
    );
  });

  test("if target_id in selectedTaxa, do nothing", async () => {
    let store = structuredClone(mapStore);
    let target_id = life().id;
    store.selectedTaxa = [life(), redOak()];
    store.observationsApiParams.taxon_id = `${life().id},${redOak().id}`;
    store.observationsApiParams.colors = `${life().color},${redOak().color}`;

    removeIdfromInatApiParams(store, "selectedTaxa", target_id);

    expect(store.observationsApiParams.taxon_id).toBe(
      `${life().id},${redOak().id}`,
    );
    expect(store.observationsApiParams.colors).toBe(
      `${life().color},${redOak().color}`,
    );
  });

  test("if no selectedPlaces, removes place_id from observationsApiParams", async () => {
    let store = structuredClone(mapStore);
    let target_id = 10;
    store.selectedPlaces = [];
    store.observationsApiParams.place_id = target_id.toString();

    removeIdfromInatApiParams(store, "selectedPlaces", target_id);

    expect(store.observationsApiParams.place_id).toBeUndefined();
  });

  test("if target_id is not in selectedPlaces, removes id from observationsApiParams", async () => {
    let store = structuredClone(mapStore);
    let target_id = 10;
    store.selectedPlaces = [losangeles, sandiego];
    store.observationsApiParams.place_id = `${target_id},${losangeles.id},${sandiego.id}`;

    removeIdfromInatApiParams(store, "selectedPlaces", target_id);

    expect(store.observationsApiParams.place_id).toBe(
      `${losangeles.id},${sandiego.id}`,
    );
  });

  test("if target_id is in selectedPlaces, do nothing", async () => {
    let store = structuredClone(mapStore);
    let target_id = sandiego.id;
    store.selectedPlaces = [losangeles, sandiego];
    store.observationsApiParams.place_id = `${losangeles.id},${sandiego.id}`;

    removeIdfromInatApiParams(store, "selectedPlaces", target_id);

    expect(store.observationsApiParams.place_id).toBe(
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
    let appParams = "taxon_id=123&verifiable=false&spam=true&locale=en";
    let result = normalizeAppParams(appParams);

    expect(result.toString()).toBe(appParams);
  });
});
