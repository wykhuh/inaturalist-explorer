// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import { mapStore } from "../../../lib/store";
import { updateInvalidGraphCategory } from "../../../components/SubviewGraphs/utils";
import { histogramGraphCategory } from "../../../data/app_data";
import { allTaxaRecord } from "../../../data/inat_data";
import { createPopularFieldCache, redOakBasic } from "../../test_helpers";

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
