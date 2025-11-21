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
  refreshBBoxLabel,
  basemapLabel_osm,
  gridLabel_allTaxaRecord,
  gridLabel_allTaxaRecord_la,
  expectAllTaxaRecord,
  colorsEncoded,
  redOak,
  sandiego,
  placeLabel_sd,
  expect_LA_SD_Place,
  project_cnc1,
  expectProject1,
  gridLabel_allTaxaRecord_project1,
  project_cnc2,
  expectLifeOakTaxa,
  expectProjects,
  user1,
  gridLabel_allTaxaRecord_user1,
  expectUser1,
  user2,
  expectUsers,
  gridLabel_oaks_bbox_resources,
  gridLabel_life_bbox_resources,
  placeBBoxLabel,
  allTaxa,
  projectLabel_cnc2,
  defaultParams,
  defaultQuery,
  expectUser1Identifier,
  gridLabel_allTaxaRecord_user1Identifier,
  expectUser1UnobservedByUser,
  gridLabel_allTaxaRecord_user1Unobserved,
  gridLabel_life_places_identifier,
  gridLabel_oaks_places_identifier,
} from "../test_helpers.ts";
import type { ObservationsApiParams } from "../../types/app";
import { fieldsWithAny } from "../../data/inat_data.ts";
import { iNatOrange } from "../../lib/map_colors_utils.ts";
import { initPopulateStore, initRenderMap } from "../../lib/init_app.ts";
import { mapStore } from "../../lib/store.ts";

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

describe("initPopulateStore and initRenderMap options", () => {
  test("adds all taxa, verifiable true, and spam false when no search params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = "";
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);

    let expectedParams: ObservationsApiParams = {
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(iNatOrange);
  });

  test("updates observationsApiParams with values in params ", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = "?verifiable=false&spam=true&photos=false";
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);

    let expectedParams: ObservationsApiParams = {
      verifiable: false,
      spam: true,
      photos: false,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      locale: "en",
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(iNatOrange);
  });

  test("ignores invalid params ", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = "?boo=true&foo=any";
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);

    let expectedParams: ObservationsApiParams = {
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders taxa data with verifiable and spam set to false", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?taxon_id=${life().id}&verifiable=false&spam=false`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);

    let expectedParams: ObservationsApiParams = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      verifiable: false,
      spam: false,
      locale: "en",
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(colors[0]);
  });

  test("loads and renders taxa data with verifiable and spam set to true", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?taxon_id=${life().id}&verifiable=true&spam=true`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);

    let expectedParams: ObservationsApiParams = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      verifiable: true,
      spam: true,
      locale: "en",
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(colors[0]);
  });

  test("loads and renders taxa data without verifiable and spam", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?taxon_id=${life().id}`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);

    let expectedParams: ObservationsApiParams = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(colors[0]);
  });

  test.each(fieldsWithAny)(
    "loads and renders taxa data, ignore field set to any",
    async (field) => {
      let store = structuredClone(mapStore);

      expectEmpytMap(store);

      let searchparams = `?taxon_id=${life().id}&${field}=any`;
      let urlData = decodeAppUrl(searchparams);

      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      expect(leafletVisibleLayers(store)).toStrictEqual([
        basemapLabel_osm,
        gridLabel_life,
      ]);
      expectNoPlaces(store);
      expectNoRefresh(store);
      expectLifeTaxa(store);

      let expectedParams: ObservationsApiParams = {
        colors: colors[0],
        taxon_id: life().id.toString(),
        spam: false,
        locale: "en",
      };
      if (field != "verifiable") {
        expectedParams.verifiable = true;
      }

      expect(store.observationsApiParams).toStrictEqual(expectedParams);
      expect(store.color).toBe(colors[0]);
    },
  );

  test("loads and renders taxa data if colors not in url", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?taxon_id=${life().id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);

    let expectedParams: ObservationsApiParams = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(colors[0]);
  });

  test("adds observations view and subview to store", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?view=observations&subview=table`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    });
    expect(store.color).toBe(iNatOrange);
    expect(store.currentView).toBe("observations");
    expect(store.viewMetadata.observations).toStrictEqual({ subview: "table" });
  });

  test("adds observations view to store", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?view=observations`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    });
    expect(store.color).toBe(iNatOrange);
    expect(store.currentView).toBe("observations");
    expect(store.viewMetadata.observations).toStrictEqual({ subview: "grid" });
  });

  test("adds view to store", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?view=identifiers`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    });
    expect(store.color).toBe(iNatOrange);
    expect(store.currentView).toBe("identifiers");
    expect(store.viewMetadata.identifiers).toStrictEqual({});
  });

  test("adds page, order, order_by, and view to store", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?view=identifiers&page=3&order=desc&order_by=id`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      page: 3,
      order: "desc",
      order_by: "id",
      ...defaultParams,
    });
    expect(store.color).toBe(iNatOrange);
    expect(store.viewMetadata).toStrictEqual({
      identifications: {},
      identifiers: { page: 3, order: "desc", order_by: "id" },
      observers: {},
      species: {},
      observations: {
        subview: "grid",
      },
      name_order: "cs",
    });
    expect(store.currentView).toBe("identifiers");
    expect(store.viewMetadata.identifiers).toStrictEqual({
      page: 3,
      order: "desc",
      order_by: "id",
    });
  });

  test("adds locale to store", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=es`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
      locale: "es",
    });
    expect(store.color).toBe(iNatOrange);
  });

  test("adds name_order to store", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?name_order=sc`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    });
    expect(store.color).toBe(iNatOrange);
    expect(store.viewMetadata.name_order).toBe("sc");
  });
});

describe("initPopulateStore and initRenderMap resources", () => {
  test("loads and renders taxa data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    let lifeCount = life().observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);
    let expectedParams: ObservationsApiParams = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(colors[0]);
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);
  });

  test("loads and renders place data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?place_id=${losangeles.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    let allTaxaLACount = allTaxa.observations_count * 0.6;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectNoRefresh(store);
    expectAllTaxaRecord(store, allTaxaLACount);
    expectLosAngelesPlace(store, allTaxaLACount);
    let expectedParams: ObservationsApiParams = {
      place_id: losangeles.id.toString(),
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(iNatOrange);
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaLACount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaLACount);
  });

  test("loads and renders bounding box data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams =
      "?spam=false&verifiable=true&nelat=0&nelng=0&swlat=0&swlng=0";
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    let allTaxaCount = allTaxa.observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeBBoxLabel,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectRefreshPlace(store, allTaxaCount);
    expectAllTaxaRecord(store);
    let expectedParams: ObservationsApiParams = {
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(iNatOrange);
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount);
  });

  test("loads and renders project data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?project_id=${project_cnc1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    let allTaxaProjectCount = allTaxa.observations_count * 0.7;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectNoRefresh(store);
    expectNoPlaces(store);
    expectAllTaxaRecord(store, allTaxaProjectCount);
    expectProject1(store, allTaxaProjectCount);
    let expectedParams: ObservationsApiParams = {
      project_id: project_cnc1.id.toString(),
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(iNatOrange);
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaProjectCount);
    expect(store.selectedProjects[0].observations_count).toBe(
      allTaxaProjectCount,
    );
  });

  test("loads and renders user data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?user_id=${user1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    let allTaxaCount = allTaxa.observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1,
    ]);
    expectNoRefresh(store);
    expectNoPlaces(store);
    expectAllTaxaRecord(store, allTaxaCount * 0.45);
    expectUser1(store, allTaxaCount * 0.45);
    let expectedParams: ObservationsApiParams = {
      user_id: user1.id.toString(),
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(iNatOrange);
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount * 0.45);
  });

  test("loads and renders user identifier data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?ident_user_id=${user1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    let allTaxaCount = allTaxa.observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1Identifier,
    ]);
    expectNoRefresh(store);
    expectNoPlaces(store);
    expectAllTaxaRecord(store, allTaxaCount * 0.75);
    expectUser1Identifier(store);
    let expectedParams: ObservationsApiParams = {
      ident_user_id: `${user1.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(iNatOrange);
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount * 0.75);
  });

  test("loads and renders unobserved by user data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?unobserved_by_user_id=${user1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    let allTaxaCount = allTaxa.observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1Unobserved,
    ]);
    expectNoRefresh(store);
    expectNoPlaces(store);
    expectAllTaxaRecord(store, allTaxaCount * 0.65);
    expectUser1UnobservedByUser(store);
    let expectedParams: ObservationsApiParams = {
      ...defaultParams,
      unobserved_by_user_id: user1.id,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders resources and places based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?taxon_id=${life().id},${redOak().id}`;
    searchparams += `&place_id=${losangeles.id},${sandiego.id}`;
    searchparams += `&project_id=${project_cnc1.id},${project_cnc2.id}`;
    searchparams += `&user_id=${user1.id},${user2.id}`;
    searchparams += `&ident_user_id=${user1.id}`;
    searchparams += `&colors=${colorsEncoded[0]},${colorsEncoded[1]}`;
    searchparams += `&spam=false&verifiable=true`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    let lifeCount = life().observations_count;
    let oakCount = redOak().observations_count;
    let count = oakCount + lifeCount;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      projectLabel_cnc2,
      projectLabel_cnc2,
      gridLabel_life_places_identifier,
      gridLabel_oaks_places_identifier,
    ]);
    expectNoRefresh(store);
    expectLifeOakTaxa(store, [lifeCount * 0.75, oakCount * 0.75]);
    expect_LA_SD_Place(store, [count * 0.6 * 0.75, count * 0.4 * 0.75]);
    expectUsers(store, [count * 0.45 * 0.75, 4537.5]);
    expectUser1Identifier(store);
    expectProjects(store, [count * 0.7 * 0.75, count * 0.3 * 0.75]);
    let expectedParams: ObservationsApiParams = {
      colors: `${colors[0]},${colors[1]}`,
      taxon_id: `${life().id},${redOak().id}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      user_id: `${user1.id},${user2.id}`,
      ident_user_id: `${user1.id}`,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(colors[1]);
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount * 0.75);
    expect(store.selectedTaxa[1].observations_count).toBe(oakCount * 0.75);
    expect(store.selectedPlaces[0].observations_count).toBe(count * 0.6 * 0.75);
    expect(store.selectedPlaces[1].observations_count).toBe(count * 0.4 * 0.75);
    expect(store.selectedProjects[0].observations_count).toBe(
      count * 0.7 * 0.75,
    );
    expect(store.selectedProjects[1].observations_count).toBe(
      count * 0.3 * 0.75,
    );
    expect(store.selectedUsers[0].observations_count).toBe(count * 0.45 * 0.75);
    expect(store.selectedUsers[1].observations_count).toBe(4537.5);
  });

  test("loads and renders resources and bounding box based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    colorsEncoded;

    let searchparams = `?taxon_id=${life().id},${redOak().id}`;
    searchparams += `&nelat=0&nelng=0&swlat=0&swlng=0`;
    searchparams += `&project_id=${project_cnc1.id},${project_cnc2.id}`;
    searchparams += `&user_id=${user1.id},${user2.id}`;
    searchparams += `&colors=${colorsEncoded[0]},${colorsEncoded[1]}`;
    searchparams += `&spam=false&verifiable=true`;
    let urlData = decodeAppUrl(searchparams);

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    let lifeCount = life().observations_count;
    let oakCount = redOak().observations_count;
    let count = oakCount + lifeCount;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeBBoxLabel,
      projectLabel_cnc2,
      projectLabel_cnc2,
      refreshBBoxLabel,
      gridLabel_life_bbox_resources,
      gridLabel_oaks_bbox_resources,
    ]);
    expectRefreshPlace(store, count);
    expectLifeOakTaxa(store, [lifeCount, oakCount]);
    expectProjects(store, [count * 0.7, count * 0.3]);
    expectUsers(store, [count * 0.45, count * 0.55]);

    let expectedParams: ObservationsApiParams = {
      ...defaultParams,
      colors: `${colors[0]},${colors[1]}`,
      taxon_id: `${life().id},${redOak().id}`,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      user_id: `${user1.id},${user2.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(colors[1]);
  });
});
