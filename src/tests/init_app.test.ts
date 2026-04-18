// @vitest-environment jsdom

import { expect, test, describe } from "vitest";
import { setViewMetadata } from "../lib/init_app";
import { mapStore } from "../lib/store";
import { decodeAppUrl } from "../lib/utils";
import {
  validObservationsSubviews,
  validObservationsViews,
} from "../data/app_data";

describe("setViewMetadata", () => {
  test("it returns default store viewMetadata if no view metadata params", () => {
    let store = structuredClone(mapStore);
    let dupParams = structuredClone(mapStore);

    let urlData = decodeAppUrl("", "/");

    setViewMetadata(store, urlData);

    expect(store.viewMetadata).toStrictEqual(dupParams.viewMetadata);
  });

  test.each(validObservationsViews)(
    "it sets viewMetadata for a view if value is a number",
    (view) => {
      let store = structuredClone(mapStore);

      let urlData = decodeAppUrl(`?page=123&view=${view}`, "/");
      setViewMetadata(store, urlData);

      let expected = structuredClone(mapStore);
      expect(store.viewMetadata[view]).toStrictEqual({
        ...expected.viewMetadata[view],
        page: 123,
      });
    },
  );

  test.each(validObservationsSubviews)(
    "it sets viewMetadata for a view if value is a string",
    (subview) => {
      let store = structuredClone(mapStore);
      let dupParams = structuredClone(mapStore);

      let urlData = decodeAppUrl(
        `?view=observations_observations&subview=${subview}`,
        "/",
      );
      setViewMetadata(store, urlData);

      expect(store.viewMetadata.observations_observations).toStrictEqual({
        ...dupParams.viewMetadata.observations_observations,
        subview: subview,
      });
    },
  );

  test("it sets viewMetadata.observations_observations.graphs", () => {
    let store = structuredClone(mapStore);

    expect(store.viewMetadata.observations_observations.graphs).toStrictEqual({
      category: "month_of_year",
      valueType: "counts",
    });

    let urlData = decodeAppUrl(
      "?graphs_category=year&graphs_value=percents",
      "/",
    );
    setViewMetadata(store, urlData);

    expect(store.viewMetadata.observations_observations.graphs).toStrictEqual({
      category: "year",
      valueType: "percents",
    });
  });

  test("it sets viewMetadata.observations_observations.map", () => {
    let store = structuredClone(mapStore);

    expect(store.viewMetadata.observations_observations.map).toStrictEqual({
      category: "none",
      looping: false,
      mapLayers: {},
      setTimeoutIds: [],
      currentIndex: 0,
    });

    let urlData = decodeAppUrl("?map_category=year", "/");
    setViewMetadata(store, urlData);

    expect(store.viewMetadata.observations_observations.map).toStrictEqual({
      category: "year",
      looping: false,
      mapLayers: {},
      setTimeoutIds: [],
      currentIndex: 0,
    });
  });
});
