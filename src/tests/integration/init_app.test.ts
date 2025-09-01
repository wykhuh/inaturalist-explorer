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

import { initApp, leafletVisibleLayers } from "../../lib/data_utils";
import { decodeAppUrl } from "../../lib/utils";
import {
  createMockServer,
  setupMapAndStore,
  expectEmpytMap,
  expectLifeTaxa,
  expectLosAngelesPlace,
  expectNoPlaces,
  expectNoRefresh,
  expectNoTaxa,
  expectRefreshPlace,
  losangeles,
  life,
  colors,
  placeLabel_la,
  gridLabel_life,
  gridLabel_life_la,
  refreshBBoxLabel,
  basemapLabel_osm,
} from "../test_helpers.ts";

beforeEach(() => {
  const { JSDOM } = jsdom;

  let dom = new JSDOM(
    `<!doctype html>
<html lang="en">
  <body>
    <div id="map" style="width: 400px; height: 400px"></div>
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

describe("initApp", () => {
  test("loads and renders taxa data based on url params", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams =
      "?taxon_ids=48460&colors=%234477aa&verifiable=true&spam=false";
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);

    let expectedParams = {
      color: colors[0],
      taxon_id: life().id,
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });

  test("loads and renders taxa and place data based on url params", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams =
      "?taxon_ids=48460&place_id=962&colors=%234477aa&spam=false&verifiable=true";
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectNoRefresh(store);
    expectLifeTaxa(store);
    expectLosAngelesPlace(store);
    let expectedParams = {
      color: colors[0],
      place_id: losangeles.id.toString(),
      taxon_id: life().id,
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });

  test("loads and renders taxa and bounding box data based on url params", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams =
      "?taxon_ids=48460&place_id=0&colors=%234477aa&spam=false&verifiable=true&nelat=0&nelng=0&swlat=0&swlng=0";
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_life,
    ]);
    expectRefreshPlace(store);
    expectLifeTaxa(store);
    let expectedParams = {
      color: colors[0],
      taxon_id: life().id,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });

  test("loads and renders place data based on url params", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams = "?place_id=962&verifiable=true&spam=false";
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
    ]);
    expectNoRefresh(store);
    expectNoTaxa(store);
    expectLosAngelesPlace(store);
    let expectedParams = {
      place_id: losangeles.id.toString(),
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });

  test("loads and renders bounding box data based on url params", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams =
      "?place_id=0&spam=false&verifiable=true&nelat=0&nelng=0&swlat=0&swlng=0";
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
    ]);
    expectRefreshPlace(store);
    expectNoTaxa(store);
    let expectedParams = {
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });
});
