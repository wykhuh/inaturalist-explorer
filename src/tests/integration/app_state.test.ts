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

import {
  leafletVisibleLayers,
  refreshBoundingBox,
} from "../../lib/data_utils.ts";
import { placeSelectedHandler, removePlace } from "../../lib/search_places.ts";
import {
  projectSelectedHandler,
  removeProject,
} from "../../lib/search_projects.ts";
import { taxonSelectedHandler, removeTaxon } from "../../lib/search_taxa.ts";
import { userSelectedHandler, removeUser } from "../../lib/search_users.ts";
import {
  createMockServer,
  expectEmpytMap,
  expectLifeTaxa,
  expectLosAngelesPlace,
  expectNoPlaces,
  expectNoRefresh,
  expectOakTaxa,
  expectRefreshPlace,
  losangeles,
  sandiego,
  life,
  lifeBasic,
  redOak,
  redOakBasic,
  colors,
  placeLabel_la,
  placeLabel_sd,
  gridLabel_life,
  gridLabel_oaks,
  refreshBBoxLabel,
  basemapLabel_osm,
  gridLabel_allTaxaRecord,
  expectAllTaxaRecord,
  gridLabel_allTaxaRecord_la,
  gridLabel_allTaxaRecord_la_sd,
  gridLabel_allTaxaRecord_sd,
  expect_LA_SD_Place,
  expectSanDiegoPlace,
  colorsEncoded,
  expectLifeOakTaxa,
  project_cnc1,
  gridLabel_allTaxaRecord_project1,
  project_cnc2,
  gridLabel_allTaxaRecord_projects,
  expectNoProjects,
  expectProject1,
  expectProjects,
  user1,
  gridLabel_allTaxaRecord_user1,
  expectUser1,
  user2,
  gridLabel_allTaxaRecord_users,
  expectUsers,
  gridLabel_life_places_resources,
  gridLabel_oaks_places_resources,
  gridLabel_life_la_project1_user1,
  gridLabel_oak_la_project1_user1,
  gridLabel_life_la_sd_project1_user1,
  gridLabel_oak_la_sd_project1_user1,
  gridLabel_oak_la_sd_projects_user1,
  gridLabel_life_la_sd_projects_user1,
  allTaxa,
  defaultParams,
  defaultQuery,
  gridLabel_life_la,
  gridLabel_life_la_project1,
  gridLabel_life_places_projects_users,
  gridLabel_oaks_places_projects_users,
  roundCounts,
  expectUser1UnobservedByUser,
  expectUser1Identifier,
  gridLabel_life_places_identifier,
  gridLabel_oaks_places_identifier,
} from "../test_helpers.ts";
import { iNatOrange } from "../../lib/map_colors_utils.ts";
import { decodeAppUrl } from "../../lib/utils.ts";
import { initPopulateStore, initRenderMap } from "../../lib/init_app.ts";
import { mapStore } from "../../lib/store.ts";
import { userIdentifierSelectedHandler } from "../../lib/search_users_identifiers.ts";
import { unobservedByUserSelectedHandler } from "../../lib/search_unobserved.ts";

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

describe("taxonSelectedHandler", () => {
  test(`add red oak`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await taxonSelectedHandler(lifeBasic, "life", store);

    let lifeCount = life().observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);
    let expectedParams = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);
  });

  test(`add life; add red oak`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

    let oakCount = redOak().observations_count;
    let lifeCount = life().observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);
    expectNoProjects(store);
    let expectedParams1 = {
      taxon_id: life().id.toString(),
      colors: colors[0],
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);

    await taxonSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeOakTaxa(store);
    expectNoProjects(store);
    let expectedParams2 = {
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);
    expect(store.selectedTaxa[1].observations_count).toBe(oakCount);
  });
});

describe("placeSelectedHandler", () => {
  test(`add los angeles`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);

    await placeSelectedHandler(losangeles, "los", store);

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
    expectNoProjects(store);
    let expectedParams = {
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaLACount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaLACount);
  });

  test(`add los angeles; add san diego`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await placeSelectedHandler(losangeles, "los", store);

    let allTaxaCount = allTaxa.observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectNoRefresh(store);
    expectAllTaxaRecord(store, allTaxaCount * 0.6);
    expectLosAngelesPlace(store, allTaxaCount * 0.6);
    expectNoProjects(store);
    let expectedParams1 = {
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount * 0.6);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount * 0.6);

    await placeSelectedHandler(sandiego, "san", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_allTaxaRecord_la_sd,
    ]);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expect_LA_SD_Place(store, [allTaxaCount * 0.6, allTaxaCount * 0.4]);
    expectNoProjects(store);
    let expectedParams2 = {
      colors: iNatOrange,
      place_id: `${losangeles.id},${sandiego.id}`,
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id},${sandiego.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount * 0.6);
    expect(store.selectedPlaces[1].observations_count).toBe(allTaxaCount * 0.4);
  });
});

describe("refreshBoundingBox", () => {
  test(`refresh map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await refreshBoundingBox(store);

    let allTaxaCount = allTaxa.observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
    expectRefreshPlace(store, allTaxaCount);
    expectNoProjects(store);
    let expectedParams = {
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);

    expect(window.location.search).toBe(
      `?${defaultQuery}&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount);
  });

  test(`refresh map; refresh map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await refreshBoundingBox(store);

    let allTaxaCount = allTaxa.observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
    expectRefreshPlace(store, allTaxaCount);
    expectNoProjects(store);
    let expectedParams = {
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    let refreshlayer1 = store.refreshMap.layer;
    expect(window.location.search).toBe(
      `?${defaultQuery}&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount);

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
    expectRefreshPlace(store, allTaxaCount);
    expectNoProjects(store);
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    let refreshlayer2 = store.refreshMap.layer;
    expect(refreshlayer1).not.toStrictEqual(refreshlayer2);
    expect(window.location.search).toBe(
      `?${defaultQuery}&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount);
  });
});

describe("projectSelectedHandler", () => {
  test("add project", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await projectSelectedHandler(project_cnc1, "city", store);

    let allTaxaCount = allTaxa.observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store, allTaxaCount * 0.7);
    expectProject1(store);
    let expectedParams = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      project_id: project_cnc1.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount * 0.7);
    expect(store.selectedProjects[0].observations_count).toBe(
      allTaxaCount * 0.7,
    );
  });

  test("add project; add project", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await projectSelectedHandler(project_cnc1, "city", store);

    let allTaxaCount = allTaxa.observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store, allTaxaCount * 0.7);
    expectProject1(store);
    let expectedParams = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      project_id: project_cnc1.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&${defaultQuery}`,
    );

    await projectSelectedHandler(project_cnc2, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_projects,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expectProjects(store);
    let expectedParams2 = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id},${project_cnc2.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedProjects[0].observations_count).toBe(
      allTaxaCount * 0.7,
    );
    expect(store.selectedProjects[1].observations_count).toBe(
      allTaxaCount * 0.3,
    );
  });
});

describe("userSelectedHandler", () => {
  test("add user", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await userSelectedHandler(user1, "user", store);

    let allTaxaCount = allTaxa.observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store, allTaxaCount * 0.45);
    expectUser1(store);
    let expectedParams = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      user_id: user1.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(`?user_id=${user1.id}&${defaultQuery}`);
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount * 0.45);
    expect(store.selectedUsers[0].observations_count).toBe(allTaxaCount * 0.45);
  });

  test("add user; add user", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let allTaxaCount = allTaxa.observations_count;
    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await userSelectedHandler(user1, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store, allTaxaCount * 0.45);
    expectUser1(store);
    let expectedParams = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      user_id: user1.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(`?user_id=${user1.id}&${defaultQuery}`);

    await userSelectedHandler(user2, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_users,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expectUsers(store);
    let expectedParams2 = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      user_id: `${user1.id},${user2.id}`,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?user_id=${user1.id},${user2.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedUsers[0].observations_count).toBe(allTaxaCount * 0.45);
    expect(store.selectedUsers[1].observations_count).toBe(allTaxaCount * 0.55);
  });
});

describe("combos", () => {
  test(`add taxon; refresh map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await taxonSelectedHandler(redOakBasic, "red", store);

    let oakCount = redOak().observations_count;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_oaks,
    ]);
    expectOakTaxa(store, colors[0]);
    let params1 = {
      colors: colors[0],
      taxon_id: redOak(colors[0]).id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${redOak().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(oakCount);

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_oaks,
    ]);
    expectOakTaxa(store, colors[0]);
    expectRefreshPlace(store, oakCount);
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: redOak(colors[0]).id.toString(),
      colors: colors[0],
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      ...defaultParams,
    });

    expect(window.location.search).toBe(
      `?taxon_id=${redOak().id}&colors=${colorsEncoded[0]}&${defaultQuery}` +
        `&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(oakCount);
    expect(store.selectedPlaces[0].observations_count).toBe(oakCount);
  });

  test(`add place; refresh map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await placeSelectedHandler(losangeles, "los", store);

    let allTaxaCount = allTaxa.observations_count;
    let allTaxaLACount = allTaxaCount * 0.6;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectAllTaxaRecord(store, allTaxaLACount);
    expectLosAngelesPlace(store, allTaxaLACount);
    let params = {
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaLACount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaLACount);

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
    expectRefreshPlace(store, allTaxaCount, "LA");
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      nelat: 34.30714385628804,
      nelng: -118.12500000000001,
      swlat: 34.30714385628804,
      swlng: -118.12500000000001,
      ...defaultParams,
    });
    expect(window.location.search).toBe(
      `?${defaultQuery}&nelat=34.30714385628804&nelng=-118.12500000000001&swlat=34.30714385628804&swlng=-118.12500000000001`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount);
  });

  test(`add project; refresh map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await projectSelectedHandler(project_cnc1, "city", store);

    let allTaxaProjectCount = allTaxa.observations_count * 0.7;
    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectAllTaxaRecord(store, allTaxaProjectCount);
    expectProject1(store);
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      project_id: project_cnc1.id.toString(),
      ...defaultParams,
    });
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaProjectCount);
    expect(store.selectedProjects[0].observations_count).toBe(
      allTaxaProjectCount,
    );

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectAllTaxaRecord(store, allTaxaProjectCount);
    expectProject1(store);
    expectRefreshPlace(store, allTaxaProjectCount);
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      project_id: project_cnc1.id.toString(),
      ...defaultParams,
    });
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&${defaultQuery}` +
        `&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaProjectCount);
    expect(store.selectedProjects[0].observations_count).toBe(
      allTaxaProjectCount,
    );
  });

  test(`add user; refresh map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let allTaxaCount = allTaxa.observations_count;
    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await userSelectedHandler(user1, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1,
    ]);
    expectAllTaxaRecord(store, allTaxaCount * 0.45);
    expectUser1(store);
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      user_id: user1.id.toString(),
      ...defaultParams,
    });
    expect(window.location.search).toBe(`?user_id=${user1.id}&${defaultQuery}`);
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount * 0.45);

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord_user1,
    ]);
    expectAllTaxaRecord(store, allTaxaCount * 0.45);
    expectUser1(store);
    expectRefreshPlace(store, allTaxaCount * 0.45);
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      user_id: user1.id.toString(),
      ...defaultParams,
    });

    expect(window.location.search).toBe(
      `?user_id=${user1.id}&${defaultQuery}` +
        `&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount * 0.45);
    expect(store.selectedPlaces[0].observations_count).toBe(
      allTaxaCount * 0.45,
    );
  });

  test(`add place; refresh map; add place`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let allTaxaCount = allTaxa.observations_count;
    let allTaxaLACount = allTaxaCount * 0.6;
    let allTaxaSDCount = allTaxaCount * 0.4;
    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectAllTaxaRecord(store, allTaxaLACount);
    expectLosAngelesPlace(store, allTaxaLACount);
    let params = {
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaLACount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaLACount);

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
    expectRefreshPlace(store, allTaxaCount, "LA");
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      nelat: 34.30714385628804,
      nelng: -118.12500000000001,
      swlat: 34.30714385628804,
      swlng: -118.12500000000001,
      ...defaultParams,
    });
    expect(window.location.search).toBe(
      `?${defaultQuery}&nelat=34.30714385628804&nelng=-118.12500000000001&swlat=34.30714385628804&swlng=-118.12500000000001`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount);

    await placeSelectedHandler(sandiego, "san", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_allTaxaRecord_sd,
    ]);
    expectAllTaxaRecord(store, allTaxaSDCount);
    expectSanDiegoPlace(store, allTaxaSDCount);
    let params2 = {
      colors: iNatOrange,
      place_id: sandiego.id.toString(),
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params2);

    expect(window.location.search).toBe(
      `?place_id=${sandiego.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaSDCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaSDCount);
  });

  test("add taxon x 2; add place x 2; add project x 2; add user x 2", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);
    let count1 = life().observations_count;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store, count1);
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      verifiable: true,
      spam: false,
      locale: "en",
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await placeSelectedHandler(losangeles, "los", store);
    let count2 = count1 * 0.6;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store, count2);
    expectLosAngelesPlace(store, count2);
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      place_id: losangeles.id.toString(),
      verifiable: true,
      spam: false,
      locale: "en",
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}&colors=${colorsEncoded[0]}` +
        `&verifiable=true&spam=false`,
    );

    await projectSelectedHandler(project_cnc1, "city", store);
    let count3 = count2 * 0.7;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_life_la_project1,
    ]);
    expectLifeTaxa(store, count3);
    expectLosAngelesPlace(store, count3);
    expectProject1(store, count3);
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      place_id: losangeles.id.toString(),
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
      locale: "en",
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}&project_id=${project_cnc1.id}` +
        `&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await userSelectedHandler(user1, "user", store);
    let count4 = count3 * 0.45;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_life_la_project1_user1,
    ]);
    expectLifeTaxa(store, count4);
    expectLosAngelesPlace(store, count4);
    expectProject1(store, count4);
    expectUser1(store, count4);
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      place_id: losangeles.id.toString(),
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
      user_id: user1.id.toString(),
      locale: "en",
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}&project_id=${project_cnc1.id}` +
        `&user_id=${user1.id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await taxonSelectedHandler(redOakBasic, "red", store);
    let oakCount = redOak().observations_count;
    let lifeCount = life().observations_count;
    let factor5 = 0.6 * 0.7 * 0.45;
    let count5 = (oakCount + lifeCount) * factor5;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      gridLabel_life_la_project1_user1,
      gridLabel_oak_la_project1_user1,
    ]);
    expectLifeOakTaxa(store, [lifeCount * factor5, oakCount * factor5]);
    expectLosAngelesPlace(store, count5);
    expectProject1(store, count5);
    expectUser1(store, count5);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      place_id: `${losangeles.id}`,
      project_id: `${project_cnc1.id}`,
      user_id: `${user1.id}`,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id}` +
        `&project_id=${project_cnc1.id}` +
        `&user_id=${user1.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}`,
    );

    await placeSelectedHandler(sandiego, "san", store);
    let factor6 = 0.7 * 0.45;
    let count6 = (oakCount + lifeCount) * factor6;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_life_la_sd_project1_user1,
      gridLabel_oak_la_sd_project1_user1,
    ]);
    expectLifeOakTaxa(store, [lifeCount * factor6, oakCount * factor6]);
    expect_LA_SD_Place(store, [count6 * 0.6, count6 * 0.4]);
    expectProject1(store);
    expectUser1(store);
    expect(store.observationsApiParams).toStrictEqual({
      ...defaultParams,
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      project_id: `${project_cnc1.id}`,
      user_id: `${user1.id}`,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id}` +
        `&user_id=${user1.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}`,
    );
    expect(store.selectedProjects[0].observations_count).toBeCloseTo(count6);
    expect(store.selectedUsers[0].observations_count).toBeCloseTo(count6);

    await projectSelectedHandler(project_cnc2, "city", store);
    let factor7 = 0.45;
    let count7 = (oakCount + lifeCount) * factor7;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_life_la_sd_projects_user1,
      gridLabel_oak_la_sd_projects_user1,
    ]);
    expectLifeOakTaxa(store, [lifeCount * factor7, oakCount * factor7]);
    expect_LA_SD_Place(store, [count7 * 0.6, count7 * 0.4]);
    expectProjects(store);
    expectUser1(store, count7);
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      user_id: `${user1.id}`,
      ...defaultParams,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id},${project_cnc2.id}` +
        `&user_id=${user1.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}`,
    );
    expect(store.selectedProjects[0].observations_count).toBeCloseTo(
      count7 * 0.7,
    );
    expect(store.selectedProjects[1].observations_count).toBeCloseTo(
      count7 * 0.3,
    );

    await userSelectedHandler(user2, "user", store);
    let count8 = lifeCount + oakCount;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_life_places_projects_users,
      gridLabel_oaks_places_projects_users,
    ]);
    expectLifeOakTaxa(store, [lifeCount, oakCount]);
    expect_LA_SD_Place(store, [count8 * 0.6, count8 * 0.4]);
    expectProjects(store, [count8 * 0.7, count8 * 0.3]);
    expectUsers(store, [count8 * 0.45, count8 * 0.55]);
    let params8 = {
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      user_id: `${user1.id},${user2.id}`,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params8);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id},${project_cnc2.id}` +
        `&user_id=${user1.id},${user2.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}`,
    );

    await userIdentifierSelectedHandler(user1, "user", store);
    let factor9 = 0.75;
    let count9 = (lifeCount + oakCount) * factor9;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_life_places_identifier,
      gridLabel_oaks_places_identifier,
    ]);
    expectLifeOakTaxa(store, [lifeCount * factor9, oakCount * factor9]);
    expect_LA_SD_Place(store, [count9 * 0.6, count9 * 0.4]);
    expectProjects(store);
    expectUsers(store, [count9 * 0.45, count9 * 0.55]);
    expectUser1Identifier(store, count9 * 0.45);
    let params9 = {
      ...defaultParams,
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      user_id: `${user1.id},${user2.id}`,
      ident_user_id: user1.id,
    };
    expect(store.observationsApiParams).toStrictEqual(params9);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id},${project_cnc2.id}` +
        `&user_id=${user1.id},${user2.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}` +
        `&ident_user_id=${user1.id}`,
    );
    expect(store.selectedProjects[0].observations_count).toBeCloseTo(
      count9 * 0.7,
    );
    expect(store.selectedProjects[1].observations_count).toBeCloseTo(
      count9 * 0.3,
    );

    await unobservedByUserSelectedHandler(user1, "user", store);
    let factor10 = 0.75 * 0.65;
    let count10 = (lifeCount + oakCount) * factor10;

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_la,
      placeLabel_sd,
      placeLabel_sd,
      gridLabel_life_places_resources,
      gridLabel_oaks_places_resources,
    ]);
    expectLifeOakTaxa(store, [
      lifeCount * factor10,
      roundCounts(oakCount * factor10),
    ]);
    expect_LA_SD_Place(store, [
      roundCounts(count10 * 0.6),
      roundCounts(count10 * 0.4),
    ]);
    expectProjects(store);
    expectUsers(store);
    expectUser1Identifier(store);
    expectUser1UnobservedByUser(store);
    let params10 = {
      ...defaultParams,
      taxon_id: `${life().id},${redOak().id}`,
      colors: `${colors[0]},${colors[1]}`,
      place_id: `${losangeles.id},${sandiego.id}`,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      user_id: `${user1.id},${user2.id}`,
      ident_user_id: user1.id,
      unobserved_by_user_id: user1.id,
    };
    expect(store.observationsApiParams).toStrictEqual(params10);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id},${project_cnc2.id}` +
        `&user_id=${user1.id},${user2.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}` +
        `&ident_user_id=${user1.id}` +
        `&unobserved_by_user_id=${user1.id}`,
    );
    expect(store.selectedProjects[0].observations_count).toBeCloseTo(
      count10 * 0.7,
    );
    expect(store.selectedProjects[1].observations_count).toBeCloseTo(
      count10 * 0.3,
    );
    expect(store.selectedUsers[0].observations_count).toBeCloseTo(
      count10 * 0.45,
    );
    expect(store.selectedUsers[1].observations_count).toBeCloseTo(
      count10 * 0.55,
    );
  });
});

describe("removePlace", () => {
  test("add place; remove place", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    let allTaxaCount = allTaxa.observations_count;
    let allTaxaLACount = allTaxaCount * 0.6;
    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await placeSelectedHandler(losangeles, "los", store);

    let params1 = {
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaLACount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaLACount);

    await removePlace(losangeles.id, store);

    let params2 = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe("");
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
  });

  test("add place; add place; remove place", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await placeSelectedHandler(losangeles, "los", store);

    let allTaxaCount = allTaxa.observations_count;
    let allTaxaLACount = allTaxaCount * 0.6;
    let allTaxaSDCount = allTaxaCount * 0.4;
    let params1 = {
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaLACount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaLACount);

    await placeSelectedHandler(sandiego, "san", store);

    let params2 = {
      colors: iNatOrange,
      place_id: `${losangeles.id},${sandiego.id}`,
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id},${sandiego.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaLACount);
    expect(store.selectedPlaces[1].observations_count).toBe(allTaxaSDCount);

    await removePlace(losangeles.id, store);

    let params3 = {
      colors: iNatOrange,
      place_id: sandiego.id.toString(),
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params3);
    expect(window.location.search).toBe(
      `?place_id=${sandiego.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaSDCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaSDCount);
  });

  test("add refresh bounding box; remove place", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await refreshBoundingBox(store);

    let allTaxaCount = allTaxa.observations_count;
    expect(store.observationsApiParams).toStrictEqual({
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      taxon_id: allTaxa.id.toString(),
      colors: iNatOrange,
      ...defaultParams,
    });
    expect(window.location.search).toBe(
      `?${defaultQuery}&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaCount);

    await removePlace(0, store);

    let params2 = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe("");
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
  });

  test("add taxon; add place; remove place", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await taxonSelectedHandler(lifeBasic, "life", store);

    let lifeCount = life().observations_count;
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      ...defaultParams,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);

    await placeSelectedHandler(losangeles, "los", store);

    let params1 = {
      colors: colors[0],
      place_id: losangeles.id.toString(),
      taxon_id: life().id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}` +
        `&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );
    expectLosAngelesPlace(store, lifeCount * 0.6);
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount * 0.6);
    expect(store.selectedPlaces[0].observations_count).toBe(lifeCount * 0.6);

    await removePlace(losangeles.id, store);

    let params2 = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);
  });

  test("add taxon; add refresh; remove place", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await taxonSelectedHandler(lifeBasic, "life", store);

    let lifeCount = life().observations_count;
    expect(store.observationsApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      ...defaultParams,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);

    await refreshBoundingBox(store);

    let params1 = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}` +
        `&${defaultQuery}&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);
    expect(store.selectedPlaces[0].observations_count).toBe(lifeCount);

    await removePlace(0, store);

    let params2 = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount);
  });
});

describe("removeTaxon", () => {
  test("add taxon; remove taxon", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await taxonSelectedHandler(lifeBasic, "life", store);

    let params1 = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );

    await removeTaxon(life().id, store);

    let params2 = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe("");
  });

  test("add taxon; add taxon; remove first taxon", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await taxonSelectedHandler(lifeBasic, "life", store);

    let params1 = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );

    await taxonSelectedHandler(redOakBasic, "red", store);

    let params2 = {
      colors: `${colors[0]},${colors[1]}`,
      taxon_id: `${life().id},${redOak().id}`,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&${defaultQuery}`,
    );

    await removeTaxon(lifeBasic.id, store);

    let params3 = {
      colors: colors[1],
      taxon_id: redOak().id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params3);

    expect(window.location.search).toBe(
      `?taxon_id=${redOak().id}&colors=${colorsEncoded[1]}&${defaultQuery}`,
    );
  });

  test("add taxon; add place; remove taxon", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await taxonSelectedHandler(lifeBasic, "life", store);

    let lifeCount = life().observations_count;
    let allTaxaCount = allTaxa.observations_count;
    let allTaxaLACount = allTaxaCount * 0.6;
    let params1 = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );

    await placeSelectedHandler(losangeles, "los", store);

    let params2 = {
      colors: colors[0],
      place_id: losangeles.id.toString(),
      taxon_id: life().id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}` +
        `&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(lifeCount * 0.6);
    expect(store.selectedPlaces[0].observations_count).toBe(lifeCount * 0.6);

    await removeTaxon(life().id, store);

    let params3 = {
      place_id: losangeles.id.toString(),
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params3);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}` + `&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaLACount);
    expect(store.selectedPlaces[0].observations_count).toBe(allTaxaLACount);
  });

  test("add taxon; add refresh; remove taxon", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await taxonSelectedHandler(lifeBasic, "life", store);

    let params1 = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&${defaultQuery}`,
    );

    await removeTaxon(life().id, store);

    let params2 = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe("");
  });
});

describe("removeProject", () => {
  test("add project; remove project", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await projectSelectedHandler(project_cnc1, "city", store);

    let allTaxaCount = allTaxa.observations_count;
    let expectedParams = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      project_id: project_cnc1.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount * 0.7);
    expect(store.selectedProjects[0].observations_count).toBe(
      allTaxaCount * 0.7,
    );

    await removeProject(project_cnc1.id, store);

    let expectedParams2 = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe("");
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
  });

  test("add project; add project; remove project", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await projectSelectedHandler(project_cnc1, "city", store);

    let allTaxaCount = allTaxa.observations_count;
    let expectedParams = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      project_id: project_cnc1.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount * 0.7);
    expect(store.selectedProjects[0].observations_count).toBe(
      allTaxaCount * 0.7,
    );

    await projectSelectedHandler(project_cnc2, "city", store);

    let expectedParams2 = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id},${project_cnc2.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount);
    expect(store.selectedProjects[0].observations_count).toBe(
      allTaxaCount * 0.7,
    );
    expect(store.selectedProjects[1].observations_count).toBe(
      allTaxaCount * 0.3,
    );

    await removeProject(project_cnc1.id, store);

    let expectedParams3 = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      project_id: `${project_cnc2.id}`,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc2.id}&${defaultQuery}`,
    );
    expect(store.selectedTaxa[0].observations_count).toBe(allTaxaCount * 0.3);
    expect(store.selectedProjects[0].observations_count).toBe(
      allTaxaCount * 0.3,
    );
  });
});

describe("removeUser", () => {
  test("add user; remove user", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await userSelectedHandler(user1, "user", store);

    let expectedParams = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      user_id: user1.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(`?user_id=${user1.id}&${defaultQuery}`);

    await removeUser(user1.id, store);

    let expectedParams2 = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe("");
  });

  test("add user; add user; remove user", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await userSelectedHandler(user1, "user", store);

    let expectedParams = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      user_id: `${user1.id}`,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(`?user_id=${user1.id}&${defaultQuery}`);

    await userSelectedHandler(user2, "user", store);

    let expectedParams2 = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      user_id: `${user1.id},${user2.id}`,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?user_id=${user1.id},${user2.id}&${defaultQuery}`,
    );

    await removeUser(user1.id, store);

    let expectedParams3 = {
      colors: iNatOrange,
      taxon_id: allTaxa.id.toString(),
      user_id: `${user2.id}`,
      ...defaultParams,
    };
    expect(store.observationsApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(`?user_id=${user2.id}&${defaultQuery}`);
  });
});
