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
  refreshiNatMapLayers,
  removePlace,
  removeTaxon,
} from "../../lib/data_utils.ts";
import {
  taxonSelectedHandler,
  placeSelectedHandler,
} from "../../lib/autocomplete_utils.ts";
import {
  createMockServer,
  setupMapAndStore,
  expectEmpytMap,
  expectLifeTaxa,
  expectLosAngelesPlace,
  expectNoPlaces,
  expectNoRefresh,
  expectNoTaxa,
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
  gridLabel_life_sd,
  gridLabel_life_la,
  gridLabel_life_la_sd,
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

describe("taxonSelectedHandler", () => {
  test(`add life`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

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
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);

    expect(window.location.search).toBe(
      `?taxon_ids=${life().id}&colors=%234477aa&spam=false`,
    );
  });

  test(`add life; add red oak`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expectLifeTaxa(store);
    let expectedParams1 = {
      taxon_id: life().id,
      color: colors[0],
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams1);

    await taxonSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
      gridLabel_oaks,
    ]);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expect(store.selectedTaxa).toStrictEqual([life(), redOak()]);
    expect(Object.keys(store.taxaMapLayers)).toEqual([
      life().id.toString(),
      redOak().id.toString(),
    ]);
    expect(store.taxaMapLayers[life().id].length).toBe(4);
    expect(store.taxaMapLayers[redOak().id].length).toBe(4);
    expect(store.color).toBe(colors[1]);
    let expectedParams2 = {
      taxon_id: redOakBasic.id,
      color: colors[1],
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams2);
  });
});

describe("placeSelectedHandler", () => {
  test(` add los angeles`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
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
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);

    expect(window.location.search).toBe(
      `?taxon_ids=${life().id}&place_id=${losangeles.id}&colors=%234477aa&spam=false`,
    );
  });

  test(`add los angeles; add san diego`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectNoRefresh(store);
    expectLifeTaxa(store);
    expectLosAngelesPlace(store);
    let expectedParams1 = {
      color: colors[0],
      place_id: losangeles.id.toString(),
      taxon_id: life().id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams1);

    await placeSelectedHandler(sandiego, "san", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_sd,
      gridLabel_life_la_sd,
    ]);
    expectNoRefresh(store);
    expectLifeTaxa(store);
    expect(store.selectedPlaces).toEqual([losangeles, sandiego]);
    expect(store.placesMapLayers).not.toBeUndefined();
    let expectedParams2 = {
      color: colors[0],
      place_id: `${losangeles.id},${sandiego.id}`,
      taxon_id: life().id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams2);
  });
});

describe("refreshiNatMapLayers", () => {
  test(`refresh map;`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await refreshiNatMapLayers(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
    ]);
    expectNoTaxa(store);
    expectRefreshPlace(store);
    expect(store.color).toEqual("");
    let expectedParams = { nelat: 0, nelng: 0, swlat: 0, swlng: 0 };
    expect(store.inatApiParams).toStrictEqual(expectedParams);

    expect(window.location.search).toBe(
      `?place_id=${refreshPlace.id}&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
  });

  test(`refresh map; refresh map;`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await refreshiNatMapLayers(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
    ]);
    expectNoTaxa(store);
    expectRefreshPlace(store);
    expect(store.color).toEqual("");
    let expectedParams = { nelat: 0, nelng: 0, swlat: 0, swlng: 0 };
    expect(store.inatApiParams).toStrictEqual(expectedParams);
    let refreshlayer1 = store.refreshMap.layer;

    await refreshiNatMapLayers(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
    ]);
    expectNoTaxa(store);
    expectRefreshPlace(store);
    expect(store.color).toEqual("");
    expect(store.inatApiParams).toStrictEqual(expectedParams);
    let refreshlayer2 = store.refreshMap.layer;
    expect(refreshlayer1).not.toStrictEqual(refreshlayer2);
  });
});

describe("combos", () => {
  test(`add taxon; refresh map;`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await taxonSelectedHandler(redOakBasic, "red", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_oaks,
    ]);
    expectOakTaxa(store, colors[0]);
    let params1 = {
      color: colors[0],
      taxon_id: redOak(colors[0]).id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params1);

    await refreshiNatMapLayers(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_oaks,
    ]);
    expectOakTaxa(store, colors[0]);
    expectRefreshPlace(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: redOak(colors[0]).id,
      color: colors[0],
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      spam: false,
    });
  });

  test(`add place; refresh map;`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expectNoRefresh(store);
    expect(store.selectedPlaces).toStrictEqual([losangeles]);
    let params = {
      color: colors[0],
      place_id: losangeles.id.toString(),
      taxon_id: life().id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params);

    await refreshiNatMapLayers(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expectRefreshPlace(store, "LA");
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id,
      color: colors[0],
      nelat: 34.30714385628804,
      nelng: -118.12500000000001,
      swlat: 34.30714385628804,
      swlng: -118.12500000000001,
      spam: false,
    });
  });

  test(`add taxon; refresh map;`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expectNoRefresh(store);
    expectNoPlaces(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id,
      color: colors[0],
      spam: false,
    });

    await refreshiNatMapLayers(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expectRefreshPlace(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id,
      color: colors[0],
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      spam: false,
    });
  });

  test(`add life; add los angeles`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id,
      color: colors[0],
      spam: false,
    });

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expectLosAngelesPlace(store);
    expectNoRefresh(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id,
      color: colors[0],
      place_id: losangeles.id.toString(),
      spam: false,
    });
  });

  test(`add place; refresh map; add place`, async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expectNoRefresh(store);
    expect(store.selectedPlaces).toStrictEqual([losangeles]);
    let params = {
      color: colors[0],
      place_id: losangeles.id.toString(),
      taxon_id: life().id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params);

    await refreshiNatMapLayers(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expectRefreshPlace(store, "LA");
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id,
      color: colors[0],
      nelat: 34.30714385628804,
      nelng: -118.12500000000001,
      swlat: 34.30714385628804,
      swlng: -118.12500000000001,
      spam: false,
    });

    await placeSelectedHandler(sandiego, "san", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_sd,
      gridLabel_life_sd,
    ]);
    expectLifeTaxa(store);
    expectNoRefresh(store);
    expect(store.selectedPlaces).toStrictEqual([sandiego]);
    let params2 = {
      color: colors[0],
      place_id: sandiego.id.toString(),
      taxon_id: life().id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params2);
  });
});

describe("removePlace", () => {
  test("add place; remove place", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expect(store.selectedPlaces).toStrictEqual([losangeles]);
    let params1 = {
      color: colors[0],
      place_id: losangeles.id.toString(),
      taxon_id: life().id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params1);

    await removePlace(losangeles.id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);
    expectNoTaxa(store);
    expectNoPlaces(store);
    expect(store.color).toEqual(colors[0]);
    let params2 = {
      color: colors[0],
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params2);

    expect(window.location.search).toBe("");
  });

  test("add place; add place; remove place", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expect(store.selectedPlaces).toStrictEqual([losangeles]);
    let params1 = {
      color: colors[0],
      place_id: losangeles.id.toString(),
      taxon_id: life().id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params1);

    await placeSelectedHandler(sandiego, "san", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_sd,
      gridLabel_life_la_sd,
    ]);
    expectLifeTaxa(store);
    expect(store.selectedPlaces).toStrictEqual([losangeles, sandiego]);
    let params2 = {
      color: colors[0],
      place_id: `${losangeles.id},${sandiego.id}`,
      taxon_id: life().id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params2);

    await removePlace(losangeles.id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      placeLabel_sd,
      gridLabel_life_sd,
    ]);
    expectLifeTaxa(store);
    expect(store.selectedPlaces).toStrictEqual([sandiego]);
    expect(store.color).toEqual(colors[0]);
    let params3 = {
      color: colors[0],
      place_id: sandiego.id.toString(),
      taxon_id: life().id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params3);

    let searchParams =
      "?taxon_ids=48460&place_id=829&colors=%234477aa&spam=false";
    expect(window.location.search).toBe(searchParams);
  });

  test("add refresh bounding box; remove place", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await refreshiNatMapLayers(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
    ]);
    expectNoTaxa(store);
    expectRefreshPlace(store);
    expect(store.inatApiParams).toStrictEqual({
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
    });

    await removePlace(0, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);
    expectNoTaxa(store);
    expectNoPlaces(store);
    let params2 = {};
    expect(store.inatApiParams).toStrictEqual(params2);
  });

  test("add taxon; add place; remove place", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id,
      color: colors[0],
      spam: false,
    });

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expect(store.selectedPlaces).toStrictEqual([losangeles]);
    let params1 = {
      color: colors[0],
      place_id: losangeles.id.toString(),
      taxon_id: life().id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params1);

    await removePlace(losangeles.id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);
    expectNoTaxa(store);
    expectNoPlaces(store);
    let params2 = { color: colors[0], spam: false };
    expect(store.inatApiParams).toStrictEqual(params2);
  });

  test("add taxon; add refresh; remove place", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id,
      color: colors[0],
      spam: false,
    });

    await refreshiNatMapLayers(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expect(store.selectedPlaces).toStrictEqual([refreshPlace]);
    let params1 = {
      color: colors[0],
      taxon_id: life().id,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params1);

    await removePlace(0, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);
    expectNoTaxa(store);
    expectNoPlaces(store);
    let params2 = { color: colors[0], spam: false };
    expect(store.inatApiParams).toStrictEqual(params2);
  });
});

describe("removeTaxon", () => {
  test("add taxon; remove taxon", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expectNoPlaces(store);
    let params1 = {
      color: colors[0],
      taxon_id: life().id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params1);

    await removeTaxon(life().id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);
    expectNoTaxa(store);
    expectNoPlaces(store);
    expect(store.color).toEqual(colors[0]);
    let params2 = {
      color: colors[0],
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params2);

    expect(window.location.search).toBe("");
  });

  test("add taxon; add taxon; remove taxon", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expectNoPlaces(store);
    let params1 = {
      color: colors[0],
      taxon_id: life().id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params1);

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
    expectNoPlaces(store);
    let params2 = {
      color: colors[1],
      taxon_id: redOak().id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params2);

    await removeTaxon(lifeBasic.id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_oaks,
    ]);
    expect(store.selectedTaxa).toStrictEqual([redOak()]);
    expect(Object.keys(store.taxaMapLayers)).toEqual([redOak().id.toString()]);
    expect(store.taxaMapLayers[redOak().id].length).toBe(4);
    expectNoPlaces(store);
    let params3 = {
      color: colors[1],
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params3);
  });

  test("add place; remove taxon", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expect(store.selectedPlaces).toStrictEqual([losangeles]);
    let params1 = {
      color: colors[0],
      place_id: losangeles.id.toString(),
      taxon_id: life().id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params1);

    await removeTaxon(life().id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
    ]);
    expectNoTaxa(store);
    expectLosAngelesPlace(store);
    let params2 = {
      color: colors[0],
      place_id: losangeles.id.toString(),
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params2);
  });

  test("add taxon; add place; remove taxon", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id,
      color: colors[0],
      spam: false,
    });

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expect(store.selectedPlaces).toStrictEqual([losangeles]);
    let params1 = {
      color: colors[0],
      place_id: losangeles.id.toString(),
      taxon_id: life().id,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params1);

    await removeTaxon(life().id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
    ]);
    expectNoTaxa(store);
    expectLosAngelesPlace(store);
    let params2 = {
      color: colors[0],
      place_id: losangeles.id.toString(),
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(params2);
  });

  test("add taxon; add refresh; remove taxon", async () => {
    let { store } = setupMapAndStore();

    expectEmpytMap(store);

    await taxonSelectedHandler(lifeBasic, "life", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expectNoPlaces(store);
    expectNoRefresh(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id,
      color: colors[0],
      spam: false,
    });

    await refreshiNatMapLayers(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expectRefreshPlace(store);
    expect(store.inatApiParams).toStrictEqual({
      taxon_id: life().id,
      color: colors[0],
      spam: false,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
    });

    await removeTaxon(life().id, store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
    ]);
    expectNoTaxa(store);
    expectRefreshPlace(store);
    let params2 = {
      color: colors[0],
      spam: false,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
    };
    expect(store.inatApiParams).toStrictEqual(params2);
  });
});
