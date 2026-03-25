// @vitest-environment jsdom
import {
  expect,
  test,
  describe,
  beforeEach,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest";
import jsdom from "jsdom";

import { leafletVisibleLayers } from "../../lib/data_utils.ts";
import { decodeAppUrl } from "../../lib/utils.ts";
import {
  createMockServer,
  expectEmpytMap,
  life,
  allTaxa,
  defaultParams,
  expectEmptyResources,
  perPage,
} from "../test_helpers.ts";
import type { ObservationsApiParamsType } from "../../types/app";

import { iNatOrange } from "../../lib/map_colors_utils.ts";
import { initPopulateStore } from "../../lib/init_app.ts";
import { mapStore } from "../../lib/store.ts";
import "../../components/PageObservations/component.ts";

beforeEach(() => {
  const { JSDOM } = jsdom;

  let dom = new JSDOM(
    `<!doctype html>
<html lang="en">
  <body>
<div id="app"></div>
<div id="view-container"></div>
  </body>
</html>`,
  );
  global.document = dom.window.document;
});

const server = createMockServer();
beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

// NOTE: update when adding selectedResource
describe("initPopulateStore resources", () => {
  test("loads and renders taxa data based on url params 2", async () => {
    let store = structuredClone(mapStore);
    let pageElement = document.createElement("page-observations");
    const mainEl = document.querySelector<HTMLDivElement>("#app");
    mainEl?.appendChild(pageElement);
    const foo = document.querySelector<HTMLDivElement>("page-observations");
    console.log(foo);
    return;
    expectEmpytMap(store);

    let searchparams = `?view=observations_observations&subview=graph`;
    let urlData = decodeAppUrl(searchparams, "/");
    // Router.init();

    await initPopulateStore(store, urlData);

    expectEmptyResources(store, ["selectedTaxa"]);
    expect(leafletVisibleLayers(store)).toStrictEqual([]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      colors: `${iNatOrange}`,
      taxon_id: `${allTaxa.id}`,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.viewMetadata.observations_observations.graphs).toStrictEqual({
      category: "month_of_year",
    });
    expect(store.cacheData.observations.graphs).toStrictEqual({
      month: [],
      month_of_year: [],
      year: [],
    });
  });

  test("loads and renders taxa data based on url params 3", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?view=observations_observations&subview=graph&graph_category=1`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);

    expectEmptyResources(store, ["selectedTaxa"]);
    expect(leafletVisibleLayers(store)).toStrictEqual([]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      colors: `${iNatOrange}`,
      taxon_id: `${allTaxa.id}`,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.viewMetadata.observations_observations.graphs).toStrictEqual({
      category: "month_of_year",
      valueType: "counts",
    });
    expect(store.cacheData.observations.graphs).toStrictEqual({
      month: [],
      month_of_year: [],
      year: [],
    });
  });

  test("loads and renders taxa data based on url params 1", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?view=observations_observations&subview=graph&graph_category=year&taxon_id=${life().id}`;

    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);

    expectEmptyResources(store, ["selectedTaxa"]);
    expect(leafletVisibleLayers(store)).toStrictEqual([]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      colors: `${life().color}`,
      taxon_id: `${life().id}`,
      per_page: perPage,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.viewMetadata.observations_observations.graphs).toStrictEqual({
      category: "month_of_year",
      valueType: "counts",
    });
    expect(store.cacheData.observations.graphs).toStrictEqual({
      month: [],
      month_of_year: [],
      year: [],
    });
  });
});
