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
import L from "leaflet";
import jsdom from "jsdom";

import type { MapStore, NormalizediNatTaxon } from "../../types/app";
import {
  leafletVisibleLayers,
  refreshiNatMapLayers,
  removePlace,
  removeTaxon,
} from "../../lib/data_utils.ts";
import { mapStore } from "../../lib/store.ts";
import {
  taxonSelectedHandler,
  placeSelectedHandler,
} from "../../lib/autocomplete_utils.ts";
import { getMapTiles, addLayerToMap } from "../../lib/map_utils.ts";
import { createMockServer } from "../test_helpers.ts";

let colors = ["#4477aa", "#66ccee"];

let lifeBasic: NormalizediNatTaxon = {
  name: "Life",
  default_photo:
    "https://inaturalist-open-data.s3.amazonaws.com/photos/347064198/square.jpeg",
  preferred_common_name: "life",
  matched_term: "Life",
  rank: "stateofmatter",
  id: 48460,
};

function life(color = colors[0]) {
  return {
    ...lifeBasic,
    display_name: "life",
    title: "life",
    subtitle: "Life",
    color: color,
    observations_count: 123,
  };
}

let redOakBasic: NormalizediNatTaxon = {
  name: "Lobatae",
  default_photo: "https://inat.com/photos/149586607/square.jpg",
  preferred_common_name: "red oaks",
  matched_term: "red oaks",
  rank: "section",
  id: 861036,
};

function redOak(color = colors[1]) {
  return {
    ...redOakBasic,
    display_name: "red oaks",
    title: "red oaks",
    subtitle: "Lobatae",
    color: color,
    observations_count: 123,
  };
}

let losangeles = {
  display_name: "Los Angeles County, US, CA",
  id: 962,
  name: "Los Angeles",
};

let sandiego = {
  id: 829,
  name: "San Diego",
  display_name: "San Diego County, CA, US",
};

let refreshPlace = {
  id: 0,
  name: "Custom Boundary",
  display_name: "Custom Boundary",
};

let placeLabel_la = "place layer: Los Angeles, 962";
let placeLabel_sd = "place layer: San Diego, 829";

let gridLabel_life = "overlay: iNat grid, taxon_id 48460";
let gridLabel_oaks = "overlay: iNat grid, taxon_id 861036";
let gridLabel_life_la = "overlay: iNat grid, taxon_id 48460, place_id 962";
let gridLabel_life_sd = "overlay: iNat grid, taxon_id 48460, place_id 829";

let refreshBBoxLabel = "refresh bounding box";
let basemapLabel_osm = "basemap: Open Street Map";

function setup() {
  let map = L.map("map", {
    center: [0, 0],
    zoom: 2,
    maxZoom: 19,
  });
  var layerControl = L.control.layers().addTo(map);
  let { OpenStreetMap } = getMapTiles();
  addLayerToMap(OpenStreetMap, map, layerControl, true);

  let store: MapStore = {
    ...mapStore,
    map: { map: map, layerControl: layerControl },
  };

  return { map, layerControl, store };
}

function expectEmpytMap(store: MapStore) {
  expect(store.inatApiParams).toStrictEqual({});
  expect(store.selectedTaxa).toStrictEqual([]);
  expect(store.taxaMapLayers).toStrictEqual({});
  expect(store.selectedPlaces).toBeUndefined();
  expect(store.placesMapLayers).toBeUndefined();
  expect(store.refreshMap.refreshMapButtonEl).toBeNull();
  expect(store.refreshMap.showRefreshMapButton).toBeFalsy();
  expect(store.refreshMap.layer).toBeNull();
  expect(store.color).toEqual("");
}

function expectNoTaxa(store: MapStore) {
  expect(store.selectedTaxa).toStrictEqual([]);
  expect(store.taxaMapLayers).toStrictEqual({});
}

function expectNoPlaces(store: MapStore) {
  expect(store.selectedPlaces).toBeUndefined();
  expect(store.placesMapLayers).toBeUndefined();
}

function expectNoRefresh(store: MapStore) {
  expect(store.refreshMap.refreshMapButtonEl).toBeNull();
  expect(store.refreshMap.showRefreshMapButton).toBeFalsy();
  expect(store.refreshMap.layer).toBeNull();
}

function expectLosAngelesPlace(store: MapStore) {
  expect(store.selectedPlaces).toEqual(losangeles);
  expect(store.placesMapLayers).not.toBeUndefined();
}

function expectSanDiegoPlace(store: MapStore) {
  expect(store.selectedPlaces).toEqual(sandiego);
  expect(store.placesMapLayers).not.toBeUndefined();
}

function expectRefreshPlace(store: MapStore) {
  expect(store.refreshMap.layer).toBeDefined();
  expect(store.refreshMap.showRefreshMapButton).toBeFalsy();
  expect(store.selectedPlaces).toEqual(refreshPlace);
  expect(store.placesMapLayers).not.toBeUndefined();
}

function expectLifeTaxa(store: MapStore, color = colors[0]) {
  let lifeTemp = life(color);
  expect(store.selectedTaxa).toStrictEqual([lifeTemp]);
  expect(Object.keys(store.taxaMapLayers)).toEqual([lifeTemp.id.toString()]);
  expect(store.taxaMapLayers[lifeTemp.id].length).toBe(4);
  expect(store.color).toBe(color);
}

function expectOakTaxa(store: MapStore, color = colors[1]) {
  let oak = redOak(color);
  expect(store.selectedTaxa).toStrictEqual([oak]);
  expect(Object.keys(store.taxaMapLayers)).toEqual([oak.id.toString()]);
  expect(store.taxaMapLayers[oak.id].length).toBe(4);
  expect(store.color).toBe(color);
}

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
    let { store } = setup();

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
      verifiable: true,
      spam: false,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);

    expect(window.location.search).toBe(
      `?taxa_id=${life().id}&colors=%234477aa&spam=false&verifiable=true`,
    );
  });

  test(`add life; add red oak`, async () => {
    let { store } = setup();

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
      verifiable: true,
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
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams2);
  });
});

describe("placeSelectedHandler", () => {
  test(` add los angeles`, async () => {
    let { store } = setup();

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
      place_id: losangeles.id,
      taxon_id: life().id,
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams);

    expect(window.location.search).toBe(
      `?taxa_id=${life().id}&places_id=${losangeles.id}&colors=%234477aa&spam=false&verifiable=true`,
    );
  });

  test(`add los angeles; add san diego`, async () => {
    let { store } = setup();

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
      place_id: losangeles.id,
      taxon_id: life().id,
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams1);

    await placeSelectedHandler(sandiego, "san", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_sd,
      gridLabel_life_sd,
    ]);
    expectNoRefresh(store);
    expectLifeTaxa(store);
    expectSanDiegoPlace(store);
    let expectedParams2 = {
      color: colors[0],
      place_id: sandiego.id,
      taxon_id: life().id,
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(expectedParams2);
  });
});

describe("refreshiNatMapLayers", () => {
  test(`refresh map;`, async () => {
    let { store } = setup();

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
      `?places_id=${refreshPlace.id}&nelat=0&nelng=0&swlat=0&swlng=0`,
    );
  });

  test(`refresh map; refresh map;`, async () => {
    let { store } = setup();

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
    let { store } = setup();

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
      verifiable: true,
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
      verifiable: true,
    });
  });

  test(`add place; refresh map;`, async () => {
    let { store } = setup();

    expectEmpytMap(store);

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expectNoRefresh(store);
    expect(store.selectedPlaces).toStrictEqual(losangeles);
    let params = {
      color: colors[0],
      place_id: losangeles.id,
      taxon_id: life().id,
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params);

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
      verifiable: true,
      spam: false,
    });
  });

  test(`add taxon; refresh map;`, async () => {
    let { store } = setup();

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
      verifiable: true,
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
      verifiable: true,
      spam: false,
    });
  });

  test(`add life; add los angeles`, async () => {
    let { store } = setup();

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
      verifiable: true,
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
      place_id: losangeles.id,
      verifiable: true,
      spam: false,
    });
  });

  test(`add place; refresh map; add place`, async () => {
    let { store } = setup();

    expectEmpytMap(store);

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expectNoRefresh(store);
    expect(store.selectedPlaces).toStrictEqual(losangeles);
    let params = {
      color: colors[0],
      place_id: losangeles.id,
      taxon_id: life().id,
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params);

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
      verifiable: true,
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
    expect(store.selectedPlaces).toStrictEqual(sandiego);
    let params2 = {
      color: colors[0],
      place_id: sandiego.id,
      taxon_id: life().id,
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params2);
  });
});

describe("removePlace", () => {
  test("add place; remove place", async () => {
    let { store } = setup();

    expectEmpytMap(store);

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expect(store.selectedPlaces).toStrictEqual(losangeles);
    let params1 = {
      color: colors[0],
      place_id: losangeles.id,
      taxon_id: life().id,
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params1);

    await removePlace(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);
    expectNoTaxa(store);
    expectNoPlaces(store);
    expect(store.color).toEqual(colors[0]);
    let params2 = {
      color: colors[0],
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params2);

    expect(window.location.search).toBe(`?spam=false&verifiable=true`);
  });

  test("add refresh bounding box; remove place", async () => {
    let { store } = setup();

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

    await removePlace(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);
    expectNoTaxa(store);
    expectNoPlaces(store);
    let params2 = {};
    expect(store.inatApiParams).toStrictEqual(params2);
  });

  test("add taxon; add place; remove place", async () => {
    let { store } = setup();

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
      verifiable: true,
      spam: false,
    });

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expect(store.selectedPlaces).toStrictEqual(losangeles);
    let params1 = {
      color: colors[0],
      place_id: losangeles.id,
      taxon_id: life().id,
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params1);

    await removePlace(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);
    expectNoTaxa(store);
    expectNoPlaces(store);
    let params2 = { color: colors[0], spam: false, verifiable: true };
    expect(store.inatApiParams).toStrictEqual(params2);
  });

  test("add taxon; add refresh; remove place", async () => {
    let { store } = setup();

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
      verifiable: true,
      spam: false,
    });

    await refreshiNatMapLayers(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      refreshBBoxLabel,
      gridLabel_life,
    ]);
    expectLifeTaxa(store);
    expect(store.selectedPlaces).toStrictEqual(refreshPlace);
    let params1 = {
      color: colors[0],
      taxon_id: life().id,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params1);

    await removePlace(store);

    expect(leafletVisibleLayers(store)).toStrictEqual([basemapLabel_osm]);
    expectNoTaxa(store);
    expectNoPlaces(store);
    let params2 = { color: colors[0], spam: false, verifiable: true };
    expect(store.inatApiParams).toStrictEqual(params2);
  });
});

describe("removeTaxon", () => {
  test("add taxon; remove taxon", async () => {
    let { store } = setup();

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
      verifiable: true,
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
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params2);

    expect(window.location.search).toBe(`?spam=false&verifiable=true`);
  });

  test("add taxon; add taxon; remove taxon", async () => {
    let { store } = setup();

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
      verifiable: true,
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
      verifiable: true,
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
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params3);
  });

  test("add place; remove taxon", async () => {
    let { store } = setup();

    expectEmpytMap(store);

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expect(store.selectedPlaces).toStrictEqual(losangeles);
    let params1 = {
      color: colors[0],
      place_id: losangeles.id,
      taxon_id: life().id,
      spam: false,
      verifiable: true,
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
      place_id: losangeles.id,
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params2);
  });

  test("add taxon; add place; remove taxon", async () => {
    let { store } = setup();

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
      verifiable: true,
      spam: false,
    });

    await placeSelectedHandler(losangeles, "los", store);

    expect(leafletVisibleLayers(store)).toStrictEqual([
      basemapLabel_osm,
      placeLabel_la,
      gridLabel_life_la,
    ]);
    expectLifeTaxa(store);
    expect(store.selectedPlaces).toStrictEqual(losangeles);
    let params1 = {
      color: colors[0],
      place_id: losangeles.id,
      taxon_id: life().id,
      spam: false,
      verifiable: true,
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
      place_id: losangeles.id,
      spam: false,
      verifiable: true,
    };
    expect(store.inatApiParams).toStrictEqual(params2);
  });

  test("add taxon; add refresh; remove taxon", async () => {
    let { store } = setup();

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
      verifiable: true,
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
      verifiable: true,
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
      verifiable: true,
      nelat: 0,
      nelng: 0,
      swlat: 0,
      swlng: 0,
    };
    expect(store.inatApiParams).toStrictEqual(params2);
  });
});
