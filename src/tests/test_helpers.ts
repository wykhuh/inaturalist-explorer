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
} from "../types/app";
import { mapStore } from "../lib/store.ts";
import {
  losAngelesSearchPlaces,
  sandiegoSearchPlaces,
} from "./fixtures/inatApi.ts";
import { allTaxaRecord } from "../lib/inat_data.ts";
import { loggerUrl } from "../lib/logger.ts";

export function createMockServer() {
  const handlers = [
    http.get("https://api.inaturalist.org/v1/grid*", async (_args) => {
      loggerUrl("request.url", _args.request.url);
      return HttpResponse.json({ id: "abc-123456" });
    }),
    http.get("https://api.inaturalist.org/v1/taxa/48460", async (_args) => {
      let data = {
        results: [
          {
            name: "Life",
            default_photo: {
              square_url:
                "https://inaturalist-open-data.s3.amazonaws.com/photos/347064198/square.jpeg",
            },
            preferred_common_name: "life",
            matched_term: "life",
            rank: "stateofmatter",
            id: 48460,
          },
        ],
      };
      return HttpResponse.json(data);
    }),
    http.get("https://api.inaturalist.org/v1/taxa/861036", async (_args) => {
      let data = {
        results: [
          {
            name: "Lobatae",
            default_photo: {
              square_url: "https://inat.com/photos/149586607/square.jpg",
            },
            preferred_common_name: "red oaks",
            matched_term: "xxx",
            rank: "section",
            id: 861036,
          },
        ],
      };
      return HttpResponse.json(data);
    }),
    http.get("https://api.inaturalist.org/v1/places/962", async (_args) => {
      let data = {
        results: [
          {
            bounding_box_geojson:
              losAngelesSearchPlaces.results[0].record.bounding_box_geojson,
            geometry_geojson:
              losAngelesSearchPlaces.results[0].record.geometry_geojson,
            name: "Los Angeles",
            display_name: "Los Angeles County, US, CA",
            id: 962,
          },
        ],
      };
      return HttpResponse.json(data);
    }),
    http.get("https://api.inaturalist.org/v1/places/829", async (_args) => {
      let data = {
        results: [
          {
            bounding_box_geojson:
              sandiegoSearchPlaces.results[0].record.bounding_box_geojson,
            geometry_geojson:
              sandiegoSearchPlaces.results[0].record.geometry_geojson,
            name: "San Diego",
            display_name: "San Diego County, CA, US",
            id: 829,
          },
        ],
      };
      return HttpResponse.json(data);
    }),
    http.get(
      "https://api.inaturalist.org/v1/projects/237729",
      async (_args) => {
        let data = {
          results: [
            {
              id: 237729,
              title: "City Nature Challenge 2025: Aotearoa New Zealand",
              slug: "city-nature-challenge-2025-aotearoa-new-zealand",
            },
          ],
        };
        return HttpResponse.json(data);
      },
    ),
    http.get(
      "https://api.inaturalist.org/v1/projects/229902",
      async (_args) => {
        let data = {
          results: [
            {
              id: 229902,
              title: "City Nature Challenge 2025: Ōtautahi/Christchurch",
              slug: "city-nature-challenge-2025-otautahi-christchurch",
            },
          ],
        };
        return HttpResponse.json(data);
      },
    ),
    http.get("https://api.inaturalist.org/v2/observations*", async (_args) => {
      loggerUrl("request.url", _args.request.url);
      return HttpResponse.json({ total_results: 456789, results: [] });
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

export let refreshBBoxLabel = "refresh bounding box";
export let basemapLabel_osm = "basemap: Open Street Map";

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

export let gridLabel_life_project1 =
  "overlay: iNat grid, taxon_id 48460, project_id 237729";

export let gridLabel_allTaxaRecord_la_project1 =
  "overlay: iNat grid, taxon_id 0, place_id 962, project_id 237729";

export let lifeBasic: NormalizediNatTaxon = {
  name: "Life",
  default_photo:
    "https://inaturalist-open-data.s3.amazonaws.com/photos/347064198/square.jpeg",
  preferred_common_name: "life",
  matched_term: "Life",
  rank: "stateofmatter",
  id: 48460,
};

export function life(color = colors[0]) {
  return {
    ...lifeBasic,
    display_name: "life",
    title: "life",
    subtitle: "Life",
    color: color,
    observations_count: 456789,
  };
}

export let redOakBasic: NormalizediNatTaxon = {
  name: "Lobatae",
  default_photo: "https://inat.com/photos/149586607/square.jpg",
  preferred_common_name: "red oaks",
  matched_term: "Lobatae",
  rank: "section",
  id: 861036,
};

export function redOak(color = colors[1]) {
  return {
    ...redOakBasic,
    display_name: "red oaks",
    title: "red oaks",
    subtitle: "Lobatae",
    color: color,
    observations_count: 456789,
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
    observations_count: 456789,
  };
}

export let losangeles: NormalizediNatPlace = {
  display_name: "Los Angeles County, US, CA",
  id: 962,
  name: "Los Angeles",
  bounding_box: {
    type: "Polygon",
    coordinates: [
      [
        [-118.951721, 32.75004],
        [-118.951721, 34.823302],
        [-117.646374, 34.823302],
        [-117.646374, 32.75004],
        [-118.951721, 32.75004],
      ],
    ],
  },
};

export let sandiego: NormalizediNatPlace = {
  id: 829,
  name: "San Diego",
  display_name: "San Diego County, CA, US",
  bounding_box: {
    type: "Polygon",
    coordinates: [
      [
        [-117.611081, 32.528832],
        [-117.611081, 33.505025],
        [-116.08094, 33.505025],
        [-116.08094, 32.528832],
        [-117.611081, 32.528832],
      ],
    ],
  },
};

export let refreshPlace = {
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

export let refreshPlaceLA = {
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
  expect(store.color).toEqual("");
}

export function expectNoTaxa(store: MapStore) {
  expect(store.selectedTaxa).toStrictEqual([]);
  expect(store.taxaMapLayers).toStrictEqual({});
}

export function expectAllTaxaRecord(store: MapStore) {
  expect(store.selectedTaxa).toStrictEqual([allTaxaRecord]);
  expect(store.taxaMapLayers[0].length).toBe(3);
}

export function expectLifeTaxa(store: MapStore, color = colors[0]) {
  let lifeTemp = life(color);
  expect(store.selectedTaxa).toStrictEqual([lifeTemp]);
  expect(Object.keys(store.taxaMapLayers)).toEqual([lifeTemp.id.toString()]);
  expect(store.taxaMapLayers[lifeTemp.id].length).toBe(4);
  expect(store.color).toBe(color);
}

export function expectOakTaxa(store: MapStore, color = colors[1]) {
  let oak = redOak(color);
  expect(store.selectedTaxa).toStrictEqual([oak]);
  expect(Object.keys(store.taxaMapLayers)).toEqual([oak.id.toString()]);
  expect(store.taxaMapLayers[oak.id].length).toBe(4);
  expect(store.color).toBe(color);
}

export function expectLifeOakTaxa(
  store: MapStore,
  customColors = [colors[0], colors[1]],
) {
  let lifeTemp = life(customColors[0]);
  let oakTemp = redOak(customColors[1]);

  expect(store.selectedTaxa).toStrictEqual([lifeTemp, oakTemp]);
  expect(Object.keys(store.taxaMapLayers)).toEqual([
    lifeTemp.id.toString(),
    oakTemp.id.toString(),
  ]);
  expect(store.taxaMapLayers[lifeTemp.id].length).toBe(4);
  expect(store.taxaMapLayers[oakTemp.id].length).toBe(4);

  expect(store.color).toBe(customColors[1]);
}

export function expectNoPlaces(store: MapStore) {
  expect(store.selectedPlaces).toStrictEqual([]);
  expect(store.placesMapLayers).toStrictEqual({});
}

export function expectNoRefresh(store: MapStore) {
  expect(store.refreshMap.refreshMapButtonEl).toBeNull();
  expect(store.refreshMap.showRefreshMapButton).toBeFalsy();
  expect(store.refreshMap.layer).toBeNull();
}

export function expectLosAngelesPlace(store: MapStore) {
  expect(store.selectedPlaces).toEqual([losangeles]);
  expect(Object.keys(store.placesMapLayers)).toStrictEqual([
    losangeles.id.toString(),
  ]);
  expect(store.placesMapLayers[losangeles.id].length).toBe(1);
}

export function expectSanDiegoPlace(store: MapStore) {
  expect(store.selectedPlaces).toEqual([sandiego]);
  expect(store.placesMapLayers).not.toBeUndefined();
  expect(Object.keys(store.placesMapLayers)).toStrictEqual([
    sandiego.id.toString(),
  ]);
  expect(store.placesMapLayers[sandiego.id].length).toBe(1);
}

export function expect_LA_SD_Place(store: MapStore) {
  expect(store.selectedPlaces).toEqual([losangeles, sandiego]);
  expect(Object.keys(store.placesMapLayers)).toStrictEqual([
    sandiego.id.toString(),
    losangeles.id.toString(),
  ]);
  expect(store.placesMapLayers[losangeles.id].length).toBe(1);
  expect(store.placesMapLayers[sandiego.id].length).toBe(1);
}

export function expectRefreshPlace(store: MapStore, type = "zero") {
  let place: any = refreshPlace;
  if (type !== "zero") {
    place = refreshPlaceLA;
  }
  expect(store.refreshMap.layer).toBeDefined();
  expect(store.refreshMap.showRefreshMapButton).toBeFalsy();
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
