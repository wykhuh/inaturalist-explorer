import L from "leaflet";
import type { Map, LatLngExpression } from "leaflet";

import type {
  TileSettings,
  MapStore,
  LeafletBounds,
  LngLat,
  Coordinates,
  iNatApiParams,
} from "../types/app.d.ts";
import { refreshBoundingBox } from "./data_utils.ts";

export function getMonthName(month: number) {
  // https://reactgo.com/convert-month-number-to-name-js/

  // this regex handles both numbers string numbers
  if (/^[0-9]+$/.test(month.toString())) {
    const date = new Date();
    // set date to middle of the month to avoid weird conversion for start/end
    // of the month
    date.setDate(15);
    date.setMonth(month);
    return date.toLocaleString("default", { month: "short" });
  } else {
    return month;
  }
}

export function fitBoundsPoints(coordinates: any, map: Map) {
  if (coordinates.length > 0) {
    map.fitBounds(coordinates);
  }
}

export function fitBoundsPlaces(appStore: MapStore) {
  let map = appStore.map.map;
  if (!map) return;
  if (appStore.selectedPlaces.length === 0) return;

  let layers = appStore.selectedPlaces
    .filter((p) => p.bounding_box !== undefined)
    .map((place) => {
      return L.geoJSON(place.bounding_box);
    });
  if (layers.length > 0) {
    map.fitBounds(L.featureGroup(layers).getBounds());
  }
}
/*
 coordinates: [[[-118, 32], [-118, 34], [-117, 34], [-117, 32], [-118, 32]]]

type: "Polygon"
*/

export function fitBoundsBBox(map: Map, lngLatCoors: LngLat[]) {
  let latLngCoors = lngLatCoors.map(flipLatLng);
  let bounds = L.latLngBounds(latLngCoors);

  map.fitBounds(bounds);
}

export function isObservationInMap(observation: any, map: Map) {
  let currentBounds = map.getBounds();
  return currentBounds.contains(
    L.latLng(observation.latitude, observation.longitude),
  );
}

export function areAllPointsInMap(coordinates: LatLngExpression[], map: Map) {
  // determine if all the markers are inside the map bounding box
  if (coordinates.length > 0) {
    let currentBounds = map.getBounds();
    let observationBounds = L.latLngBounds(coordinates);
    return currentBounds.contains(observationBounds);
  }
}

export const getMapTiles = (): { [name: string]: TileSettings } => {
  return {
    OpenStreetMap: {
      name: "Open Street Map",
      type: "basemap",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      options: {
        layer_description: "basemap: Open Street Map",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.',
        minZoom: 0,
        maxZoom: 19,
      },
    },
    AlidadeSmooth: {
      name: "Alidade Smooth",
      type: "basemap",
      url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
      options: {
        layer_description: "basemap: Alidade Smooth",
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        minZoom: 0,
        maxZoom: 20,
      },
    },
    AlidadeSmoothDark: {
      name: "Alidade Smooth Dark",
      type: "basemap",
      url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
      options: {
        layer_description: "basemap: Alidade Smooth Dark",
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        minZoom: 0,
        maxZoom: 20,
      },
    },
    StadiaOutdoors: {
      name: "Stadia Outdoors",
      type: "basemap",
      url: "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png",
      options: {
        layer_description: "basemap: Stadia Outdoors",
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        minZoom: 0,
        maxZoom: 20,
      },
    },
    StamenTerrain: {
      name: "Stamen Terrain",
      type: "basemap",
      url: "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png",
      options: {
        layer_description: "basemap: Stamen Terrain",
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        minZoom: 0,
        maxZoom: 20,
      },
    },
    StamenWatercolor: {
      name: "Stamen Watercolor",
      type: "basemap",
      url: "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
      options: {
        layer_description: "basemap: Stamen Watercolor",
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        minZoom: 0,
        maxZoom: 16,
      },
    },
    OSMBright: {
      name: "OSM Bright",
      type: "basemap",
      url: "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}.jpg",
      options: {
        layer_description: "basemap: OSM Bright",
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        minZoom: 0,
        maxZoom: 20,
      },
    },

    USGSTopo: {
      name: "USGS Topo",
      type: "basemap",
      url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
      options: {
        layer_description: "basemap: USGS Topo",
        attribution:
          'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
        minZoom: 0,
        maxZoom: 16,
      },
    },
    USGSImagery: {
      name: "USGS Imagery",
      type: "basemap",
      url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
      options: {
        layer_description: "basemap: USGS Imagery",
        attribution:
          'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
        minZoom: 0,
        maxZoom: 16,
      },
    },
    OpenTopo: {
      name: "Open Topo",
      type: "basemap",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      options: {
        layer_description: "basemap: Open Topo",
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        minZoom: 0,
        maxZoom: 17,
      },
    },
    GBIFClassic: {
      name: "GBIF Classic",
      type: "basemap",
      url: "https://tile.gbif.org/3857/omt/{z}/{x}/{y}@1x.png?style=gbif-classic",
      options: {
        layer_description: "basemap: GBIF Classic",
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://www.openmaptiles.org/copyright">OpenMapTiles</a>.',
        minZoom: 0,
        maxZoom: 21,
      },
    },
    GBIFLight: {
      name: "GBIF Light",
      type: "basemap",
      url: "https://tile.gbif.org/3857/omt/{z}/{x}/{y}@1x.png?style=gbif-light",
      options: {
        layer_description: "basemap: GBIF light",
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://www.openmaptiles.org/copyright">OpenMapTiles</a>.',
        minZoom: 0,
        maxZoom: 21,
      },
    },
    GBIFGeyser: {
      name: "GBIF Geyser",
      type: "basemap",
      url: "https://tile.gbif.org/3857/omt/{z}/{x}/{y}@1x.png?style=gbif-geyser",
      options: {
        layer_description: "basemap: GBIF Geyser",
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://www.openmaptiles.org/copyright">OpenMapTiles</a>.',
        minZoom: 0,
        maxZoom: 21,
      },
    },
    GBIFBright: {
      name: "GBIF Bright",
      type: "basemap",
      url: "https://tile.gbif.org/3857/omt/{z}/{x}/{y}@1x.png?style=osm-bright",
      options: {
        layer_description: "basemap: GBIF Bright",
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://www.openmaptiles.org/copyright">OpenMapTiles</a>.',
        minZoom: 0,
        maxZoom: 21,
      },
    },
    GBIFNatural: {
      name: "GBIF Natural",
      type: "basemap",
      url: "https://tile.gbif.org/3857/omt/{z}/{x}/{y}@1x.png?style=gbif-natural",
      options: {
        layer_description: "basemap: GBIF Natural",
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://www.openmaptiles.org/copyright">OpenMapTiles</a>.',
        minZoom: 0,
        maxZoom: 21,
      },
    },
  };
};

export function addLayerToMap(
  tileObj: TileSettings,
  map: any,
  layerControl: any,
  checked = false,
) {
  // console.log(tileObj.url); // keep

  let layer = L.tileLayer(tileObj.url, tileObj.options);
  if (checked) {
    layer.addTo(map);
  }
  layerControl.addBaseLayer(layer, tileObj.name);

  return layer;
}

export function addOverlayToMap(
  tileObj: TileSettings,
  map: any,
  layerControl: any,
  taxonName: string,
  checked = false,
) {
  // console.log(tileObj.url); // keep

  let layer = L.tileLayer(tileObj.url, tileObj.options);
  if (checked) {
    layer.addTo(map);
  }
  layerControl.addOverlay(layer, `${taxonName} ${tileObj.name}`);
  return layer;
}

// convert Leaflet bounds Object into format that works with iNaturalist API
export function formatiNatAPIBoundingBoxParams(bounds: any) {
  return {
    nelat: bounds._northEast.lat,
    nelng: bounds._northEast.lng,
    swlat: bounds._southWest.lat,
    swlng: bounds._southWest.lng,
  };
}

export function createRefreshMapButton(
  appStore: MapStore,
): HTMLButtonElement | null {
  let buttonEl: HTMLButtonElement = null as unknown as HTMLButtonElement;
  let map = appStore.map.map;
  if (!map) return null;

  const RefreshMap = L.Control.extend({
    onAdd: function (_map: Map) {
      buttonEl = L.DomUtil.create(
        "button",
        "leaflet-bar leaflet-control leaflet-control-refresh-map",
      );

      buttonEl.textContent = "Redo search in map";
      buttonEl.hidden = true;

      buttonEl.onclick = function () {
        appStore.refreshMap.showRefreshMapButton = false;
        if (buttonEl) {
          buttonEl.hidden = true;
        }

        refreshBoundingBox(appStore);
      };

      return buttonEl;
    },
    onRemove: function (_map: Map) {
      console.log("button onRemove"); // keep
    },
  });

  let refreshmap = function (opts: any) {
    return new RefreshMap(opts);
  };
  refreshmap({ position: "topleft" }).addTo(map);

  return buttonEl;
}

export function flipLatLng(coordinates: Coordinates): Coordinates {
  return [coordinates[1], coordinates[0]];
}

export function getBoundingBox(coordinates: LngLat[]) {
  let latLngCoors = coordinates.map(flipLatLng);
  return L.latLngBounds(latLngCoors);
}

export function getAndDrawMapBoundingBox(
  map: Map,
  options = {
    fillColor: "none",
    weight: 1,
    layer_description: "refresh bounding box",
  },
) {
  let bounds = map.getBounds() as unknown as LeafletBounds;
  let lngLatCoors = convertBoundsObjectToLngLat(bounds);
  let layer = drawMapBoundingBox(map, lngLatCoors, options);
  return { layer, lngLatCoors };
}

export function drawMapBoundingBox(
  map: Map,
  lngLatCoors: LngLat[],
  options = {
    fillColor: "none",
    weight: 1,
    layer_description: "refresh bounding box",
  },
) {
  let latLngCoors = lngLatCoors.map(flipLatLng);
  let layer = L.polygon(latLngCoors, options);
  layer.addTo(map);
  return layer;
}

export function convertBoundsObjectToLngLat(bounds: LeafletBounds): LngLat[] {
  return formatBoundingBox(
    bounds._northEast.lng,
    bounds._northEast.lat,
    bounds._southWest.lng,
    bounds._southWest.lat,
  );
}

export function convertParamsBBoxToLngLat(
  params: iNatApiParams,
): LngLat[] | undefined {
  const { nelng, nelat, swlng, swlat } = params;
  if (nelng === undefined) return;
  if (nelat === undefined) return;
  if (swlng === undefined) return;
  if (swlat === undefined) return;

  return formatBoundingBox(
    Number(nelng),
    Number(nelat),
    Number(swlng),
    Number(swlat),
  );
}

function formatBoundingBox(
  nelng: number,
  nelat: number,
  swlng: number,
  swlat: number,
): LngLat[] {
  return [
    [nelng, nelat],
    [nelng, swlat],
    [swlng, swlat],
    [swlng, nelat],
  ];
}
