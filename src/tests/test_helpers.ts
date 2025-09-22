import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import L from "leaflet";
import { expect } from "vitest";

import { addLayerToMap, getMapTiles } from "../lib/map_utils";
import type {
  MapStore,
  NormalizediNatPlace,
  NormalizediNatProject,
  NormalizediNatTaxon,
  NormalizediNatUser,
} from "../types/app";
import { mapStore } from "../lib/store.ts";
import { allTaxaRecord } from "../data/inat_data.ts";
import { loggerUrl } from "../lib/logger.ts";
import { leafletVisibleLayers } from "../lib/data_utils.ts";
import { placeSelectedHandler } from "../lib/search_places.ts";
import { projectSelectedHandler } from "../lib/search_projects.ts";
import { taxonSelectedHandler } from "../lib/search_taxa.ts";
import { userSelectedHandler } from "../lib/search_users.ts";
import {
  cnc1ProjectApi,
  cnc2ProjectApi,
  lifeTaxaApi,
  losangelesPlaceAPI,
  losAngelesSearchApi,
  redoakTaxaApi,
  sandiegoPlaceAPI,
  sandiegoSearchApi,
  user1UserApi,
  user2UserApi,
} from "./fixtures/inatApi.ts";

export function createMockServer() {
  const handlers = [
    http.get("https://api.inaturalist.org/v1/grid*", async (_args) => {
      loggerUrl("request.url", _args.request.url);
      return HttpResponse.json({ id: "abc-123456" });
    }),
    http.get("https://api.inaturalist.org/v1/taxa/48460", async (_args) => {
      return HttpResponse.json(lifeTaxaApi);
    }),
    http.get("https://api.inaturalist.org/v1/taxa/861036", async (_args) => {
      return HttpResponse.json(redoakTaxaApi);
    }),
    http.get("https://api.inaturalist.org/v1/places/962", async (_args) => {
      return HttpResponse.json(losangelesPlaceAPI);
    }),
    http.get("https://api.inaturalist.org/v1/places/829", async (_args) => {
      return HttpResponse.json(sandiegoPlaceAPI);
    }),
    http.get(
      "https://api.inaturalist.org/v1/projects/237729",
      async (_args) => {
        return HttpResponse.json(cnc1ProjectApi);
      },
    ),
    http.get(
      "https://api.inaturalist.org/v1/projects/229902",
      async (_args) => {
        return HttpResponse.json(cnc2ProjectApi);
      },
    ),
    http.get("https://api.inaturalist.org/v1/users/222137", async (_args) => {
      return HttpResponse.json(user1UserApi);
    }),
    http.get("https://api.inaturalist.org/v1/users/677256", async (_args) => {
      return HttpResponse.json(user2UserApi);
    }),
    http.get("https://api.inaturalist.org/v2/observations*", async (_args) => {
      let url = _args.request.url;
      loggerUrl("request.url", url);
      let count = -999;

      if (url.includes(`taxon_id=${allTaxa.id}&`)) {
        count = allTaxa.observations_count;
      } else if (
        url.includes(`taxon_id=${lifeBasic.id}%2C${redOakBasic.id}&`)
      ) {
        count = life().observations_count + redOak().observations_count;
      } else if (url.includes(`taxon_id=${lifeBasic.id}&`)) {
        count = life().observations_count;
      } else if (url.includes(`taxon_id=${redOakBasic.id}&`)) {
        count = redOak().observations_count;
      } else if (!url.includes("taxon_id=")) {
        count = allTaxa.observations_count;
      }

      if (url.includes(`place_id=${losangeles.id}&`)) {
        count = count * 0.6;
      } else if (url.includes(`place_id=${sandiego.id}&`)) {
        count = count * 0.4;
      }

      return HttpResponse.json({ total_results: count, results: [] });
    }),
    http.get("https://{*}.tile.openstreetmap.org*", async (_args) => {
      loggerUrl("request.url", _args.request.url);
      return HttpResponse.json({ total_results: 123456, results: [] });
    }),
    http.get("*", async (_args) => {
      console.error("!! request.url !!", _args.request.url);
      return HttpResponse.json({});
    }),
  ];

  const server = setupServer(...handlers);

  return server;
}

export let colors = ["#4477aa", "#66ccee", "#228833"];
export let colorsEncoded = ["%234477aa", "%2366ccee", "%23228833"];

export let placeLabel_la = "place layer: Los Angeles, 962";
export let placeLabel_sd = "place layer: San Diego, 829";

export let gridLabel_life = "overlay: iNat grid, taxon_id 48460";
export let gridLabel_oaks = "overlay: iNat grid, taxon_id 861036";
export let gridLabel_monarch = "overlay: iNat grid, taxon_id 48662";

export let gridLabel_life_la =
  "overlay: iNat grid, taxon_id 48460, place_id 962";
export let gridLabel_allTaxaRecord_la =
  "overlay: iNat grid, taxon_id 0, place_id 962";

export let gridLabel_life_sd =
  "overlay: iNat grid, taxon_id 48460, place_id 829";
export let gridLabel_allTaxaRecord_sd =
  "overlay: iNat grid, taxon_id 0, place_id 829";

export let gridLabel_life_la_sd =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829";
export let gridLabel_allTaxaRecord_la_sd =
  "overlay: iNat grid, taxon_id 0, place_id 962,829";

export let gridLabel_oaks_la =
  "overlay: iNat grid, taxon_id 861036, place_id 962";
export let gridLabel_oaks_la_sd =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829";

export let gridLabel_allTaxaRecord = "overlay: iNat grid, taxon_id 0";

export let gridLabel_allTaxaRecord_project1 =
  "overlay: iNat grid, taxon_id 0, project_id 237729";
export let gridLabel_allTaxaRecord_project2 =
  "overlay: iNat grid, taxon_id 0, project_id 229902";
export let gridLabel_allTaxaRecord_projects =
  "overlay: iNat grid, taxon_id 0, project_id 237729,229902";

export let gridLabel_allTaxaRecord_user1 =
  "overlay: iNat grid, taxon_id 0, user_id 222137";
export let gridLabel_allTaxaRecord_user2 =
  "overlay: iNat grid, taxon_id 0, user_id 677256";
export let gridLabel_allTaxaRecord_users =
  "overlay: iNat grid, taxon_id 0, user_id 222137,677256";

export let gridLabel_life_la_user1 =
  "overlay: iNat grid, taxon_id 48460, place_id 962, user_id 222137";

export let refreshBBoxLabel = "refresh bounding box";
export let basemapLabel_osm = "basemap: Open Street Map";
export let placeBBoxLabel = "place layer: Custom Boundary, 0";

export let gridLabel_life_la_sd_project1 =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, project_id 237729";
export let gridLabel_life_la_sd_projects =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, project_id 237729,229902";

export let gridLabel_oaks_la_sd_project1 =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, project_id 237729";
export let gridLabel_oaks_la_sd_projects =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, project_id 237729,229902";

export let gridLabel_life_la_project1 =
  "overlay: iNat grid, taxon_id 48460, place_id 962, project_id 237729";

export let gridLabel_life_la_project1_user1 =
  "overlay: iNat grid, taxon_id 48460, place_id 962, project_id 237729, user_id 222137";
export let gridLabel_oak_la_project1_user1 =
  "overlay: iNat grid, taxon_id 861036, place_id 962, project_id 237729, user_id 222137";

export let gridLabel_life_la_sd_project1_user1 =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, project_id 237729, user_id 222137";
export let gridLabel_oak_la_sd_project1_user1 =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, project_id 237729, user_id 222137";
export let gridLabel_life_la_sd_projects_user1 =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, project_id 237729,229902, user_id 222137";
export let gridLabel_oak_la_sd_projects_user1 =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, project_id 237729,229902, user_id 222137";

export let gridLabel_life_project1 =
  "overlay: iNat grid, taxon_id 48460, project_id 237729";
export let gridLabel_life_project1_user1 =
  "overlay: iNat grid, taxon_id 48460, project_id 237729, user_id 222137";

export let gridLabel_allTaxaRecord_la_project1 =
  "overlay: iNat grid, taxon_id 0, place_id 962, project_id 237729";
export let gridLabel_allTaxaRecord_la_project1_user1 =
  "overlay: iNat grid, taxon_id 0, place_id 962, project_id 237729, user_id 222137";

export let gridLabel_life_places_projects_user1 =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, project_id 237729,229902, user_id 222137";
export let gridLabel_oak_places_projects_user1 =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, project_id 237729,229902, user_id 222137";

export let gridLabel_life_places_resources =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829, project_id 237729,229902, user_id 222137,677256";
export let gridLabel_oaks_places_resources =
  "overlay: iNat grid, taxon_id 861036, place_id 962,829, project_id 237729,229902, user_id 222137,677256";

export let gridLabel_life_resource =
  "overlay: iNat grid, taxon_id 48460, place_id 962, project_id 237729, user_id 222137";

export let gridLabel_life_bbox_resources =
  "overlay: iNat grid, taxon_id 48460, project_id 237729,229902, user_id 222137,677256";
export let gridLabel_oaks_bbox_resources =
  "overlay: iNat grid, taxon_id 861036, project_id 237729,229902, user_id 222137,677256";

export let lifeBasic: NormalizediNatTaxon = {
  name: "Life",
  default_photo: "https://inat.com/photos/347064198/square.jpeg",
  preferred_common_name: "life",
  rank: "stateofmatter",
  id: 48460,
};

export function life(color = colors[0]) {
  return {
    ...lifeBasic,
    display_name: "Life",
    title: "Life",
    subtitle: "Life",
    color: color,
    observations_count: 10000,
  };
}

export let redOakBasic: NormalizediNatTaxon = {
  name: "Lobatae",
  default_photo: "https://inat.com/photos/149586607/square.jpg",
  preferred_common_name: "red oaks",
  rank: "section",
  id: 861036,
};

export function redOak(color = colors[1]) {
  return {
    ...redOakBasic,
    display_name: "Red Oaks",
    title: "Red Oaks",
    subtitle: "Lobatae",
    color: color,
    observations_count: 1000,
  };
}

export let monarchBasic: NormalizediNatTaxon = {
  name: "Danaus plexippus",
  default_photo: "https://inat.com/photos/61756746/square.jpg",
  preferred_common_name: "Monarch",
  matched_term: "mon",
  rank: "species",
  id: 48662,
};

export function monarch(color = colors[2]) {
  return {
    ...monarchBasic,
    display_name: "Monarch",
    title: "Monarch",
    subtitle: "Danaus plexippus",
    color: color,
    observations_count: 100,
  };
}

export const allTaxa = { ...allTaxaRecord, observations_count: 100000 };

export let losangeles: NormalizediNatPlace = {
  display_name: "Los Angeles County, US, CA",
  id: 962,
  name: "Los Angeles",
  geometry: losAngelesSearchApi.results[0].record.geometry_geojson,
  bounding_box: losAngelesSearchApi.results[0].record.bounding_box_geojson,
};

export let sandiego: NormalizediNatPlace = {
  id: 829,
  name: "San Diego",
  display_name: "San Diego County, CA, US",
  bounding_box: sandiegoSearchApi.results[0].record.bounding_box_geojson,
  geometry: sandiegoSearchApi.results[0].record.geometry_geojson,
};

export let refreshPlace: NormalizediNatPlace = {
  id: 0,
  name: "Custom Boundary",
  display_name: "Custom Boundary",
  bounding_box: {
    type: "Polygon",
    coordinates: [
      [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    ],
  },
};

export let refreshPlaceLA: NormalizediNatPlace = {
  id: 0,
  name: "Custom Boundary",
  display_name: "Custom Boundary",
  bounding_box: {
    type: "Polygon",
    coordinates: [
      [
        [-118.12500000000001, 34.30714385628804],
        [-118.12500000000001, 34.30714385628804],
        [-118.12500000000001, 34.30714385628804],
        [-118.12500000000001, 34.30714385628804],
      ],
    ],
  },
};

export let project_cnc1: NormalizediNatProject = {
  id: 237729,
  name: "City Nature Challenge 2025: Aotearoa New Zealand",
  slug: "city-nature-challenge-2025-aotearoa-new-zealand",
};

export let project_cnc2: NormalizediNatProject = {
  id: 229902,
  name: "City Nature Challenge 2025: Ōtautahi/Christchurch",
  slug: "city-nature-challenge-2025-otautahi-christchurch",
};

export let user1: NormalizediNatUser = {
  id: 222137,
  login: "reiner",
  name: "Reiner Richter",
};

export let user2: NormalizediNatUser = {
  id: 677256,
  login: "alanhorstmann",
  name: "Alan Horstmann",
};

export function setupMapAndStore() {
  let map = L.map("map", {
    center: [0, 0],
    zoom: 2,
    maxZoom: 19,
  });
  var layerControl = L.control.layers().addTo(map);
  let { OpenStreetMap } = getMapTiles();
  addLayerToMap(OpenStreetMap, map, layerControl, true);

  let dup = structuredClone(mapStore);
  let store: MapStore = {
    ...dup,
    map: { map: map, layerControl: layerControl },
  };

  return { map, layerControl, store };
}

export function expectEmpytMap(store: MapStore) {
  expect(store.inatApiParams).toStrictEqual(mapStore.inatApiParams);
  expect(store.selectedTaxa).toStrictEqual([]);
  expect(store.taxaMapLayers).toStrictEqual({});
  expect(store.selectedPlaces).toStrictEqual([]);
  expect(store.placesMapLayers).toStrictEqual({});
  expect(store.refreshMap.refreshMapButtonEl).toBeNull();
  expect(store.refreshMap.showRefreshMapButton).toBeFalsy();
  expect(store.refreshMap.layer).toBeNull();
}

export function expectNoTaxa(store: MapStore) {
  expect(store.selectedTaxa).toStrictEqual([]);
  expect(store.taxaMapLayers).toStrictEqual({});
}

export function expectAllTaxaRecord(store: MapStore, count = 0) {
  let taxa = structuredClone(allTaxa);
  if (count > 0) {
    taxa.observations_count = count;
  }
  expect(store.selectedTaxa).toStrictEqual([taxa]);
  expect(store.taxaMapLayers[0].length).toBe(3);
}

export function expectLifeTaxa(store: MapStore, count = 0, color = colors[0]) {
  let taxa = structuredClone(life());
  if (count > 0) {
    taxa.observations_count = count;
  }
  taxa.color = color;

  expect(store.selectedTaxa).toStrictEqual([taxa]);
  expect(Object.keys(store.taxaMapLayers)).toEqual([taxa.id.toString()]);
  expect(store.taxaMapLayers[taxa.id].length).toBe(4);
}

export function expectOakTaxa(store: MapStore, color = colors[1]) {
  let oak = redOak(color);
  expect(store.selectedTaxa).toStrictEqual([oak]);
  expect(Object.keys(store.taxaMapLayers)).toEqual([oak.id.toString()]);
  expect(store.taxaMapLayers[oak.id].length).toBe(4);
}

export function expectLifeOakTaxa(
  store: MapStore,
  count = [0, 0],
  customColors = [colors[0], colors[1]],
) {
  let taxa1 = life(customColors[0]);
  let taxa2 = redOak(customColors[1]);
  if (count[0] > 0) {
    taxa1.observations_count = count[0];
  }
  if (count[1] > 0) {
    taxa2.observations_count = count[1];
  }
  expect(store.selectedTaxa).toStrictEqual([taxa1, taxa2]);
  expect(Object.keys(store.taxaMapLayers)).toEqual([
    taxa1.id.toString(),
    taxa2.id.toString(),
  ]);
  expect(store.taxaMapLayers[taxa1.id].length).toBe(4);
  expect(store.taxaMapLayers[taxa2.id].length).toBe(4);
}

export function expectNoPlaces(store: MapStore) {
  expect(store.selectedPlaces).toStrictEqual([]);
  expect(store.placesMapLayers).toStrictEqual({});
}

export function expectNoRefresh(store: MapStore) {
  expect(store.refreshMap.layer).toBeNull();
}

export function expectLosAngelesPlace(store: MapStore, count = 0) {
  let place = structuredClone(losangeles);
  if (count > 0) {
    place.observations_count = count;
  }
  expect(store.selectedPlaces).toEqual([place]);
  expect(Object.keys(store.placesMapLayers)).toStrictEqual([
    place.id.toString(),
  ]);
  expect(store.placesMapLayers[place.id].length).toBe(1);
}

export function expectSanDiegoPlace(store: MapStore, count = 0) {
  let place = structuredClone(sandiego);
  if (count > 0) {
    place.observations_count = count;
  }
  expect(store.selectedPlaces).toEqual([place]);
  expect(Object.keys(store.placesMapLayers)).toStrictEqual([
    place.id.toString(),
  ]);
  expect(store.placesMapLayers[place.id].length).toBe(1);
}

export function expect_LA_SD_Place(store: MapStore, counts = [0, 0]) {
  let place1 = structuredClone(losangeles);
  if (counts[0] > 0) {
    place1.observations_count = counts[0];
  }
  let place2 = structuredClone(sandiego);
  if (counts[1] > 0) {
    place2.observations_count = counts[1];
  }

  expect(store.selectedPlaces).toStrictEqual([place1, place2]);
  expect(Object.keys(store.placesMapLayers)).toStrictEqual([
    sandiego.id.toString(),
    losangeles.id.toString(),
  ]);
  expect(store.placesMapLayers[losangeles.id].length).toBe(1);
  expect(store.placesMapLayers[sandiego.id].length).toBe(1);
}

export function expect_users(store: MapStore) {
  expect(store.selectedUsers).toEqual([user1, user2]);
}

export function expectRefreshPlace(store: MapStore, count = 0, type = "zero") {
  let place = structuredClone(refreshPlace);
  if (type !== "zero") {
    place = structuredClone(refreshPlaceLA);
  }
  if (count > 0) {
    place.observations_count = count;
  }
  expect(store.refreshMap.layer).toBeDefined();
  expect(store.selectedPlaces).toEqual([place]);
  expect(Object.keys(store.placesMapLayers)).toStrictEqual(["0"]);
  expect(store.placesMapLayers["0"].length).toBe(1);
}

export function expectNoProjects(store: MapStore) {
  expect(store.selectedProjects).toEqual([]);
}

export function expectProject1(store: MapStore) {
  expect(store.selectedProjects).toEqual([project_cnc1]);
}
export function expectProject2(store: MapStore) {
  expect(store.selectedProjects).toEqual([project_cnc2]);
}
export function expectProjects(store: MapStore) {
  expect(store.selectedProjects).toEqual([project_cnc1, project_cnc2]);
}

export function expectUser1(store: MapStore) {
  expect(store.selectedUsers).toEqual([user1]);
}
export function expectUser2(store: MapStore) {
  expect(store.selectedUsers).toEqual([user2]);
}
export function expectUsers(store: MapStore) {
  expect(store.selectedUsers).toEqual([user1, user2]);
}

export async function addResources(store: MapStore) {
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
    placeLabel_la,
    gridLabel_life_la,
  ]);
  let count = life().observations_count * 0.6;
  expectLifeTaxa(store, count);
  expectLosAngelesPlace(store, count);
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
    placeLabel_la,
    gridLabel_life_la_project1,
  ]);
  let count2 = life().observations_count * 0.6;
  expectLifeTaxa(store, count2);
  expectLosAngelesPlace(store, count2);
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

  await userSelectedHandler(user1, "user", store);

  expect(leafletVisibleLayers(store)).toStrictEqual([
    basemapLabel_osm,
    placeLabel_la,
    placeLabel_la,
    gridLabel_life_la_project1_user1,
  ]);
  expectLifeTaxa(store, count2);
  expectLosAngelesPlace(store, count2);
  expectProject1(store);
  expectUser1(store);
  expect(store.inatApiParams).toStrictEqual({
    taxon_id: life().id.toString(),
    colors: colors[0],
    place_id: losangeles.id.toString(),
    verifiable: true,
    spam: false,
    project_id: project_cnc1.id.toString(),
    user_id: user1.id.toString(),
  });

  expect(window.location.search).toBe(
    `?taxon_id=${life().id}&place_id=${losangeles.id}&project_id=${project_cnc1.id}` +
      `&user_id=${user1.id}&colors=${colorsEncoded[0]}&verifiable=true&spam=false`,
  );
}
