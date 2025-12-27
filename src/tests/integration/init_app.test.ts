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
  expectDefaultTaxaRecord,
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
  lifeBasic,
  expectNoProjects,
  expectNoUsers,
  expectNoTaxaIdentified,
  allTaxaIdentification,
  lifeIdentification,
  gridLabel_life_places_users,
  expect_LA_SD_Place_Identifications,
  redOakIdentification,
  expectUserIdentifiersIdentifications,
  expectDefaultTaxaRecordIdentification,
  expectNoUsersIdentifiers,
  expectNoTaxa,
  expectUser1Reviewer,
  gridLabel_allTaxaRecord_user1Reviewer,
  expectNoUnobservedUsers,
} from "../test_helpers.ts";
import type {
  IdentificationsApiParamsType,
  ObservationsApiParamsType,
} from "../../types/app";
import {
  allTaxaRecord,
  fieldsWithAny,
  IdentificationsApiFilterableNames,
  ObservationsApiFilterableNames,
} from "../../data/inat_data.ts";
import { iNatOrange } from "../../lib/map_colors_utils.ts";
import { initPopulateStore, initRenderMap } from "../../lib/init_app.ts";
import { mapStore } from "../../lib/store.ts";
import {
  validIdentificationsViews,
  validObservationsSubviews,
  validObservationsViews,
} from "../../data/app_data.ts";

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
  test("loads default taxa if no params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = ``;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectDefaultTaxaRecord(store);
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
    expect(store.record_type).toBe("observations");
    expect(store.currentView).toBe("observations_observations");
  });

  test.each([ObservationsApiFilterableNames])(
    "updates observationsApiParams with filterable params ",
    async (param) => {
      let store = structuredClone(mapStore);

      expectEmpytMap(store);

      let searchparams = `?${param}=true`;
      let urlData = decodeAppUrl(searchparams, "/");

      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      expect(leafletVisibleLayers(store)).toStrictEqual([
        basemapLabel_osm,
        gridLabel_allTaxaRecord,
      ]);
      expectNoPlaces(store);
      expectNoRefresh(store);
      expectDefaultTaxaRecord(store);

      let expectedParams: ObservationsApiParamsType = {
        ...defaultParams,
        colors: iNatOrange,
        taxon_id: allTaxaRecord.id.toString(),
        [param]: true,
      };
      expect(store.observationsApiParams).toStrictEqual(expectedParams);
      expect(store.color).toBe(iNatOrange);
    },
  );

  test("ignores invalid params ", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = "?boo=true&foo=any";
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectDefaultTaxaRecord(store);

    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders taxa data with verifiable and spam set to false", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&taxon_id=${life().id}&verifiable=false&spam=false`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);

    let expectedParams: ObservationsApiParamsType = {
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

    let searchparams = `?locale=en&taxon_id=${life().id}&verifiable=true&spam=true`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);

    let expectedParams: ObservationsApiParamsType = {
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

    let searchparams = `?locale=en&taxon_id=${life().id}`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);

    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      colors: colors[0],
      taxon_id: life().id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(colors[0]);
  });

  test.each(fieldsWithAny)(
    "loads and renders taxa data, ignore field set to any",
    async (field) => {
      let store = structuredClone(mapStore);

      expectEmpytMap(store);

      let searchparams = `?locale=en&taxon_id=${life().id}&${field}=any`;
      let urlData = decodeAppUrl(searchparams, "/");

      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      expect(leafletVisibleLayers(store)).toStrictEqual([
        basemapLabel_osm,
        gridLabel_life,
      ]);
      expectNoPlaces(store);
      expectNoRefresh(store);
      expectLifeTaxa(store);

      let expectedParams: ObservationsApiParamsType = {
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

    let searchparams = `?locale=en&taxon_id=${life().id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);

    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      colors: colors[0],
      taxon_id: life().id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(colors[0]);
  });

  test("adds page, order, order_by, and view to store", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&view=observations_identifiers&page=3&order=desc&order_by=id`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectDefaultTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      page: 3,
      order: "desc",
      order_by: "id",
    });
    expect(store.color).toBe(iNatOrange);
    expect(store.viewMetadata).toStrictEqual({
      ...structuredClone(mapStore.viewMetadata),
      observations_identifiers: {
        page: 3,
        order: "desc",
        order_by: "id",
      },
      name_order: "cs",
    });
    expect(store.currentView).toBe("observations_identifiers");
    expect(store.viewMetadata.observations_identifiers).toStrictEqual({
      page: 3,
      order: "desc",
      order_by: "id",
    });
  });

  test("adds locale to store", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=es`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectDefaultTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      locale: "es",
    });
    expect(store.color).toBe(iNatOrange);
  });

  test("adds name_order to store", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&name_order=sc`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectDefaultTaxaRecord(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
    });
    expect(store.color).toBe(iNatOrange);
    expect(store.viewMetadata.name_order).toBe("sc");
  });

  test("works with observation_iconic_taxon_id when it is one value ", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = "?observation_iconic_taxon_id=1&iconic_taxon_id=3";
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(store.observationsApiParams).toStrictEqual(defaultParams);
    expect(store.identificationsApiParams).toStrictEqual({
      observation_iconic_taxon_id: 1,
      iconic_taxon_id: 3,
      observation_taxon_id: allTaxa.id.toString(),
    });
  });

  test("works with iconic_taxon_id when it is multiple values ", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = "?observation_iconic_taxon_id=1,2&iconic_taxon_id=3,4";
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(store.observationsApiParams).toStrictEqual(defaultParams);
    expect(store.identificationsApiParams).toStrictEqual({
      observation_iconic_taxon_id: "1,2",
      iconic_taxon_id: "3,4",
      observation_taxon_id: allTaxa.id.toString(),
    });
  });
});

describe("initPopulateStore and initRenderMap resources", () => {
  test("loads and renders taxa data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectLifeTaxa(store);
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      colors: colors[0],
      taxon_id: life().id.toString(),
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(colors[0]);
  });

  test("loads and renders place data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&place_id=${losangeles.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");
    let allTaxaLACount = allTaxa.observations_count * 0.6;

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectLosAngelesPlace(store, allTaxaLACount);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectDefaultTaxaRecord(store, allTaxaLACount);
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders bounding box data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams =
      "?spam=false&verifiable=true&nelat=0&nelng=0&swlat=0&swlng=0";
    let urlData = decodeAppUrl(searchparams, "/");
    let allTaxaCount = allTaxa.observations_count;

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectRefreshPlace(store, allTaxaCount);
    expectNoProjects(store);
    expectDefaultTaxaRecord(store);
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeBBoxLabel,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders project data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&project_id=${project_cnc1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");
    let allTaxaProjectCount = allTaxa.observations_count * 0.7;

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectProject1(store, allTaxaProjectCount);
    expectDefaultTaxaRecord(store, allTaxaProjectCount);
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      project_id: project_cnc1.id.toString(),
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders user data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&user_id=${user1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");
    let allTaxaCount = allTaxa.observations_count;

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectDefaultTaxaRecord(store, allTaxaCount * 0.45);
    expectNoTaxaIdentified(store);
    expectUser1(store, allTaxaCount * 0.45);
    expectNoUsersIdentifiers(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      user_id: user1.id.toString(),
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders user identifier data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&ident_user_id=${user1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");
    let allTaxaCount = allTaxa.observations_count;

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectDefaultTaxaRecord(store, allTaxaCount * 0.75);
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectUser1Identifier(store, allTaxaCount * 0.75);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1Identifier,
    ]);

    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      ident_user_id: `${user1.id}`,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders unobserved by user data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&unobserved_by_user_id=${user1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");
    let allTaxaCount = allTaxa.observations_count;

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectDefaultTaxaRecord(store, allTaxaCount * 0.65);
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expectUser1UnobservedByUser(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1Unobserved,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      unobserved_by_user_id: user1.id,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders reviewer data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&viewer_id=${user1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectDefaultTaxaRecord(store);
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expectNoUnobservedUsers(store);
    expectUser1Reviewer(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1Reviewer,
    ]);
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      viewer_id: user1.id,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders resources and places based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let lifeCount = life().observations_count as number;
    let oakCount = redOak().observations_count as number;
    let count = oakCount + lifeCount;

    let searchparams = `?locale=en&taxon_id=${life().id},${redOak().id}`;
    searchparams += `&place_id=${losangeles.id},${sandiego.id}`;
    searchparams += `&project_id=${project_cnc1.id},${project_cnc2.id}`;
    searchparams += `&user_id=${user1.id},${user2.id}`;
    searchparams += `&ident_user_id=${user1.id}`;
    searchparams += `&colors=${colorsEncoded[0]},${colorsEncoded[1]}`;
    searchparams += `&spam=false&verifiable=true`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoRefresh(store);
    expect_LA_SD_Place(store, [count * 0.6 * 0.75, count * 0.4 * 0.75]);
    expectProjects(store, [count * 0.7 * 0.75, count * 0.3 * 0.75]);
    expectLifeOakTaxa(store, [lifeCount * 0.75, oakCount * 0.75]);
    expectNoTaxaIdentified(store);
    expectUsers(store, [
      Math.round(count * 0.45 * 0.75),
      Math.round(count * 0.55 * 0.75),
    ]);
    expectUser1Identifier(store, count * 0.75);
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
    let expectedParams: ObservationsApiParamsType = {
      ...defaultParams,
      colors: `${colors[0]},${colors[1]}`,
      taxon_id: `${life().id},${redOak().id}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      user_id: `${user1.id},${user2.id}`,
      ident_user_id: `${user1.id}`,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(colors[1]);
  });

  test("loads and renders resources and bounding box based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let lifeCount = life().observations_count as number;
    let oakCount = redOak().observations_count as number;
    let count = oakCount + lifeCount;

    let searchparams = `?locale=en&taxon_id=${life().id},${redOak().id}`;
    searchparams += `&nelat=0&nelng=0&swlat=0&swlng=0`;
    searchparams += `&project_id=${project_cnc1.id},${project_cnc2.id}`;
    searchparams += `&user_id=${user1.id},${user2.id}`;
    searchparams += `&colors=${colorsEncoded[0]},${colorsEncoded[1]}`;
    searchparams += `&spam=false&verifiable=true`;
    let urlData = decodeAppUrl(searchparams, "/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectProjects(store, [count * 0.7, count * 0.3]);
    expectLifeOakTaxa(store, [lifeCount, oakCount]);
    expectNoTaxaIdentified(store);
    expectUsers(store, [count * 0.45, count * 0.55]);
    expectNoUsersIdentifiers(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeBBoxLabel,
      projectLabel_cnc2,
      projectLabel_cnc2,
      refreshBBoxLabel,
      gridLabel_life_bbox_resources,
      gridLabel_oaks_bbox_resources,
    ]);
    let expectedParams: ObservationsApiParamsType = {
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
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe(colors[1]);
  });
});

describe("initPopulateStore and initRenderMap options with identifications", () => {
  test("loads default all taxa if no params in url", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    expectEmpytMap(store);

    let searchparams = ``;
    let urlData = decodeAppUrl(searchparams, "/identifications/");
    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectDefaultTaxaRecordIdentification(store);
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: allTaxa.id.toString(),
    });
    expect(store.color).toBe(allTaxaIdentification.color);
    expect(store.record_type).toBe("identifications");
    expect(store.currentView).toBe("identifications_observations");
  });

  test.each([IdentificationsApiFilterableNames])(
    "adds filterable params to identificationsApiParams",
    async (param) => {
      let store = structuredClone(mapStore);

      let searchparams = `?${param}=true`;
      let urlData = decodeAppUrl(searchparams, "/identifications/");
      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      expectNoPlaces(store);
      expectNoRefresh(store);
      expectNoProjects(store);
      expectDefaultTaxaRecordIdentification(store);
      expectNoTaxaIdentified(store);
      expectNoUsers(store);
      expectNoUsersIdentifiers(store);
      expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
      expect(store.identificationsApiParams).toStrictEqual({
        [param]: true,
        observation_taxon_id: allTaxa.id.toString(),
      });
      expect(store.color).toBe(iNatOrange);
    },
  );
});

describe("initPopulateStore and initRenderMap resources with identifications", () => {
  test("loads and renders taxa data based on url params", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    let life = lifeIdentification();

    expectEmpytMap(store);

    let searchparams = `?locale=en&observation_taxon_id=${lifeBasic.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectNoProjects(store);
    expect(store.selectedTaxa).toStrictEqual([life]);
    expect(Object.keys(store.taxaMapLayers)).toEqual([life.id.toString()]);
    expect(store.taxaMapLayers[life.id].length).toBe(4);
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: life.id.toString(),
    });
    expect(store.color).toBe(life.color);
  });

  test("loads and renders taxa identified data based on url params", async () => {
    let store = structuredClone(mapStore);
    store.record_type == "identifications";

    let life = lifeIdentification();
    delete life.color;

    expectEmpytMap(store);

    let searchparams = `?locale=en&taxon_id=${lifeBasic.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectNoTaxa(store);
    expect(store.selectedTaxaIdentified).toStrictEqual([life]);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      taxon_id: life.id.toString(),
    });
    expect(store.color).toBe("");
  });

  test("loads and renders places data based on url params", async () => {
    let store = structuredClone(mapStore);

    let placeA = structuredClone(losangeles);
    placeA.identifications_count =
      allTaxaIdentification.identifications_count * 0.6;

    expectEmpytMap(store);

    let searchparams = `?locale=en&place_id=${placeA.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect(store.selectedPlaces).toStrictEqual([placeA]);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectDefaultTaxaRecordIdentification(
      store,
      allTaxaIdentification.identifications_count * 0.6,
    );
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2: IdentificationsApiParamsType = {
      place_id: placeA.id.toString(),
      observation_taxon_id: allTaxa.id.toString(),
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(store.color).toBe(iNatOrange);
  });

  test("does not load bounding box data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams =
      "?spam=false&verifiable=true&nelat=0&nelng=0&swlat=0&swlng=0";
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectDefaultTaxaRecordIdentification(store);
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: allTaxaIdentification.id.toString(),
    });
    expect(store.color).toBe(iNatOrange);
  });

  test("does not load project data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&project_id=${project_cnc1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectDefaultTaxaRecordIdentification(store);
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: allTaxaIdentification.id.toString(),
    });
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders user data based on url params", async () => {
    let store = structuredClone(mapStore);

    let userA = structuredClone(user1);
    userA.identifications_count =
      allTaxaIdentification.identifications_count * 0.45;

    expectEmpytMap(store);

    let searchparams = `?locale=en&user_id=${userA.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectDefaultTaxaRecordIdentification(
      store,
      allTaxaIdentification.identifications_count * 0.45,
    );
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expect(store.selectedUsersIdentifiers).toStrictEqual([userA]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams2: IdentificationsApiParamsType = {
      user_id: userA.id.toString(),
      observation_taxon_id: allTaxa.id.toString(),
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams2);
    expect(store.color).toBe(iNatOrange);
  });

  test("does not load user identifier data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&ident_user_id=${user1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectDefaultTaxaRecordIdentification(store);
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: allTaxa.id.toString(),
    });
    expect(store.color).toBe(iNatOrange);
  });

  test("does not load unobserved by user data based on url params", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = `?locale=en&unobserved_by_user_id=${user1.id}&${defaultQuery}`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectDefaultTaxaRecordIdentification(store);
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    expect(store.identificationsApiParams).toStrictEqual({
      observation_taxon_id: allTaxa.id.toString(),
    });
    expect(store.color).toBe(iNatOrange);
  });

  test("loads and renders resources and places based on url params", async () => {
    let store = structuredClone(mapStore);

    let life = lifeIdentification();
    let count = life.identifications_count as number;
    let oak = redOakIdentification();
    delete oak.color;

    expectEmpytMap(store);

    let searchparams = `?locale=en&observation_taxon_id=${life.id}`;
    searchparams += `&taxon_id=${oak.id}`;
    searchparams += `&place_id=${losangeles.id},${sandiego.id}`;
    searchparams += `&user_id=${user1.id},${user2.id}`;
    searchparams += `&colors=${colorsEncoded[0]},${colorsEncoded[1]}`;
    searchparams += `&spam=false&verifiable=true`;
    let urlData = decodeAppUrl(searchparams, "/identifications/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expect_LA_SD_Place_Identifications(store, [count * 0.6, count * 0.4]);
    expectNoRefresh(store);
    expectNoProjects(store);
    expect(store.selectedTaxa).toStrictEqual([life]);
    expect(Object.keys(store.taxaMapLayers)).toEqual([life.id.toString()]);
    expect(store.taxaMapLayers[life.id].length).toBe(4);
    expect(store.selectedTaxaIdentified).toStrictEqual([
      { ...oak, identifications_count: count },
    ]);
    expectUserIdentifiersIdentifications(store, [
      Math.round(count * 0.45),
      Math.round(count * 0.55),
    ]);
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_life_places_users,
    ]);
    expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
    let expectedParams: ObservationsApiParamsType = {
      observation_taxon_id: `${life.id}`,
      taxon_id: `${oak.id}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      user_id: `${user1.id},${user2.id}`,
    };
    expect(store.identificationsApiParams).toStrictEqual(expectedParams);
    expect(store.color).toBe(life.color);
  });
});

describe("initPopulateStore and initRenderMap resources with about page", () => {
  test("sets record_type to about", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let searchparams = ``;
    let urlData = decodeAppUrl(searchparams, "/about/");

    await initPopulateStore(store, urlData);
    await initRenderMap(store);

    expectNoPlaces(store);
    expectNoRefresh(store);
    expectNoProjects(store);
    expectNoTaxa(store);
    expectNoTaxaIdentified(store);
    expectNoUsers(store);
    expectNoUsersIdentifiers(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
    });
    expect(store.identificationsApiParams).toStrictEqual({});
    expect(store.color).toBe("");
    expect(store.record_type).toBe("about");
    expect(store.currentView).toBeUndefined();
  });
});

describe("initPopulateStore and initRenderMap populates views and subviews", () => {
  test.each(validObservationsViews)(
    "adds observation view to store",
    async (view) => {
      let store = structuredClone(mapStore);

      expectEmpytMap(store);

      let searchparams = `?locale=en&view=${view}`;
      let urlData = decodeAppUrl(searchparams, "/");
      let subview =
        view === "observations_observations" ? { subview: "grid" } : {};

      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      expectNoPlaces(store);
      expectNoRefresh(store);
      expectNoProjects(store);
      expectDefaultTaxaRecord(store);
      expectNoTaxaIdentified(store);
      expectNoUsers(store);
      expectNoUsersIdentifiers(store);
      expect(store.observationsApiParams).toStrictEqual({
        ...defaultParams,
        colors: iNatOrange,
        taxon_id: allTaxa.id.toString(),
      });
      expect(store.identificationsApiParams).toStrictEqual({});
      expect(store.color).toBe(iNatOrange);
      expect(store.record_type).toBe("observations");
      expect(store.currentView).toBe(view);
      expect(store.viewMetadata[view]).toStrictEqual(subview);
    },
  );

  test.each(validIdentificationsViews)(
    "adds identifications view to store",
    async (view) => {
      let store = structuredClone(mapStore);

      expectEmpytMap(store);

      let searchparams = `?locale=en&view=${view}`;
      let urlData = decodeAppUrl(searchparams, "/identifications/");
      let subview =
        view === "identifications_observations" ? { subview: "grid" } : {};

      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      expectNoPlaces(store);
      expectNoRefresh(store);
      expectNoProjects(store);
      expectDefaultTaxaRecordIdentification(store);
      expectNoTaxaIdentified(store);
      expectNoUsers(store);
      expectNoUsersIdentifiers(store);
      expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
      expect(store.identificationsApiParams).toStrictEqual({
        observation_taxon_id: allTaxa.id.toString(),
      });
      expect(store.color).toBe(iNatOrange);
      expect(store.record_type).toBe("identifications");
      expect(store.currentView).toBe(view);
      expect(store.viewMetadata[view]).toStrictEqual(subview);
    },
  );

  test.each(validObservationsSubviews)(
    "adds observations view and subview to store",
    async (subview) => {
      let store = structuredClone(mapStore);

      expectEmpytMap(store);

      let searchparams = `?locale=en&view=observations_observations&subview=${subview}`;
      let urlData = decodeAppUrl(searchparams, "/");

      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      expectNoPlaces(store);
      expectNoRefresh(store);
      expectNoProjects(store);
      expectDefaultTaxaRecord(store);
      expectNoTaxaIdentified(store);
      expectNoUsers(store);
      expectNoUsersIdentifiers(store);
      expect(store.observationsApiParams).toStrictEqual({
        ...defaultParams,
        colors: iNatOrange,
        taxon_id: allTaxa.id.toString(),
      });
      expect(store.identificationsApiParams).toStrictEqual({});
      expect(store.color).toBe(iNatOrange);
      expect(store.currentView).toBe("observations_observations");
      expect(store.viewMetadata.observations_observations).toStrictEqual({
        subview: subview,
      });
    },
  );

  test.each(validObservationsSubviews)(
    "adds observations view and subview for identifications to store",
    async (subview) => {
      let store = structuredClone(mapStore);

      expectEmpytMap(store);

      let searchparams = `?locale=en&view=identifications_observations&subview=${subview}`;
      let urlData = decodeAppUrl(searchparams, "/identifications/");

      await initPopulateStore(store, urlData);
      await initRenderMap(store);

      expectNoPlaces(store);
      expectNoRefresh(store);
      expectNoProjects(store);
      expectDefaultTaxaRecordIdentification(store);
      expectNoTaxaIdentified(store);
      expectNoUsers(store);
      expectNoUsersIdentifiers(store);
      expect(store.observationsApiParams).toStrictEqual({ ...defaultParams });
      expect(store.identificationsApiParams).toStrictEqual({
        observation_taxon_id: allTaxa.id.toString(),
      });
      expect(store.color).toBe(iNatOrange);
      expect(store.currentView).toBe("identifications_observations");
      expect(store.viewMetadata.identifications_observations).toStrictEqual({
        subview: subview,
      });
    },
  );
});
