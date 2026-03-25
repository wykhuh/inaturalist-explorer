// @vitest-environment jsdom

import {
  expect,
  test,
  describe,
  beforeAll,
  afterEach,
  afterAll,
  vi,
} from "vitest";

import { mapStore } from "../../../lib/store";
import {
  updateInvalidGraphCategory,
  formatPopularFields,
  formatPopularFieldsOptions,
  createTermIdValueIds,
  fetchGraphData,
  getAPIHistogramData,
  getAPIPopularFieldsData,
} from "../../../components/SubviewGraphs/utils";
import { histogramGraphCategory } from "../../../data/app_data";
import { allTaxaRecord } from "../../../data/inat_data";
import {
  bBoxPlace,
  createMockServer,
  createPopularFieldCache,
  iNatBboxParams,
  losangeles,
  monarch,
  redOak,
  redOakBasic,
  sandiego,
} from "../../test_helpers";

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
import type {
  GraphCategory,
  HistogramCategory,
  NormalizedPopularFields,
} from "../../../types/app";

import * as exampleObject from "../../../components/SubviewGraphs/utils";
import {
  histograph_month,
  histograph_month_year,
  histograph_year,
} from "../../../data/api/histogram";
import type { iNatObservationsHistogramAPI } from "../../../types/inat_api";

const server = createMockServer();
beforeAll(() => {
  server.listen();
  vi.useFakeTimers();
});
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
  vi.useRealTimers();
});
afterAll(() => {
  server.close();
});

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

describe("fetchGraphData", () => {
  let categoryApiData: {
    [k in HistogramCategory]: iNatObservationsHistogramAPI;
  } = {
    year: histograph_year,
    month: histograph_month,
    month_of_year: histograph_month_year,
  };

  test("call getAPIHistogramData with default app store", async () => {
    vi.spyOn(exampleObject, "getAPIHistogramData").mockResolvedValueOnce(
      histograph_month_year,
    );
    let store = structuredClone(mapStore);

    await fetchGraphData(store, getAPIHistogramData, getAPIPopularFieldsData);

    expect(exampleObject.getAPIHistogramData).toHaveBeenCalledTimes(1);
    expect(exampleObject.getAPIHistogramData).toHaveBeenCalledWith(
      "spam=false&date_field=observed",
      "month_of_year",
    );
    expect(store.cacheData.observations.graphs.month_of_year).toStrictEqual([
      histograph_month_year.results,
    ]);
  });

  test("call getAPIPopularFieldsData with taxa and popular field category", async () => {
    vi.spyOn(exampleObject, "getAPIPopularFieldsData").mockResolvedValueOnce(
      popular_fields_milkweed,
    );
    let store = structuredClone(mapStore);
    store.selectedTaxa = [redOakBasic];
    let graphMetaData = store.viewMetadata.observations_observations.graphs;
    if (graphMetaData) {
      graphMetaData.category = "1";
    }

    let data = structuredClone(
      popular_fields_milkweed,
    ) as NormalizedPopularFields;
    data.taxon_id = redOakBasic.id;
    data.taxon_name = redOak().title || "";
    let expectedData = formatPopularFields([data]);

    await fetchGraphData(store, getAPIHistogramData, getAPIPopularFieldsData);

    expect(exampleObject.getAPIPopularFieldsData).toHaveBeenCalledTimes(1);
    expect(exampleObject.getAPIPopularFieldsData).toHaveBeenCalledWith(
      `taxon_id=${redOakBasic.id}&verifiable=true&spam=false&per_page=50&unannotated=true`,
    );
    expect(store.cacheData.observations.popularFields).toStrictEqual(
      expectedData,
    );
  });

  test("call getAPIPopularFieldsData with multiple taxa and popular field category", async () => {
    vi.spyOn(exampleObject, "getAPIPopularFieldsData")
      .mockResolvedValueOnce(structuredClone(popular_fields_milkweed))
      .mockResolvedValueOnce(structuredClone(popular_fields_milkweed));
    let store = structuredClone(mapStore);
    store.selectedTaxa = [redOakBasic, monarchBasic];
    let graphMetaData = store.viewMetadata.observations_observations.graphs;
    if (graphMetaData) {
      graphMetaData.category = "1";
    }

    let oakData = structuredClone(
      popular_fields_milkweed,
    ) as NormalizedPopularFields;
    oakData.taxon_id = redOakBasic.id;
    oakData.taxon_name = redOak().title || "";
    let monarchData = structuredClone(
      popular_fields_milkweed,
    ) as NormalizedPopularFields;
    monarchData.taxon_id = monarchBasic.id;
    monarchData.taxon_name = monarch().title || "";
    let expectedData = formatPopularFields([oakData, monarchData]);

    await fetchGraphData(store, getAPIHistogramData, getAPIPopularFieldsData);

    expect(exampleObject.getAPIPopularFieldsData).toHaveBeenCalledTimes(2);
    expect(exampleObject.getAPIPopularFieldsData).toHaveBeenCalledWith(
      `taxon_id=${redOakBasic.id}&verifiable=true&spam=false&per_page=50&unannotated=true`,
    );
    expect(exampleObject.getAPIPopularFieldsData).toHaveBeenCalledWith(
      `taxon_id=${monarchBasic.id}&verifiable=true&spam=false&per_page=50&unannotated=true`,
    );

    expect(store.cacheData.observations.popularFields).toStrictEqual(
      expectedData,
    );
  });

  test("call getAPIHistogramData with default taxa and popular field category", async () => {
    vi.spyOn(exampleObject, "getAPIHistogramData").mockResolvedValueOnce(
      histograph_month_year,
    );
    let store = structuredClone(mapStore);
    store.selectedTaxa = [allTaxaRecord];
    let graphMetaData = store.viewMetadata.observations_observations.graphs;
    if (graphMetaData) {
      graphMetaData.category = "1";
    }

    await fetchGraphData(store, getAPIHistogramData, getAPIPopularFieldsData);

    expect(exampleObject.getAPIHistogramData).toHaveBeenCalledTimes(1);
    expect(exampleObject.getAPIHistogramData).toHaveBeenCalledWith(
      "spam=false&date_field=observed",
      "month_of_year",
    );
    expect(store.cacheData.observations.graphs.month_of_year).toStrictEqual([
      histograph_month_year.results,
    ]);
  });

  test("call getAPIHistogramData with taxa and invalid popular field category", async () => {
    vi.spyOn(exampleObject, "getAPIHistogramData").mockResolvedValueOnce(
      histograph_month_year,
    );
    let store = structuredClone(mapStore);
    store.selectedTaxa = [redOakBasic];
    let graphMetaData = store.viewMetadata.observations_observations.graphs;
    if (graphMetaData) {
      // @ts-ignore
      graphMetaData.category = "1000";
    }

    await fetchGraphData(store, getAPIHistogramData, getAPIPopularFieldsData);

    expect(exampleObject.getAPIHistogramData).toHaveBeenCalledTimes(1);
    expect(exampleObject.getAPIHistogramData).toHaveBeenCalledWith(
      `taxon_id=${redOakBasic.id}&verifiable=true&spam=false&date_field=observed`,
      "month_of_year",
    );
    expect(store.cacheData.observations.graphs.month_of_year).toStrictEqual([
      histograph_month_year.results,
    ]);
  });

  test.each(histogramGraphCategory)(
    "call getAPIHistogramData with multiple taxa",
    async (category) => {
      vi.spyOn(exampleObject, "getAPIHistogramData").mockResolvedValueOnce(
        categoryApiData[category],
      );
      const date = new Date(2025, 1, 1);
      vi.setSystemTime(date);

      let store = structuredClone(mapStore);
      store.selectedTaxa = [monarchBasic, redOakBasic];
      let graphMetaData = store.viewMetadata.observations_observations.graphs;
      if (graphMetaData) {
        graphMetaData.category = category;
      }

      await fetchGraphData(store, getAPIHistogramData, getAPIPopularFieldsData);

      let expected = `taxon_id=${monarchBasic.id}%2C${redOakBasic.id}&verifiable=true&spam=false&date_field=observed`;
      if (category !== "month_of_year") {
        expected += "&d1=2015-01-01";
      }
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledTimes(1);
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledWith(
        expected,
        category,
      );
      expect(store.cacheData.observations.graphs[category]).toStrictEqual([
        categoryApiData[category].results,
      ]);
    },
  );

  test.each(histogramGraphCategory)(
    "call getAPIHistogramData with default taxa, group by species",
    async (category) => {
      vi.spyOn(exampleObject, "getAPIHistogramData").mockResolvedValueOnce(
        categoryApiData[category],
      );
      const date = new Date(2025, 1, 1);
      vi.setSystemTime(date);

      let store = structuredClone(mapStore);
      store.selectedTaxa = [allTaxaRecord];
      let graphMetaData = store.viewMetadata.observations_observations.graphs;
      if (graphMetaData) {
        graphMetaData.groupBy = "species";
        graphMetaData.category = category;
      }

      await fetchGraphData(store, getAPIHistogramData, getAPIPopularFieldsData);

      let expected = `spam=false&date_field=observed`;
      if (category !== "month_of_year") {
        expected =
          "verifiable=true&spam=false&date_field=observed&d1=2015-01-01";
      }
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledTimes(1);
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledWith(
        expected,
        category,
      );
      expect(store.cacheData.observations.graphs[category]).toStrictEqual([
        categoryApiData[category].results,
      ]);
    },
  );

  test.each(histogramGraphCategory)(
    "call getAPIHistogramData with taxon and group by species",
    async (category) => {
      vi.spyOn(exampleObject, "getAPIHistogramData").mockResolvedValueOnce(
        categoryApiData[category],
      );
      const date = new Date(2025, 1, 1);
      vi.setSystemTime(date);

      let store = structuredClone(mapStore);
      store.selectedTaxa = [redOakBasic];
      let graphMetaData = store.viewMetadata.observations_observations.graphs;
      if (graphMetaData) {
        graphMetaData.groupBy = "species";
        graphMetaData.category = category;
      }

      await fetchGraphData(store, getAPIHistogramData, getAPIPopularFieldsData);

      let expected = `taxon_id=${redOakBasic.id}&verifiable=true&spam=false&date_field=observed`;
      if (category !== "month_of_year") {
        expected += "&d1=2015-01-01";
      }
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledTimes(1);
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledWith(
        expected,
        category,
      );
      expect(
        store.cacheData.observations.graphsSpecies[category],
      ).toStrictEqual([categoryApiData[category].results]);
    },
  );

  test.each(histogramGraphCategory)(
    "call getAPIHistogramData with multiple taxa and group by species",
    async (category) => {
      vi.spyOn(exampleObject, "getAPIHistogramData")
        .mockResolvedValueOnce(categoryApiData[category])
        .mockResolvedValueOnce(categoryApiData[category]);
      const date = new Date(2025, 1, 1);
      vi.setSystemTime(date);

      let store = structuredClone(mapStore);
      store.selectedTaxa = [redOakBasic, monarchBasic];
      let graphMetaData = store.viewMetadata.observations_observations.graphs;
      if (graphMetaData) {
        graphMetaData.groupBy = "species";
        graphMetaData.category = category;
      }

      await fetchGraphData(store, getAPIHistogramData, getAPIPopularFieldsData);

      let expected1 = `taxon_id=${redOakBasic.id}&verifiable=true&spam=false&date_field=observed`;
      let expected2 = `taxon_id=${monarchBasic.id}&verifiable=true&spam=false&date_field=observed`;
      if (category !== "month_of_year") {
        expected1 += "&d1=2015-01-01";
        expected2 += "&d1=2015-01-01";
      }
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledTimes(2);
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledWith(
        expected1,
        category,
      );
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledWith(
        expected2,
        category,
      );
      expect(
        store.cacheData.observations.graphsSpecies[category],
      ).toStrictEqual([
        categoryApiData[category].results,
        categoryApiData[category].results,
      ]);
    },
  );

  test.each(histogramGraphCategory)(
    "call getAPIHistogramData with multiple places",
    async (category) => {
      vi.spyOn(exampleObject, "getAPIHistogramData").mockResolvedValueOnce(
        categoryApiData[category],
      );
      const date = new Date(2025, 1, 1);
      vi.setSystemTime(date);

      let store = structuredClone(mapStore);
      store.selectedPlaces = [losangeles, sandiego];
      let graphMetaData = store.viewMetadata.observations_observations.graphs;
      if (graphMetaData) {
        graphMetaData.category = category as GraphCategory;
      }

      await fetchGraphData(store, getAPIHistogramData, getAPIPopularFieldsData);

      let expected = `place_id=${losangeles.id}%2C${sandiego.id}&verifiable=true&spam=false&date_field=observed`;
      if (category !== "month_of_year") {
        expected += "&d1=2015-01-01";
      }
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledTimes(1);
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledWith(
        expected,
        category,
      );
      expect(store.cacheData.observations.graphs[category]).toStrictEqual([
        categoryApiData[category].results,
      ]);
    },
  );

  test.each(histogramGraphCategory)(
    "call getAPIHistogramData with bounding box",
    async (category) => {
      vi.spyOn(exampleObject, "getAPIHistogramData").mockResolvedValueOnce(
        categoryApiData[category],
      );
      const date = new Date(2025, 1, 1);
      vi.setSystemTime(date);

      let store = structuredClone(mapStore);
      store.selectedPlaces = [bBoxPlace];
      store.observationsApiParams = {
        nelng: -104,
        nelat: 45,
        swlat: 41,
        swlng: -111,
      };
      let graphMetaData = store.viewMetadata.observations_observations.graphs;
      if (graphMetaData) {
        graphMetaData.category = category as GraphCategory;
      }

      await fetchGraphData(store, getAPIHistogramData, getAPIPopularFieldsData);

      let expected = `${iNatBboxParams}&spam=false&date_field=observed`;
      if (category !== "month_of_year") {
        expected += `&d1=2015-01-01`;
      }
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledTimes(1);
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledWith(
        expected,
        category,
      );
      expect(store.cacheData.observations.graphs[category]).toStrictEqual([
        categoryApiData[category].results,
      ]);
    },
  );

  test.each(histogramGraphCategory)(
    "call getAPIHistogramData with one place and group by place",
    async (category) => {
      vi.spyOn(exampleObject, "getAPIHistogramData").mockResolvedValueOnce(
        categoryApiData[category],
      );
      const date = new Date(2025, 1, 1);
      vi.setSystemTime(date);

      let store = structuredClone(mapStore);
      store.selectedPlaces = [losangeles];
      let graphMetaData = store.viewMetadata.observations_observations.graphs;
      if (graphMetaData) {
        graphMetaData.category = category;
        graphMetaData.groupBy = "places";
      }

      await fetchGraphData(store, getAPIHistogramData, getAPIPopularFieldsData);

      let expected = `place_id=${losangeles.id}&verifiable=true&spam=false&date_field=observed`;
      if (category !== "month_of_year") {
        expected += "&d1=2015-01-01";
      }
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledTimes(1);
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledWith(
        expected,
        category,
      );
      expect(store.cacheData.observations.graphsPlaces[category]).toStrictEqual(
        [categoryApiData[category].results],
      );
    },
  );

  test.each(histogramGraphCategory)(
    "call getAPIHistogramData with multiple places and group by place",
    async (category) => {
      vi.spyOn(exampleObject, "getAPIHistogramData")
        .mockResolvedValueOnce(categoryApiData[category])
        .mockResolvedValueOnce(categoryApiData[category]);
      const date = new Date(2025, 1, 1);
      vi.setSystemTime(date);

      let store = structuredClone(mapStore);
      store.selectedPlaces = [losangeles, sandiego];
      let graphMetaData = store.viewMetadata.observations_observations.graphs;
      if (graphMetaData) {
        graphMetaData.category = category;
        graphMetaData.groupBy = "places";
      }

      await fetchGraphData(store, getAPIHistogramData, getAPIPopularFieldsData);

      let expected1 = `place_id=${losangeles.id}&verifiable=true&spam=false&date_field=observed`;
      let expected2 = `place_id=${sandiego.id}&verifiable=true&spam=false&date_field=observed`;
      if (category !== "month_of_year") {
        expected1 += "&d1=2015-01-01";
        expected2 += "&d1=2015-01-01";
      }
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledTimes(2);
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledWith(
        expected1,
        category,
      );
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledWith(
        expected2,
        category,
      );
      expect(store.cacheData.observations.graphsPlaces[category]).toStrictEqual(
        [categoryApiData[category].results, categoryApiData[category].results],
      );
    },
  );

  test.each(histogramGraphCategory)(
    "call getAPIHistogramData with bounding box and group by place",
    async (category) => {
      vi.spyOn(exampleObject, "getAPIHistogramData").mockResolvedValueOnce(
        categoryApiData[category],
      );
      const date = new Date(2025, 1, 1);
      vi.setSystemTime(date);

      let store = structuredClone(mapStore);
      store.selectedPlaces = [bBoxPlace];
      store.observationsApiParams = {
        nelng: -104,
        nelat: 45,
        swlat: 41,
        swlng: -111,
      };
      let graphMetaData = store.viewMetadata.observations_observations.graphs;
      if (graphMetaData) {
        graphMetaData.category = category as GraphCategory;
        graphMetaData.groupBy = "places";
      }

      await fetchGraphData(store, getAPIHistogramData, getAPIPopularFieldsData);

      let expected = `${iNatBboxParams}&spam=false&date_field=observed`;
      if (category !== "month_of_year") {
        expected += `&d1=2015-01-01`;
      }
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledTimes(1);
      expect(exampleObject.getAPIHistogramData).toHaveBeenCalledWith(
        expected,
        category,
      );
      expect(store.cacheData.observations.graphs[category]).toStrictEqual([
        categoryApiData[category].results,
      ]);
    },
  );
});
