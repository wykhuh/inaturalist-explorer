// @vitest-environment jsdom

import { expect, test, describe } from "vitest";

import { cleanupObervationsParams } from "../lib/cleanup_params_utils";
import { mapStore } from "../lib/store.ts";
import { defaultQuery } from "./test_helpers.ts";

describe("cleanupObervationsParams", () => {
  test("if no changes to store params, returns empty string", () => {
    let store = structuredClone(mapStore);

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual("");
  });

  test("returns params if params are valid properites for iNat API", () => {
    let store = structuredClone(mapStore);
    store.observationsApiParams.sounds = true;
    store.observationsApiParams.order = "desc";
    store.observationsApiParams.order_by = "id";
    store.observationsApiParams.page = 1;
    store.selectedTaxa = [
      { id: 1, color: "red" },
      { id: 2, color: "blue" },
    ];

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual(
      `taxon_id=1%2C2&${defaultQuery}&sounds=true` +
        "&order=desc&order_by=id&page=1",
    );
  });

  test("ignores params if params are not properites for iNat API", () => {
    let store = structuredClone(mapStore);
    (store.observationsApiParams as any).foo = true;

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual("");
  });

  test("ignores taxon_id and place_id when they are 0", () => {
    let store = structuredClone(mapStore);
    store.observationsApiParams.sounds = true;
    store.observationsApiParams.taxon_id = "0";
    store.observationsApiParams.place_id = "0";
    store.selectedTaxa = [{ id: 0, color: "red" }];
    store.selectedPlaces = [{ id: 0 }];

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual(`${defaultQuery}&sounds=true`);
  });

  test("ignores view, colors, subview", () => {
    let store = structuredClone(mapStore);
    store.observationsApiParams.taxon_id = "1";
    store.observationsApiParams.colors = "red";
    store.selectedTaxa = [{ id: 1, color: "red" }];
    store.currentView = "observations";
    store.viewMetadata.observations.subview = "table";

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual(`taxon_id=1&${defaultQuery}`);
  });

  test("uses page, order, order from store to update params", () => {
    let store = structuredClone(mapStore);
    store.observationsApiParams.sounds = true;
    store.observationsApiParams.taxon_id = "1";
    store.observationsApiParams.colors = "red";
    store.selectedTaxa = [{ id: 1, color: "red" }];
    store.observationsApiParams.page = 3;
    store.currentView = "observations";

    let results = cleanupObervationsParams(store);

    expect(results).toStrictEqual(
      `taxon_id=1&${defaultQuery}&sounds=true&page=3`,
    );
  });
});
