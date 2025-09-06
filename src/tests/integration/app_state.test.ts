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
  removePlace,
  removeProject,
  removeTaxon,
} from "../../lib/data_utils.ts";
import {
  taxonSelectedHandler,
  placeSelectedHandler,
  projectSelectedHandler,
} from "../../lib/autocomplete_utils.ts";
import {
  createMockServer,
  setupMapAndStore,
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
  refreshPlace,
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
  monarchBasic,
  gridLabel_monarch,
  monarch,
  gridLabel_oaks_la_sd,
  gridLabel_oaks_la,
  expectLifeOakTaxa,
  gridLabel_life_la_sd,
  project_cnc1,
  gridLabel_allTaxaRecord_project1,
  project_cnc2,
  gridLabel_allTaxaRecord_project2,
  gridLabel_allTaxaRecord_projects,
  expectNoProjects,
  gridLabel_life_la_project1,
  expectNoTaxa,
  expectProject1,
  gridLabel_life_la_sd_projects,
  gridLabel_oaks_la_sd_projects,
  gridLabel_life_la_sd_project1,
  gridLabel_oaks_la_sd_project1,
  expectProjects,
  gridLabel_life_project1,
  gridLabel_allTaxaRecord_la_project1,
  expectProject2,
} from "../test_helpers.ts";
import { allTaxaRecord } from "../../lib/inat_data.ts";
import { iNatOrange } from "../../lib/map_colors_utils.ts";
import { decodeAppUrl } from "../../lib/utils.ts";
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

describe("taxonSelectedHandler", () => {
  test(`add red oak`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
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
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
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
    expect(store.color).toBe(colors[1]);
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
  test(` add los angeles`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
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
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
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
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
    expectRefreshPlace(store);
    expectNoProjects(store);
    expect(store.color).toEqual(iNatOrange);
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
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
    expectRefreshPlace(store);
    expectNoProjects(store);
    expect(store.color).toEqual(iNatOrange);
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
    expect(store.color).toEqual(iNatOrange);
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
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expect(store.selectedProjects).toStrictEqual([project_cnc1]);
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
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectAllTaxaRecord(store);
    expect(store.selectedProjects).toStrictEqual([project_cnc1]);
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

describe("combos", () => {
  test(`add taxon; refresh map;`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
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
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectAllTaxaRecord(store);
    expectLosAngelesPlace(store);
    expect(store.selectedPlaces).toStrictEqual([losangeles]);
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
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
    expectAllTaxaRecord(store);
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

  test(`add place; refresh map; add place`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
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

  test(`add taxon; add place; add project`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expectLosAngelesPlace(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      place_id: losangeles.id.toString(),
      verifiable: true,
      spam: false,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}&colors=${colorsEncoded[0]}` +
        `&verifiable=true&spam=false`,
    );

    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la_project1,
    ]);
    expectLifeTaxa(store);
    expectLosAngelesPlace(store);
    expectProject1(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      place_id: losangeles.id.toString(),
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}&project_id=${project_cnc1.id}` +
        `&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );
  });

  test("add taxon; add taxon; add place; add place; add project; add project", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expect(store.selectedTaxa).toStrictEqual([life(), redOak()]);
    expect(Object.keys(store.taxaMapLayers)).toEqual([
      life().id.toString(),
      redOak().id.toString(),
    ]);
    expect(store.taxaMapLayers[life().id].length).toBe(4);
    expect(store.taxaMapLayers[redOak().id].length).toBe(4);
    expect(store.color).toBe(colors[1]);
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

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
      gridLabel_oaks_la,
    ]);
    expectLifeOakTaxa(store);
    expectLosAngelesPlace(store);
    let params3 = {
      colors: colors[1],
      place_id: losangeles.id.toString(),
      taxon_id: redOak().id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params3);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}&place_id=${losangeles.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&verifiable=true&spam=false`,
    );

    await placeSelectedHandler(sandiego, "san", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_sd,
      gridLabel_life_la_sd,
      gridLabel_oaks_la_sd,
    ]);
    expectLifeOakTaxa(store);
    expect_LA_SD_Place(store);
    let params4 = {
      colors: colors[1],
      place_id: `${losangeles.id},${sandiego.id}`,
      taxon_id: redOak().id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params4);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&verifiable=true&spam=false`,
    );

    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_sd,
      gridLabel_life_la_sd_project1,
      gridLabel_oaks_la_sd_project1,
    ]);
    expectLifeOakTaxa(store);
    expect_LA_SD_Place(store);
    expectProject1(store);
    let params5 = {
      colors: colors[1],
      place_id: `${losangeles.id},${sandiego.id}`,
      taxon_id: redOak().id.toString(),
      spam: false,
      verifiable: true,
      project_id: project_cnc1.id.toString(),
    };
    expect(store.inatApiParams).toStrictEqual(params5);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&verifiable=true&spam=false`,
    );

    await projectSelectedHandler(project_cnc2, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_sd,
      gridLabel_life_la_sd_projects,
      gridLabel_oaks_la_sd_projects,
    ]);
    expectLifeOakTaxa(store);
    expect_LA_SD_Place(store);
    expectProjects(store);
    let params6 = {
      colors: colors[1],
      place_id: `${losangeles.id},${sandiego.id}`,
      taxon_id: redOak().id.toString(),
      spam: false,
      verifiable: true,
      project_id: `${project_cnc1.id},${project_cnc2.id}`,
    };
    expect(store.inatApiParams).toStrictEqual(params6);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&place_id=${losangeles.id},${sandiego.id}` +
        `&project_id=${project_cnc1.id},${project_cnc2.id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&verifiable=true&spam=false`,
    );
  });
});

describe("removePlace", () => {
  test("add place; remove place", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectAllTaxaRecord(store);
    expectLosAngelesPlace(store);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
    expect(store.color).toEqual(iNatOrange);
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
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectAllTaxaRecord(store);
    expectLosAngelesPlace(store);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_sd,
      gridLabel_allTaxaRecord_la_sd,
    ]);
    expectAllTaxaRecord(store);
    expect_LA_SD_Place(store);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_sd,
      gridLabel_allTaxaRecord_sd,
    ]);
    expectAllTaxaRecord(store);
    expect(store.selectedPlaces).toStrictEqual([sandiego]);
    expect(store.color).toEqual(iNatOrange);
    let params3 = {
      colors: iNatOrange,
      place_id: sandiego.id.toString(),
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params3);
    expect(store.selectedPlaces.length).toBe(1);
    expect(Object.keys(store.placesMapLayers)).toStrictEqual([
      sandiego.id.toString(),
    ]);
    expect(store.placesMapLayers[sandiego.id].length).toBe(1);
    expect(window.location.search).toBe(
      `?place_id=${sandiego.id}&verifiable=true&spam=false`,
    );
  });

  test("add refresh bounding box; remove place", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await refreshBoundingBox(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
    expectRefreshPlace(store);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
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
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expectLosAngelesPlace(store);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
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
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expect(store.selectedPlaces).toStrictEqual([refreshPlace]);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
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

  test(`add taxon; add place; add project; remove place`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expectLosAngelesPlace(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      place_id: losangeles.id.toString(),
      verifiable: true,
      spam: false,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}&colors=${colorsEncoded[0]}` +
        `&verifiable=true&spam=false`,
    );

    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la_project1,
    ]);
    expectLifeTaxa(store);
    expectLosAngelesPlace(store);
    expectProject1(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      place_id: losangeles.id.toString(),
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}&project_id=${project_cnc1.id}` +
        `&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await removePlace(losangeles.id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life_project1,
    ]);
    expectLifeTaxa(store);
    expectProject1(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&project_id=${project_cnc1.id}` +
        `&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );
  });
});

describe("removeTaxon", () => {
  test("add taxon; remove taxon", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);

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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);

    expect(store.color).toEqual(iNatOrange);
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
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);

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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expectLifeOakTaxa(store);
    expect(store.selectedTaxa).toStrictEqual([life(), redOak()]);
    expect(Object.keys(store.taxaMapLayers)).toEqual([
      life().id.toString(),
      redOak().id.toString(),
    ]);
    expect(store.taxaMapLayers[life().id].length).toBe(4);
    expect(store.taxaMapLayers[redOak().id].length).toBe(4);
    expect(store.color).toBe(colors[1]);

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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_oaks,
    ]);
    expect(store.selectedTaxa).toStrictEqual([redOak()]);
    expect(Object.keys(store.taxaMapLayers)).toEqual([redOak().id.toString()]);
    expect(store.taxaMapLayers[redOak().id].length).toBe(4);

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

  test("add taxon; add taxon; add taxon; remove last taxon", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);

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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expect(store.selectedTaxa).toStrictEqual([life(), redOak()]);
    expect(Object.keys(store.taxaMapLayers)).toEqual([
      life().id.toString(),
      redOak().id.toString(),
    ]);
    expect(store.taxaMapLayers[life().id].length).toBe(4);
    expect(store.taxaMapLayers[redOak().id].length).toBe(4);
    expect(store.color).toBe(colors[1]);

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

    await taxonSelectedHandler(monarchBasic, "mon", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
      gridLabel_monarch,
    ]);
    expect(store.selectedTaxa).toStrictEqual([life(), redOak(), monarch()]);
    expect(Object.keys(store.taxaMapLayers)).toStrictEqual([
      life().id.toString(),
      monarch().id.toString(),
      redOak().id.toString(),
    ]);
    expect(store.taxaMapLayers[life().id].length).toBe(4);
    expect(store.taxaMapLayers[redOak().id].length).toBe(4);
    expect(store.taxaMapLayers[monarch().id].length).toBe(4);
    expect(store.color).toBe(colors[2]);

    let params4 = {
      colors: colors[2],
      taxon_id: monarch().id.toString(),
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params4);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id},${monarch().id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]},${colorsEncoded[2]}` +
        `&verifiable=true&spam=false`,
    );

    await removeTaxon(monarch().id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expect(store.selectedTaxa).toStrictEqual([life(), redOak()]);
    expect(Object.keys(store.taxaMapLayers)).toEqual([
      life().id.toString(),
      redOak().id.toString(),
    ]);
    expect(store.taxaMapLayers[life().id].length).toBe(4);
    expect(store.taxaMapLayers[redOak().id].length).toBe(4);

    let params3 = {
      colors: redOak().color,
      spam: false,
      verifiable: true,
      taxon_id: redOak().id.toString(),
    };
    expect(store.inatApiParams).toStrictEqual(params3);

    expect(window.location.search).toBe(
      `?taxon_id=${life().id},${redOak().id}` +
        `&colors=${colorsEncoded[0]},${colorsEncoded[1]}&verifiable=true&spam=false`,
    );
  });

  test("add taxon; add place; remove taxon", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expectLosAngelesPlace(store);
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

    await removeTaxon(life().id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectAllTaxaRecord(store);
    expectLosAngelesPlace(store);
    let params2 = {
      place_id: losangeles.id.toString(),
      spam: false,
      verifiable: true,
      taxon_id: allTaxaRecord.id.toString(),
      colors: iNatOrange,
    };
    expect(store.inatApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&verifiable=true&spam=false`,
    );
  });

  test("add taxon; add refresh; remove taxon", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expectRefreshPlace(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      verifiable: true,
      spam: false,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}` +
        `&verifiable=true&spam=false&nelat=0&nelng=0&swlat=0&swlng=0`,
    );

    await removeTaxon(life().id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
    expectRefreshPlace(store);
    let params2 = {
      colors: iNatOrange,
      spam: false,
      verifiable: true,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      taxon_id: allTaxaRecord.id.toString(),
    };
    expect(store.inatApiParams).toStrictEqual(params2);
    expect(window.location.search).toBe(
      `?verifiable=true&spam=false&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
  });

  test(`add taxon; add place; add project; remove taxon`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expectLosAngelesPlace(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      place_id: losangeles.id.toString(),
      verifiable: true,
      spam: false,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}&colors=${colorsEncoded[0]}` +
        `&verifiable=true&spam=false`,
    );

    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la_project1,
    ]);
    expectLifeTaxa(store);
    expectLosAngelesPlace(store);
    expectProject1(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      place_id: losangeles.id.toString(),
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}&project_id=${project_cnc1.id}` +
        `&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await removeTaxon(life().id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_allTaxaRecord_la_project1,
    ]);
    expectAllTaxaRecord(store);
    expectLosAngelesPlace(store);
    expectProject1(store);
    expect(store.inatApiParams).toStrictEqual({
      colors: iNatOrange,
      verifiable: true,
      spam: false,
      taxon_id: allTaxaRecord.id.toString(),
      place_id: losangeles.id.toString(),
      project_id: project_cnc1.id.toString(),
    });
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&project_id=${project_cnc1.id}` +
        `&verifiable=true&spam=false`,
    );
  });
});

describe("removeProject", () => {
  test("add project; remove project", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
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

    await removeProject(project_cnc1.id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord,
    ]);
    expectAllTaxaRecord(store);
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
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
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
    expectAllTaxaRecord(store);
    expectProjects(store);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project2,
    ]);
    expectAllTaxaRecord(store);
    expectProject2(store);
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

  test("add project; add taxon; remove project", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
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

    await taxonSelectedHandler(life(), "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life_project1,
    ]);
    expectLifeTaxa(store);
    expectProject1(store);
    let expectedParams3 = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&project_id=${project_cnc1.id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );

    await removeProject(project_cnc1.id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    let expectedParams2 = {
      colors: colors[0],
      taxon_id: life().id.toString(),
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams2);
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
    );
  });

  test("add project; add place; remove project", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_allTaxaRecord_project1,
    ]);
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

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_allTaxaRecord_la_project1,
    ]);
    expectAllTaxaRecord(store);
    expectProject1(store);
    expectLosAngelesPlace(store);
    let expectedParams3 = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      place_id: losangeles.id.toString(),
      project_id: project_cnc1.id.toString(),
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams3);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&project_id=${project_cnc1.id}&verifiable=true&spam=false`,
    );

    await removeProject(project_cnc1.id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_allTaxaRecord_la,
    ]);
    expectAllTaxaRecord(store);
    expectLosAngelesPlace(store);
    let expectedParams4 = {
      colors: iNatOrange,
      taxon_id: allTaxaRecord.id.toString(),
      verifiable: true,
      spam: false,
      place_id: losangeles.id.toString(),
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams4);
    expect(window.location.search).toBe(
      `?place_id=${losangeles.id}&verifiable=true&spam=false`,
    );
  });

  test(`add taxon; add place; add project; remove project`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await initApp(store, decodeAppUrl(""));
    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
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

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expectLosAngelesPlace(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      place_id: losangeles.id.toString(),
      verifiable: true,
      spam: false,
    });
    expect(window.location.search).toBe(
      `?taxon_id=${life().id}&place_id=${losangeles.id}&colors=${colorsEncoded[0]}` +
        `&verifiable=true&spam=false`,
    );

    await projectSelectedHandler(project_cnc1, "city", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la_project1,
    ]);
    expectLifeTaxa(store);
    expectLosAngelesPlace(store);
    expectProject1(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id.toString(),
      colors: colors[0],
      place_id: losangeles.id.toString(),
      verifiable: true,
      spam: false,
      project_id: project_cnc1.id.toString(),
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
    expectLifeTaxa(store);
    expectLosAngelesPlace(store);
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
  });
});
