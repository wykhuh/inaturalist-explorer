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
  gridLabel_life_la,
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
  gridLabel_life_la_project1,
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
  addResources,
} from "../test_helpers.ts";
import { allTaxaRecord } from "../../data/inat_data.ts";
import { iNatOrange } from "../../lib/map_colors_utils.ts";
import { decodeAppUrl } from "../../lib/utils.ts";
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

describe("taxonSelectedHandler", () => {
  test(`add red oak`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await taxonSelectedHandler(lifeBasic, "life", store);

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
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );
  });

  test(`add life; add red oak`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await taxonSelectedHandler(lifeBasic, "life", store);

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
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await taxonSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expect(store.selectedTaxa).toStrictEqual([life(), redOak()]);
    expectNoProjects(store);
    expect(Object.keys(store.taxaMapLayers)).toEqual([
      life().id.toString(),
      redOak().id.toString(),
    ]);
    expect(store.taxaMapLayers[life().id].length).toBe(4);
    expect(store.taxaMapLayers[redOak().id].length).toBe(4);
    let expectedParams2 = {
      taxon_id: redOakBasic.id.toString(),
      colors: colors[1],
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&verifiable=true&spam=false`,
    );
  });
});

describe("placeSelectedHandler", () => {
  test(`add los angeles`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);

    expectNoRefresh(store);

    expectAllTaxaRecord(store);

    expectLosAngelesPlace(store);
    expectNoProjects(store);
    let expectedParams = {
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxaRecord.id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&verifiable=true&spam=false`,
    );
  });

  test(`add los angeles; add san diego`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expectLosAngelesPlace(store);
    expectNoProjects(store);
    let expectedParams1 = {
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxaRecord.id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams1);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&verifiable=true&spam=false`,
    );

    await placeSelectedHandler(sandiego, "san", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_sd,
      gridLabel_allTaxaRecord_la_sd,
    ]);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expect_LA_SD_Place(store);
    expectNoProjects(store);
    let expectedParams2 = {
      colors: iNatOrange,
      place_id: `${losangeles.id},${sandiego.id}`,
      taxon_id: allTaxaRecord.id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id},${sandiego.id}&verifiable=true&spam=false`,
    );
  });
});

describe("refreshBoundingBox", () => {
  test(`refresh map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
    expectRefreshPlace(store);
    expectNoProjects(store);
    let expectedParams = {
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      verifiable: true,
      spam: false,
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);

    expect(window.location.search).toBe(
      `?verifiable=true&spam=false&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
  });

  test(`refresh map; refresh map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
    expectRefreshPlace(store);
    expectNoProjects(store);
    let expectedParams = {
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      verifiable: true,
      spam: false,
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
    let refreshlayer1 = store.refreshMap.layer;
    expect(window.location.search).toBe(
      `?verifiable=true&spam=false&nelat=0&nelng=0&swlat=0&swlng=0`,
    );

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
    expectRefreshPlace(store);
    expectNoProjects(store);
    expect(store.inatApiParams).toStrictEqual(expectedParams);
    let refreshlayer2 = store.refreshMap.layer;
    expect(refreshlayer1).not.toStrictEqual(refreshlayer2);

    expect(window.location.search).toBe(
      `?verifiable=true&spam=false&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
  });
});

describe("projectSelectedHandler", () => {
  test("add project", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expectProject1(store);
    let expectedParams = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&verifiable=true&spam=false`,
    );
  });

  test("add project; add project", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expectProject1(store);
    let expectedParams = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&verifiable=true&spam=false`,
    );

    await projectSelectedHandler(project_cnc2, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_projects,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expect(store.selectedProjects).toStrictEqual([project_cnc1, project_cnc2]);
    let expectedParams2 = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id},${project_cnc2.id}&verifiable=true&spam=false`,
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expectUser1(store);
    let expectedParams = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      user_id: user1.id.toString(),
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?user_id=${user1.id}&verifiable=true&spam=false`,
    );
  });

  test("add user; add user", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await userSelectedHandler(user1, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expectUser1(store);
    let expectedParams = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      user_id: user1.id.toString(),
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?user_id=${user1.id}&verifiable=true&spam=false`,
    );

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
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      user_id: `${user1.id},${user2.id}`,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?user_id=${user1.id},${user2.id}&verifiable=true&spam=false`,
    );
  });
});

describe("combos", () => {
  test(`add taxon; refresh map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await taxonSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_oaks,
    ]);
    expectOakTaxa(store, colors[0]);
    let params1 = {
      colors: colors[0],
      taxon_id: redOak(colors[0]).id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${redOak().id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_oaks,
    ]);
    expectOakTaxa(store, colors[0]);
    expectRefreshPlace(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: redOak(colors[0]).id.toString(),
      colors: colors[0],
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      spam: false,
      verifiable: true,
    });

    expect(window.location.search).toBe(
      `?taxon_id=${redOak().id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
  });

  test(`add place; refresh map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectAllTaxaRecord(store);
    expectLosAngelesPlace(store);
    let params = {
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxaRecord.id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&verifiable=true&spam=false`,
    );

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
    expectRefreshPlace(store, "LA");
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
      nelat: 34.30714385628804,
      nelng: -118.12500000000001,
      swlat: 34.30714385628804,
      swlng: -118.12500000000001,
      verifiable: true,
      spam: false,
    });
    expect(window.location.search).toBe(
      `?verifiable=true&spam=false&nelat=34.30714385628804&nelng=-118.12500000000001&swlat=34.30714385628804&swlng=-118.12500000000001`,
    );
  });

  test(`add project; refresh map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectAllTaxaRecord(store);
    expectProject1(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
    });
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&verifiable=true&spam=false`,
    );

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectAllTaxaRecord(store);
    expectProject1(store);
    expectRefreshPlace(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
    });

    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&verifiable=true&spam=false` +
        `&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
  });

  test(`add user; refresh map;`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await userSelectedHandler(user1, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_user1,
    ]);
    expectAllTaxaRecord(store);
    expectUser1(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
      verifiable: true,
      spam: false,
      user_id: user1.id.toString(),
    });
    expect(window.location.search).toBe(
      `?user_id=${user1.id}&verifiable=true&spam=false`,
    );

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord_user1,
    ]);
    expectAllTaxaRecord(store);
    expectUser1(store);
    expectRefreshPlace(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      verifiable: true,
      spam: false,
      user_id: user1.id.toString(),
    });

    expect(window.location.search).toBe(
      `?user_id=${user1.id}&verifiable=true&spam=false` +
        `&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
  });

  test(`add place; refresh map; add place`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectAllTaxaRecord(store);
    expectLosAngelesPlace(store);
    let params = {
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxaRecord.id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&verifiable=true&spam=false`,
    );

    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
    expectRefreshPlace(store, "LA");
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
      nelat: 34.30714385628804,
      nelng: -118.12500000000001,
      swlat: 34.30714385628804,
      swlng: -118.12500000000001,
      verifiable: true,
      spam: false,
    });
    expect(window.location.search).toBe(
      `?verifiable=true&spam=false&nelat=34.30714385628804&nelng=-118.12500000000001&swlat=34.30714385628804&swlng=-118.12500000000001`,
    );

    await placeSelectedHandler(sandiego, "san", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_sd,
      gridLabel_allTaxaRecord_sd,
    ]);
    expectAllTaxaRecord(store);
    expectSanDiegoPlace(store);
    let params2 = {
      colors: iNatOrange,
      place_id: sandiego.id.toString(),
      taxon_id: allTaxaRecord.id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params2);

    expect(window.location.search).toBe(
      `?place_id=${sandiego.id}&verifiable=true&spam=false`,
    );
  });

  test("add taxon x 2; add place x 2; add project x 2; add user x 2", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await addResources(store);

    await taxonSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la_project1_user1,
      gridLabel_oak_la_project1_user1,
    ]);
    expectLifeOakTaxa(store);
    expectLosAngelesPlace(store);
    expectProject1(store);
    expectUser1(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: `${redOak().id}`,
      colors: colors[1],
      place_id: `${losangeles.id}`,
      verifiable: true,
      spam: false,
      project_id: `${project_cnc1.id}`,
      user_id: `${user1.id}`,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id}` +
        `&project_id=${project_cnc1.id}` +
        `&user_id=${user1.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&verifiable=true&spam=false`,
    );

    await placeSelectedHandler(sandiego, "san", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_sd,
      gridLabel_life_la_sd_project1_user1,
      gridLabel_oak_la_sd_project1_user1,
    ]);
    expectLifeOakTaxa(store);
    expect_LA_SD_Place(store);
    expectProject1(store);
    expectUser1(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: `${redOak().id}`,
      colors: colors[1],
      place_id: `${losangeles.id},${sandiego.id}`,
      verifiable: true,
      spam: false,
      project_id: `${project_cnc1.id}`,
      user_id: `${user1.id}`,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id}` +
        `&user_id=${user1.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&verifiable=true&spam=false`,
    );

    await projectSelectedHandler(project_cnc2, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_sd,
      gridLabel_life_la_sd_projects_user1,
      gridLabel_oak_la_sd_projects_user1,
    ]);
    expectLifeOakTaxa(store);
    expect_LA_SD_Place(store);
    expectProjects(store);
    expectUser1(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: `${redOak().id}`,
      colors: colors[1],
      place_id: `${losangeles.id},${sandiego.id}`,
      verifiable: true,
      spam: false,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      user_id: `${user1.id}`,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id},${project_cnc2.id}` +
        `&user_id=${user1.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&verifiable=true&spam=false`,
    );

    await userSelectedHandler(user2, "user", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_sd,
      gridLabel_life_places_resources,
      gridLabel_oaks_places_resources,
    ]);
    expectLifeOakTaxa(store);
    expect_LA_SD_Place(store);
    expectProjects(store);
    expectUsers(store);
    let params8 = {
      colors: colors[1],
      place_id: `${losangeles.id},${sandiego.id}`,
      taxon_id: redOak().id.toString(),
      spam: false,
      verifiable: true,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
      user_id: `${user1.id},${user2.id}`,
    };
    expect(store.inatApiParams).toStrictEqual(params8);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id},${project_cnc2.id}` +
        `&user_id=${user1.id},${user2.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&verifiable=true&spam=false`,
    );
  });

  test(`add taxon; add place; add project; add user; remove resources`, async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);

    await addResources(store);

    await removeUser(user1.id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la_project1,
    ]);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
      place_id: losangeles.id.toString(),
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}&project_id=${project_cnc1.id}` +
        `&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await removeProject(project_cnc1.id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      verifiable: true,
      spam: false,
      place_id: losangeles.id.toString(),
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}` +
        `&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await removePlace(losangeles.id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      verifiable: true,
      spam: false,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}` +
        `&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await removeTaxon(life().id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
      verifiable: true,
      spam: false,
    });
    expect(window.location.search).toBe(``);
  });
});

describe("removePlace", () => {
  test("add place; remove place", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await placeSelectedHandler(losangeles, "los", store);

    let params1 = {
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxaRecord.id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&verifiable=true&spam=false`,
    );

    await removePlace(losangeles.id, store);

    let params2 = {
      colors: iNatOrange,
      spam: false,
      verifiable: true,
      taxon_id: allTaxaRecord.id.toString(),
    };
    expect(store.inatApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe("");
  });

  test("add place; add place; remove place", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await placeSelectedHandler(losangeles, "los", store);

    let params1 = {
      colors: iNatOrange,
      place_id: losangeles.id.toString(),
      taxon_id: allTaxaRecord.id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&verifiable=true&spam=false`,
    );

    await placeSelectedHandler(sandiego, "san", store);

    let params2 = {
      colors: iNatOrange,
      place_id: `${losangeles.id},${sandiego.id}`,
      taxon_id: allTaxaRecord.id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id},${sandiego.id}&verifiable=true&spam=false`,
    );

    await removePlace(losangeles.id, store);

    let params3 = {
      colors: iNatOrange,
      place_id: sandiego.id.toString(),
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params3);
    expect(window.location.search).toBe(
      `?place_id=${sandiego.id}&verifiable=true&spam=false`,
    );
  });

  test("add refresh bounding box; remove place", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await refreshBoundingBox(store);

    expect(store.inatApiParams).toStrictEqual({
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      verifiable: true,
      spam: false,
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
    });
    expect(window.location.search).toBe(
      "?verifiable=true&spam=false&nelat=0&nelng=0&swlat=0&swlng=0",
    );

    await removePlace(0, store);

    let params2 = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe("");
  });

  test("add taxon; add place; remove place", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      verifiable: true,
      spam: false,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await placeSelectedHandler(losangeles, "los", store);

    let params1 = {
      colors: colors[0],
      place_id: losangeles.id.toString(),
      taxon_id: life().id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}` +
        `&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await removePlace(losangeles.id, store);

    let params2 = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );
  });

  test("add taxon; add refresh; remove place", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      verifiable: true,
      spam: false,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await refreshBoundingBox(store);

    let params1 = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&verifiable=true` +
        `&spam=false&nelat=0&nelng=0&swlat=0&swlng=0`,
    );

    await removePlace(0, store);

    let params2 = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );
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
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await removeTaxon(life().id, store);

    let params2 = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params2);
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
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params1);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await taxonSelectedHandler(redOakBasic, "red", store);

    let params2 = {
      colors: colors[1],
      taxon_id: redOak().id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&verifiable=true&spam=false`,
    );

    await removeTaxon(lifeBasic.id, store);

    let params3 = {
      colors: colors[1],
      spam: false,
      verifiable: true,
      taxon_id: redOak().id.toString(),
    };
    expect(store.inatApiParams).toStrictEqual(params3);

    expect(window.location.search).toBe(
      `?taxon_id=${redOak().id}&colors=${colorsEncoded[1]}&verifiable=true&spam=false`,
    );
  });
});

describe("removeProject", () => {
  test("add project; remove project", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await projectSelectedHandler(project_cnc1, "city", store);

    let expectedParams = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&verifiable=true&spam=false`,
    );

    await removeProject(project_cnc1.id, store);

    let expectedParams2 = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe("");
  });

  test("add project; add project; remove project", async () => {
    let store = structuredClone(mapStore);

    expectEmpytMap(store);

    await initPopulateStore(store, decodeAppUrl(""));
    await initRenderMap(store);
    await projectSelectedHandler(project_cnc1, "city", store);

    let expectedParams = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id}&verifiable=true&spam=false`,
    );

    await projectSelectedHandler(project_cnc2, "city", store);

    let expectedParams2 = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc1.id},${project_cnc2.id}&verifiable=true&spam=false`,
    );

    await removeProject(project_cnc1.id, store);

    let expectedParams3 = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      project_id: `${project_cnc2.id}`,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(
      `?project_id=${project_cnc2.id}&verifiable=true&spam=false`,
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
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      user_id: user1.id.toString(),
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?user_id=${user1.id}&verifiable=true&spam=false`,
    );

    await removeUser(user1.id, store);

    let expectedParams2 = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams2);
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
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      user_id: `${user1.id}`,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
    expect(window.location.search).toBe(
      `?user_id=${user1.id}&verifiable=true&spam=false`,
    );

    await userSelectedHandler(user2, "user", store);

    let expectedParams2 = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      user_id: `${user1.id},${user2.id}`,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?user_id=${user1.id},${user2.id}&verifiable=true&spam=false`,
    );

    await removeUser(user1.id, store);

    let expectedParams3 = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      user_id: `${user2.id}`,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(
      `?user_id=${user2.id}&verifiable=true&spam=false`,
    );
  });
});
