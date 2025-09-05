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

import { leafletVisibleLayers } from "../../lib/data_utils";
import { decodeAppUrl } from "../../lib/utils";
import {
  createMockServer,
  setupMapAndStore,
  expectEmpytMap,
  expectLifeTaxa,
  expectLosAngelesPlace,
  expectNoPlaces,
  expectNoRefresh,
  expectRefreshPlace,
  losangeles,
  life,
  colors,
  placeLabel_la,
  gridLabel_life,
  gridLabel_life_la,
  refreshBBoxLabel,
  basemapLabel_osm,
  gridLabel_allTaxaRecord,
  gridLabel_allTaxaRecord_la,
  expectAllTaxaRecord,
  colorsEncoded,
  redOak,
  sandiego,
  placeLabel_sd,
  gridLabel_life_la_sd,
  gridLabel_oaks_la_sd,
  expect_LA_SD_Place,
} from "../test_helpers.ts";
import type { iNatApiParams } from "../../types/app";
import { allTaxaRecord, fieldsWithAny } from "../../lib/inat_data.ts";
import { iNatOrange } from "../../lib/map_colors_utils.ts";
import { initApp } from "../../lib/init_app.ts";

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
  test("adds all taxa, verifiable true, and spam false when no search params", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams = "";
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);

    let expectedParams: iNatApiParams = {
      verifiable: true,
      spam: false,
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });

  test("updates inatApiParams with values in params ", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams = "?verifiable=false&spam=true&photos=false";
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);

    let expectedParams: iNatApiParams = {
      verifiable: false,
      spam: true,
      photos: false,
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });

  test("ignores invalid params ", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams = "?boo=true&foo=any";
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);

    let expectedParams: iNatApiParams = {
      spam: false,
      verifiable: true,
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });

  test("loads and renders taxa data based on url params", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams = `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`;
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);

    let expectedParams: iNatApiParams = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });

  test("loads and renders taxa data with verifiable and spam set to false", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams = `?taxon_id=${life().id}&verifiable=false&spam=false`;
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);

    let expectedParams: iNatApiParams = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      verifiable: false,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });

  test("loads and renders taxa data with verifiable and spam set to true", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams = `?taxon_id=${life().id}&verifiable=true&spam=true`;
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);

    let expectedParams: iNatApiParams = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      verifiable: true,
      spam: true,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });

  test("loads and renders taxa data without verifiable and spam", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams = `?taxon_id=${life().id}`;
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);

    let expectedParams: iNatApiParams = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });

  test.each(fieldsWithAny)(
    "loads and renders taxa data, ignore field set to any",
    async (field) => {
      let { store } = setupMapAndStore();

      expectEmpytMap(store);

      let searchparams = `?taxon_id=${life().id}&${field}=any`;
      let urlData = decodeAppUrl(searchparams);

      await initApp(store, urlData);

      expect(leafletVisibleLayers(store)).toStrictEqual([
        basemapLabel_osm,
        gridLabel_life,
      ]);
      expectNoPlaces(store);
      expectNoRefresh(store);
      expectLifeTaxa(store);

      let expectedParams: iNatApiParams = {
        colors: colors[0],
        taxon_id: life().id.toString(),
        spam: false,
      };
      if (field != "verifiable") {
        expectedParams.verifiable = true;
      }

      expect(store.inatApiParams).toStrictEqual(expectedParams);
    },
  );

  test("loads and renders taxa data if colors not in url", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams = `?taxon_id=${life().id}&verifiable=true&spam=false`;
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);

    let expectedParams: iNatApiParams = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });

  test("loads and renders one taxa and one place based on url params", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams = `?taxon_id=${life().id}&place_id=${losangeles.id}&colors=${colorsEncoded[0]}&spam=false&verifiable=true`;
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
    let expectedParams: iNatApiParams = {
      colors: colors[0],
      place_id: losangeles.id.toString(),
      taxon_id: life().id.toString(),
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });

  test("loads and renders taxa and bounding box data based on url params", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams = `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&spam=false&verifiable=true&nelat=0&nelng=0&swlat=0&swlng=0`;
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_life,
    ]);
    expectRefreshPlace(store);
    expectLifeTaxa(store);
    let expectedParams: iNatApiParams = {
      colors: colors[0],
      taxon_id: life().id.toString(),
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

    let searchparams = `?place_id=${losangeles.id}&verifiable=true&spam=false`;
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expectLosAngelesPlace(store);
    let expectedParams: iNatApiParams = {
      place_id: losangeles.id.toString(),
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });

  test("loads and renders bounding box data based on url params", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    let searchparams =
      "?spam=false&verifiable=true&nelat=0&nelng=0&swlat=0&swlng=0";
    let urlData = decodeAppUrl(searchparams);

    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectRefreshPlace(store);
    expectAllTaxaRecord(store);
    let expectedParams: iNatApiParams = {
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });

  test("loads and renders multiple taxa and places based on url params", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    colorsEncoded;

    let searchparams = `?taxon_id=${life().id},${redOak().id}&place_id=${losangeles.id},${sandiego.id}&colors=${colorsEncoded[0]},${colorsEncoded[1]}&spam=false&verifiable=true`;
    let urlData = decodeAppUrl(searchparams);
    await initApp(store, urlData);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      // BUG: layers with same description
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_life_la_sd,
      gridLabel_oaks_la_sd,
    ]);
    expectNoRefresh(store);
    let lifeTemp = life(colors[0]);
    let oakTemp = redOak(colors[1]);
    expect(store.selectedTaxa).toStrictEqual([lifeTemp, oakTemp]);
    expect(Object.keys(store.taxaMapLayers)).toEqual([
      lifeTemp.id.toString(),
      oakTemp.id.toString(),
    ]);
    expect(store.taxaMapLayers[lifeTemp.id].length).toBe(4);
    expect(store.taxaMapLayers[oakTemp.id].length).toBe(4);
    expect(store.color).toBe(colors[1]);
    expect_LA_SD_Place(store);

    let expectedParams: iNatApiParams = {
      colors: colors[1],
      place_id: `${losangeles.id},${sandiego.id}`,
      taxon_id: redOak().id.toString(),
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
  });
});
