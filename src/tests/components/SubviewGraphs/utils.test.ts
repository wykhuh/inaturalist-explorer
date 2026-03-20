// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import { mapStore } from "../../../lib/store";
import {
  updateInvalidGraphCategory,
  formatPopularFields,
  formatPopularFieldsOptions,
  createTermIdValueIds,
} from "../../../components/SubviewGraphs/utils";
import { histogramGraphCategory } from "../../../data/app_data";
import { allTaxaRecord } from "../../../data/inat_data";
import { createPopularFieldCache, redOakBasic } from "../../test_helpers";

import {
  popular_fields_basic_milkweed,
  popular_fields_basic_monarch,
  popular_fields_canyon_gooseberry,
  popular_fields_hillside_gooseberry,
  popular_fields_milkweed,
  popular_fields_monarch,
  processedPopularFields,
  processedPopularFieldsGooseberry,
} from "../../../data/api/popular_fields";
import { milkweedBasic, monarchBasic } from "../../test_helpers";
import { formatTaxonName } from "../../../lib/data_utils";
import type { NormalizedPopularFields } from "../../../types/app";

describe("formatPopularFieldsOptions", () => {
  test("takes popular fields api and returns array of label and id", () => {
    let results = formatPopularFieldsOptions([
      popular_fields_basic_milkweed,
      popular_fields_basic_monarch,
    ]);

    let expected = [
      { id: 12, label: "Flowers and Fruits" },
      { id: 36, label: "Leaves" },
      { id: 9, label: "Sex" },
      { id: 1, label: "Life Stage" },
      { id: 17, label: "Alive or Dead" },
      { id: 22, label: "Evidence of Presence" },
    ];

    expect(results).toStrictEqual(expected);
  });
});

describe("formatPopularFields", () => {
  test("takes popular fields api and returns object", () => {
    let store = structuredClone(mapStore);

    let names1 = formatTaxonName(milkweedBasic, store);
    let milkweed = structuredClone(
      popular_fields_milkweed,
    ) as NormalizedPopularFields;
    milkweed.taxon_id = milkweedBasic.id;
    milkweed.taxon_name = `${names1.title} (${names1.subtitle})`;

    let names2 = formatTaxonName(monarchBasic, store);
    let monarch = structuredClone(
      popular_fields_monarch,
    ) as NormalizedPopularFields;
    monarch.taxon_id = monarchBasic.id;
    monarch.taxon_name = `${names2.title} (${names2.subtitle})`;

    let results = formatPopularFields([milkweed, monarch]);

    expect(results).toStrictEqual(processedPopularFields);
  });

  test("adds data with zero counts if taxon does not have term value that other taxa have", () => {
    let data1 = structuredClone(
      popular_fields_canyon_gooseberry,
    ) as NormalizedPopularFields;
    data1.taxon_id = 52687;
    data1.taxon_name = `canyon gooseberry`;

    let data2 = structuredClone(
      popular_fields_hillside_gooseberry,
    ) as NormalizedPopularFields;
    data2.taxon_id = 47129;
    data2.taxon_name = `hillside gooseberry`;

    let results = formatPopularFields([data1, data2]);

    expect(results).toStrictEqual(processedPopularFieldsGooseberry);
  });
});

describe("createTermIdValueIds", () => {
  test("create object with all term value ids for each term id", () => {
    let data1 = structuredClone(
      popular_fields_canyon_gooseberry,
    ) as NormalizedPopularFields;
    data1.taxon_id = 52687;
    data1.taxon_name = `canyon gooseberry`;

    let data2 = structuredClone(
      popular_fields_hillside_gooseberry,
    ) as NormalizedPopularFields;
    data2.taxon_id = 47129;
    data2.taxon_name = `hillside gooseberry`;

    let results = createTermIdValueIds([data1, data2]);

    expect(results).toStrictEqual({
      "12": new Set([21, 13, 14, 15]),
      "36": new Set([38, 40, 39, 37]),
      "9": new Set([20]),
    });
  });
});

describe("updateInvalidGraphCategory", () => {
  test.each(histogramGraphCategory)(
    "do change graph category if category is not popular fields id",
    (category) => {
      let store = structuredClone(mapStore);
      let graphMetaData = store.viewMetadata.observations_observations.graphs;
      if (!graphMetaData) return;

      store.selectedTaxa = [allTaxaRecord];
      graphMetaData.category = category;

      updateInvalidGraphCategory(store, graphMetaData);

      expect(graphMetaData.category).toBe(category);
    },
  );

  test("change graph category to month_of_year if selected taxa is default taxa and category is popular field id", () => {
    let store = structuredClone(mapStore);
    let graphMetaData = store.viewMetadata.observations_observations.graphs;
    if (!graphMetaData) return;

    store.selectedTaxa = [allTaxaRecord];
    graphMetaData.category = "1";

    updateInvalidGraphCategory(store, graphMetaData);

    expect(graphMetaData.category).toBe("month_of_year");
  });

  test("do not change graph category if selected taxa exists and selected taxa has given popular field", () => {
    let store = structuredClone(mapStore);
    let graphMetaData = store.viewMetadata.observations_observations.graphs;
    if (!graphMetaData) return;

    store.selectedTaxa = [redOakBasic];
    store.cacheData.observations.popularFields = {
      1: [createPopularFieldCache(redOakBasic, 1)],
    };
    graphMetaData.category = "1";

    updateInvalidGraphCategory(store, graphMetaData);

    expect(graphMetaData.category).toBe("1");
  });

  test("change graph category to month_of_year if selected taxa exists and selected taxa does not have given popular field", () => {
    let store = structuredClone(mapStore);
    let graphMetaData = store.viewMetadata.observations_observations.graphs;
    if (!graphMetaData) return;

    store.selectedTaxa = [redOakBasic];
    store.cacheData.observations.popularFields = {
      1: [createPopularFieldCache(redOakBasic, 1)],
    };
    graphMetaData.category = "9";

    updateInvalidGraphCategory(store, graphMetaData);

    expect(graphMetaData.category).toBe("month_of_year");
  });
});
