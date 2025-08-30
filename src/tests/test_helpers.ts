import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import L from "leaflet";
import { expect } from "vitest";

import { addLayerToMap, getMapTiles } from "../lib/map_utils";
import type {
  MapStore,
  NormalizediNatPlace,
  NormalizediNatTaxon,
} from "../types/app";
import { mapStore } from "../lib/store.ts";
import { losAngelesSearchPlaces } from "./fixtures/inatApi.ts";

export function createMockServer() {
  const handlers = [
    http.get("https://api.inaturalist.org/v1/grid*", async (_args) => {
      // console.log("request.url", _args.request.url);
      return HttpResponse.json({ id: "abc-123" });
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
    http.get("https://api.inaturalist.org/v2/observations*", async (_args) => {
      // console.log("request.url", _args.request.url);
      return HttpResponse.json({ total_results: 123, results: [] });
    }),

    http.get("*", async (_args) => {
      console.error("!! request.url !!", _args.request.url);
      return HttpResponse.json({});
    }),
  ];

  const server = setupServer(...handlers);

  return server;
}

export let colors = ["#4477aa", "#66ccee"];

export let placeLabel_la = "place layer: Los Angeles, 962";
export let placeLabel_sd = "place layer: San Diego, 829";

export let gridLabel_life = "overlay: iNat grid, taxon_id 48460";
export let gridLabel_oaks = "overlay: iNat grid, taxon_id 861036";
export let gridLabel_life_la =
  "overlay: iNat grid, taxon_id 48460, place_id 962";
export let gridLabel_life_sd =
  "overlay: iNat grid, taxon_id 48460, place_id 829";
export let gridLabel_life_la_sd =
  "overlay: iNat grid, taxon_id 48460, place_id 962,829";

export let refreshBBoxLabel = "refresh bounding box";
export let basemapLabel_osm = "basemap: Open Street Map";

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
    observations_count: 123,
  };
}

export let redOakBasic: NormalizediNatTaxon = {
  name: "Lobatae",
  default_photo: "https://inat.com/photos/149586607/square.jpg",
  preferred_common_name: "red oaks",
  matched_term: "red oaks",
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
    observations_count: 123,
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
  expect(store.inatApiParams).toStrictEqual({});
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
  expect(store.placesMapLayers).not.toBeUndefined();
}

export function expectSanDiegoPlace(store: MapStore) {
  expect(store.selectedPlaces).toEqual([sandiego]);
  expect(store.placesMapLayers).not.toBeUndefined();
}

export function expectRefreshPlace(store: MapStore, type = "zero") {
  let place: any = refreshPlace;
  if (type !== "zero") {
    place = refreshPlaceLA;
  }
  expect(store.refreshMap.layer).toBeDefined();
  expect(store.refreshMap.showRefreshMapButton).toBeFalsy();
  expect(store.selectedPlaces).toEqual([place]);
  expect(store.placesMapLayers).not.toBeUndefined();
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
