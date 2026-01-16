import L from "leaflet";
import type { Map, LatLngExpression } from "leaflet";
import { TerraDraw, TerraDrawRectangleMode } from "terra-draw";
import { TerraDrawLeafletAdapter } from "terra-draw-leaflet-adapter";

import type {
  AppStoreType,
  LngLatType,
  CoordinatesType,
  ObservationsApiParamsType,
  ObservationTilesSettingType,
  CustomGeoJSONType,
} from "../types/app.d.ts";
import { loggerUrl } from "./logger.ts";
import { square } from "../assets/icons.ts";

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

export function fitBoundsPlaces(appStore: AppStoreType) {
  let map = appStore.map.map;
  if (!map) return;
  if (
    appStore.selectedPlaces.length === 0 &&
    appStore.selectedProjects.length === 0
  )
    return;

  let placesLayers = appStore.selectedPlaces
    .filter((p) => p.bounding_box !== undefined)
    .map((place) => {
      return L.geoJSON(place.bounding_box);
    });

  let projectLayers = appStore.selectedProjects
    .filter((p) => p.bounding_box !== undefined)
    .map((place) => {
      return L.geoJSON(place.bounding_box);
    });

  let layers = placesLayers.concat(projectLayers);
  if (layers.length > 0) {
    map.fitBounds(L.featureGroup(layers).getBounds());
  }
}
/*
 coordinates: [[[-118, 32], [-118, 34], [-117, 34], [-117, 32], [-118, 32]]]

type: "Polygon"
*/

export function fitBoundsBBox(map: Map, lngLatCoors: LngLatType[]) {
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

export const getMapTiles = (): {
  [name: string]: ObservationTilesSettingType;
} => {
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
  tileObj: ObservationTilesSettingType,
  map: any,
  layerControl: any,
  checked = false,
) {
  loggerUrl(tileObj.url);

  let layer = L.tileLayer(tileObj.url, tileObj.options);
  if (checked) {
    layer.addTo(map);
  }
  layerControl.addBaseLayer(layer, tileObj.name);

  return layer;
}

export function addOverlayToMap(
  tileObj: ObservationTilesSettingType,
  map: any,
  layerControl: any,
  checked = false,
) {
  if (!tileObj) return;

  loggerUrl(tileObj.url);

  let layer = L.tileLayer(tileObj.url, tileObj.options);

  try {
    if (checked) {
      layer.addTo(map);
    }
    layerControl.addOverlay(layer, tileObj.options.control_name);
    return layer;
  } catch (error) {
    console.log("addOverlayToMap ERROR:", error);
  }
}

export function createDrawRectButton(
  appStore: AppStoreType,
): HTMLButtonElement | null {
  let buttonEl: HTMLButtonElement = null as unknown as HTMLButtonElement;
  let map = appStore.map.map;
  if (!map) return null;

  const DrawRect = L.Control.extend({
    onAdd: function (_map: Map) {
      buttonEl = L.DomUtil.create(
        "button",
        "leaflet-bar leaflet-control leaflet-control-draw-rect",
      );

      buttonEl.innerHTML = square;

      buttonEl.onclick = async function () {
        let terraDraw = appStore.map.terraDraw;
        if (!terraDraw) return;
        let mode = terraDraw.getMode();
        if (mode === "static") {
          buttonEl.classList.add("active");
          terraDraw.setMode("rectangle");
        } else {
          buttonEl.classList.remove("active");
          terraDraw.setMode("static");
        }
      };

      return buttonEl;
    },
    onRemove: function (_map: Map) {
      console.info("button onRemove");
    },
  });

  function drawRect(opts: any) {
    return new DrawRect(opts);
  }
  drawRect({ position: "topleft" }).addTo(map);

  return buttonEl;
}

export function flipLatLng(coordinates: CoordinatesType): CoordinatesType {
  return [coordinates[1], coordinates[0]];
}

export function renderBoundingBoxLayer(
  map: Map,
  lngLatCoors: LngLatType[],
  options = {
    fillColor: "none",
    weight: 1,
    layer_description: "bounding box",
  },
) {
  let latLngCoors = lngLatCoors.map(flipLatLng);
  let layer = L.polygon(latLngCoors, options);
  layer.addTo(map);
  return layer;
}

// turn iNat nelng,nelat,swlng,swlat into gemetry that leaflet understands
export function convertiNatBBoxToLngLat(
  params: ObservationsApiParamsType,
): LngLatType[] | undefined {
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
): LngLatType[] {
  return [
    [nelng, nelat],
    [nelng, swlat],
    [swlng, swlat],
    [swlng, nelat],
  ];
}

export function convertLnLatToiNatBBox(coordinates: LngLatType[]) {
  let nelng = coordinates[2][0];
  let swlng = coordinates[0][0];
  let nelat = coordinates[0][1];
  let swlat = coordinates[1][1];

  return { nelng, swlng, nelat, swlat };
}

export function removeMap(appStore: AppStoreType) {
  if (appStore.map.map) {
    // save map bounds before switching views so app can return to this map location
    appStore.map.bounds = appStore.map.map.getBounds();

    // remove map and event listeners
    appStore.map.map.remove();
    appStore.map.map = null;
  }

  if (appStore.map.layerControl) {
    appStore.map.layerControl.remove();
    appStore.map.layerControl = null;
  }

  if (appStore.map.terraDraw) {
    appStore.map.terraDraw.stop();
  }
}

export function setupTerraDraw(map: Map) {
  return new TerraDraw({
    adapter: new TerraDrawLeafletAdapter({
      lib: L,
      map,
    }),
    modes: [new TerraDrawRectangleMode()],
  });
}

export function addiNatBBoxToMap(appStore: AppStoreType) {
  let map = appStore.map.map;
  if (!map) return;

  // convert bounding box
  let lngLatCoors = convertiNatBBoxToLngLat(appStore.observationsApiParams);
  if (!lngLatCoors) return;

  // draw bounding box
  let layer = renderBoundingBoxLayer(map, lngLatCoors) as any;
  // appStore.bbox = { layer: layer };
  appStore.placesMapLayers["0"] = [layer as unknown as CustomGeoJSONType];
}
