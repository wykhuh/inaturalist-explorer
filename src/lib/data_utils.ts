import L from "leaflet";

import type {
  NormalizediNatTaxon,
  MapStore,
  iNatApiParams,
  CustomLayerOptions,
  CustomPolygon,
  CustomLayer,
  CustomGeoJSON,
  LatLng,
} from "../types/app";
import {
  addOverlayToMap,
  convertParamsBBoxToLngLat,
  drawMapBoundingBox,
  formatiNatAPIBoundingBoxParams,
  getAndDrawMapBoundingBox,
  getBoundingBox,
  zoomBBox,
} from "./map_utils.ts";
import { displayJson, updateUrl } from "./utils.ts";
import {
  getiNatMapTiles,
  getiNatObservationsTotal,
  getPlaceById,
  getTaxonById,
} from "./inat_api.ts";
import { renderTaxaList, renderPlacesList } from "./autocomplete_utils.ts";
import type { Map } from "leaflet";
import type { PlacesResult, TaxaResult } from "../types/inat_api";

let bboxPlace = {
  id: 0,
  name: "Custom Boundary",
  display_name: "Custom Boundary",
};

// called when user clicks refresh map button
export async function refreshiNatMapLayers(
  appStore: MapStore,
  placeId: number | undefined = undefined,
) {
  let map = appStore.map.map;
  let layerControl = appStore.map.layerControl;

  if (map == null) return;
  if (layerControl == null) return;

  // remove old refresh box
  removeRefreshBBox(appStore, map);

  // remove old places
  removePlacesFromStoreAndMap(appStore);

  // create bounding box using the boundaries of the map
  let refreshLayer = getAndDrawMapBoundingBox(map);
  appStore.refreshMap = {
    ...appStore.refreshMap,
    layer: refreshLayer as CustomPolygon,
  };

  // save place to store
  appStore.selectedPlaces = bboxPlace;
  appStore.placesMapLayers = refreshLayer as unknown as CustomGeoJSON;

  renderPlacesList(appStore);

  let bbox = map.getBounds();
  let inatBbox = formatiNatAPIBoundingBoxParams(bbox);

  // get new map tiles if there are selectedTaxa
  if (appStore.selectedTaxa.length > 0) {
    for await (const taxon of appStore.selectedTaxa) {
      removeOneTaxonFromMap(appStore, taxon.id);

      appStore.inatApiParams = {
        ...appStore.inatApiParams,
        ...inatBbox,
        taxon_id: taxon.id,
        color: taxon.color,
      };
      if (placeId) {
        appStore.inatApiParams.place_id = placeId;
      }

      await fetchiNatMapData(taxon, appStore);
    }
    // if no selectedTaxa, add bounding box to inatApiParams
  } else {
    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      ...inatBbox,
    };
  }
  updateUrl(window.location, appStore);
}

// called when user deletes a taxon
export function removeTaxon(taxonId: number, appStore: MapStore) {
  removeOneTaxonFromStoreAndMap(appStore, taxonId);

  renderTaxaList(appStore);
  updateUrl(window.location, appStore);
}

// called when user deletes a place
export function removePlace(appStore: MapStore) {
  removeTaxaFromStoreAndMap(appStore);
  removePlacesFromStoreAndMap(appStore);

  renderTaxaList(appStore);
  renderPlacesList(appStore);
  updateUrl(window.location, appStore);
}

// called when user select taxa or place
export async function fetchiNatMapData(
  taxonObj: NormalizediNatTaxon,
  appStore: MapStore,
) {
  let map = appStore.map.map;
  let layerControl = appStore.map.layerControl;
  if (map == null) return;
  if (layerControl == null) return;
  // console.log(">> fetchiNatMapData", taxonObj.id);

  // get observations count
  let params: iNatApiParams = {
    ...appStore.inatApiParams,
    per_page: 0,
  };
  let count = await getiNatObservationsTotal(params);
  taxonObj.observations_count = count;

  updateSelectedTaxaProxy(appStore, taxonObj);

  // fetch iNaturalist map layers
  let { iNatGrid, iNatHeatmap, iNatTaxonRange, iNatPoint } = getiNatMapTiles(
    taxonObj.id,
    appStore.inatApiParams,
  );

  // add layers to layer control
  let title = taxonObj.display_name;
  if (!title) return;
  let iNatGridLayer = addOverlayToMap(iNatGrid, map, layerControl, title, true);
  let iNatPointLayer = addOverlayToMap(iNatPoint, map, layerControl, title);
  let iNatHeatmapLayer = addOverlayToMap(iNatHeatmap, map, layerControl, title);
  let iNatTaxonRangeLayer = addOverlayToMap(
    iNatTaxonRange,
    map,
    layerControl,
    title,
  );

  // save layers to store sothe app can delete them later on
  appStore.taxaMapLayers = {
    ...appStore.taxaMapLayers,
    [taxonObj.id]: [
      iNatGridLayer,
      iNatPointLayer,
      iNatHeatmapLayer,
      iNatTaxonRangeLayer,
    ],
  };
}

export function updateSelectedTaxaProxy(
  appStore: MapStore,
  taxonObj: NormalizediNatTaxon,
) {
  // console.log(">> updateSelectedTaxaProxy", taxonObj.id);

  let temp = [];
  let ids: number[] = [];

  appStore.selectedTaxa.forEach((selectedTaxon) => {
    // update existing taxon
    if (selectedTaxon.id === taxonObj.id) {
      temp.push(taxonObj);
      // keep existing taxon
    } else {
      temp.push(selectedTaxon);
    }
    ids.push(selectedTaxon.id);
  });

  // add new taxon
  if (!ids.includes(taxonObj.id)) {
    temp.push(taxonObj);
  }

  appStore.selectedTaxa = temp;
}

function removeOneTaxonFromStoreAndMap(appStore: MapStore, taxonId: number) {
  removeOneTaxonFromMap(appStore, taxonId);

  delete appStore.inatApiParams.taxon_id;

  appStore.selectedTaxa = appStore.selectedTaxa.filter(
    (taxon) => taxon.id !== taxonId,
  );
}

export function removeOneTaxonFromMap(appStore: MapStore, taxonId: number) {
  if (!appStore.taxaMapLayers) return;
  let mapLayers = appStore.taxaMapLayers[taxonId];
  let layerControl = appStore.map.layerControl;
  if (!layerControl) return;
  if (!mapLayers) return;

  mapLayers.forEach((layer) => {
    // remove layer from layer control
    layerControl.removeLayer(layer);
    // remove layer from map
    layer.remove();
  });

  delete appStore.taxaMapLayers[taxonId];
}

function removeTaxaFromStoreAndMap(appStore: MapStore) {
  let layerControl = appStore.map.layerControl;
  if (!layerControl) return;

  // remove from map
  Object.values(appStore.taxaMapLayers).forEach((taxaLayers) => {
    taxaLayers.forEach((layer) => {
      // remove layer from layer control
      layerControl.removeLayer(layer);
      // remove layer from map
      layer.remove();
    });
  });

  // remove from store
  delete appStore.inatApiParams.taxon_id;
  appStore.selectedTaxa = [];
  appStore.taxaMapLayers = {};
}

function removePlacesFromStoreAndMap(appStore: MapStore) {
  let placesMapLayers = appStore.placesMapLayers;
  if (!placesMapLayers) return;

  appStore.map.layerControl?.removeLayer(placesMapLayers);

  // remove from map
  placesMapLayers.remove();

  appStore.refreshMap.layer = null;

  // remove from store
  appStore.placesMapLayers = undefined;
  delete appStore.inatApiParams.place_id;
  delete appStore.inatApiParams.nelat;
  delete appStore.inatApiParams.nelng;
  delete appStore.inatApiParams.swlat;
  delete appStore.inatApiParams.swlng;
  appStore.selectedPlaces = undefined;
}

function removeRefreshBBox(appStore: MapStore, map: Map) {
  if (appStore.refreshMap.layer) {
    appStore.refreshMap.layer.removeFrom(map);
  }
}

export function formatTaxonName(
  item: NormalizediNatTaxon,
  inputValue: string,
  includeMatchedTerm = true,
) {
  let hasCommonName = true;
  let title = item.preferred_common_name;
  let titleAriaLabel = "taxon common name";
  let subtitle;
  let subtitleAriaLabel;

  if (title && item.name) {
    subtitle = item.name;
    subtitleAriaLabel = "taxon scientific name";
    if (
      includeMatchedTerm &&
      !title.toLowerCase().includes(inputValue.toLowerCase()) &&
      !subtitle.toLowerCase().includes(inputValue.toLowerCase())
    ) {
      title += ` (${item.matched_term})`;
    }
  } else {
    hasCommonName = false;
    title = item.name;
    titleAriaLabel = "taxon scientific name";
  }

  return { title, titleAriaLabel, subtitle, subtitleAriaLabel, hasCommonName };
}

export function leafletVisibleLayers(
  appStore: MapStore,
  log = false,
  strict = false,
) {
  let layer_descriptions: any[] = [];
  if (appStore.map.map) {
    appStore.map.map.eachLayer((lay) => {
      let layer = lay as unknown as CustomLayer;
      let options = layer.options as CustomLayerOptions;

      if (options.layer_description) {
        if (layer._path || layer._container || !strict) {
          if (log) {
            console.log(">>>", Object.keys(layer));
          }
          layer_descriptions.push(options.layer_description);
        } else if (log) {
          console.log("?????", Object.keys(layer));
        }
      } else if (log) {
        console.log("???", Object.keys(layer));
      }
    });
  }

  return layer_descriptions;
}

export async function initApp(appStore: MapStore, urlData: MapStore) {
  let map = appStore.map.map;
  if (!map) return;

  // get taxa data, optional place data, optional bounding box
  if (urlData.selectedTaxa && urlData.selectedTaxa.length > 0) {
    for await (const urlDataTaxon of urlData.selectedTaxa) {
      let taxonData = await getTaxonById(urlDataTaxon.id);
      if (!taxonData) {
        continue;
      }
      await processTaxonData(taxonData, appStore, urlData);
    }
    renderTaxaList(appStore);
    renderPlacesList(appStore);
    // get place data only
  } else if (urlData.selectedPlaces && urlData.selectedPlaces.id !== 0) {
    appStore.inatApiParams.place_id = urlData.selectedPlaces.id;
    let placeData = await getPlaceById(urlData.selectedPlaces.id);
    if (placeData) {
      processPlaceData(placeData, appStore);
      renderPlacesList(appStore);
    }
    // get bounding box only
  } else {
    processBBoxData(appStore, urlData);
    renderPlacesList(appStore);
  }
}

export async function processTaxonData(
  taxonData: TaxaResult,
  appStore: MapStore,
  urlData: MapStore,
) {
  let map = appStore.map.map;
  if (map == null) return;
  let urlDataTaxon = urlData.selectedTaxa.find((t) => t.id === taxonData.id);
  if (!urlDataTaxon) return;

  // create taxon object
  let taxon: NormalizediNatTaxon = {
    name: taxonData.name,
    default_photo: taxonData.default_photo?.square_url,
    preferred_common_name: taxonData.preferred_common_name,
    matched_term: taxonData.name,
    rank: taxonData.rank,
    id: taxonData.id,
    color: urlDataTaxon.color,
  };

  let { title, subtitle } = formatTaxonName(taxon, taxon.name as string, false);
  taxon.display_name = title;
  taxon.title = title;
  taxon.subtitle = subtitle;

  // update appStore
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    taxon_id: taxon.id,
    color: urlDataTaxon.color,
    verifiable: urlData.inatApiParams.verifiable,
    spam: urlData.inatApiParams.spam,
  };
  if (urlDataTaxon.color) {
    appStore.color = urlDataTaxon.color;
  }

  // handle selected places
  if (urlData.selectedPlaces && urlData.selectedPlaces.id !== 0) {
    appStore.inatApiParams.place_id = urlData.selectedPlaces.id;
    let placeData = await getPlaceById(urlData.selectedPlaces.id);
    if (placeData) {
      processPlaceData(placeData, appStore);
    }
    // handle bounding box
  } else if (urlData.inatApiParams.nelat !== undefined) {
    processBBoxData(appStore, urlData);
  }
  await fetchiNatMapData(taxon, appStore);
}

export function processPlaceData(placeData: PlacesResult, appStore: MapStore) {
  let map = appStore.map.map;
  if (!map) return;

  // zoom to map using bounding box
  if (placeData.bounding_box_geojson) {
    let coord = placeData.bounding_box_geojson.coordinates[0] as LatLng[];
    let bounds = getBoundingBox(coord);

    map.fitBounds(bounds);
  }

  // draw boundaries of selected place
  let options: any = {
    color: "red",
    fillColor: "none",
    layer_description: `place layer: ${placeData.name}, ${placeData.id}`,
  };
  let layer = L.geoJSON(placeData.geometry_geojson as any, options);
  layer.addTo(map);

  // save place to store
  appStore.selectedPlaces = {
    id: placeData.id,
    name: placeData.name,
    display_name: placeData.display_name,
  };
  appStore.placesMapLayers = layer as CustomGeoJSON;
}

export function processBBoxData(appStore: MapStore, urlData: MapStore) {
  let map = appStore.map.map;
  if (!map) return;
  let lngLatCoors = convertParamsBBoxToLngLat(urlData.inatApiParams);
  if (!lngLatCoors) return;

  let layer = drawMapBoundingBox(map, lngLatCoors);
  appStore.refreshMap = {
    ...appStore.refreshMap,
    layer: layer as CustomPolygon,
  };

  zoomBBox(map, lngLatCoors);

  appStore.inatApiParams.nelat = urlData.inatApiParams.nelat;
  appStore.inatApiParams.nelng = urlData.inatApiParams.nelng;
  appStore.inatApiParams.swlat = urlData.inatApiParams.swlat;
  appStore.inatApiParams.swlng = urlData.inatApiParams.swlng;

  appStore.selectedPlaces = bboxPlace;
  appStore.placesMapLayers = layer as unknown as CustomGeoJSON;
}

export function displayUserData(appStore: MapStore, _source: string) {
  let temp: any = {};
  // console.log(">> displayUserData", _source);
  Object.entries(appStore.taxaMapLayers).forEach(([key, val]) => {
    temp[key] = val.map((v: any) => v.options.layer_description);
  });

  let data = {
    refreshMap: {
      refreshMapButtonEl: appStore.refreshMap.refreshMapButtonEl,
      showRefreshMapButton: appStore.refreshMap.showRefreshMapButton,
      layer: {
        layer_description: appStore.refreshMap.layer?.options.layer_description,
        bounds: appStore.refreshMap.layer?._bounds,
      },
    },
    inatApiParams: appStore.inatApiParams,
    color: appStore.color,
    selectedTaxa: appStore.selectedTaxa,
    taxaMapLayers: temp,
    selectedPlaces: appStore.selectedPlaces,
    placesMapLayers: appStore.placesMapLayers?.options.layer_description,
    mapLayerDescriptions: leafletVisibleLayers(appStore),
  };
  displayJson(data, appStore.displayJsonEl);
}
