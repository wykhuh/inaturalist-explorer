import L from "leaflet";

import type {
  NormalizediNatTaxon,
  MapStore,
  iNatApiParams,
  CustomLayerOptions,
  CustomLayer,
  CustomGeoJSON,
  NormalizediNatPlace,
  LngLat,
  iNatApiParamsKeys,
} from "../types/app";
import {
  addOverlayToMap,
  convertParamsBBoxToLngLat,
  drawMapBoundingBox,
  formatiNatAPIBoundingBoxParams,
  getAndDrawMapBoundingBox,
  fitBoundsPlaces,
} from "./map_utils.ts";
import { displayJson, updateUrl } from "./utils.ts";
import {
  getiNatMapTiles,
  getiNatObservationsTotal,
  getPlaceById,
  getTaxonById,
  iNatApiFilterableParams,
} from "./inat_api.ts";
import { renderTaxaList, renderPlacesList } from "./autocomplete_utils.ts";
import type { Map } from "leaflet";
import type { PlacesResult, TaxaResult } from "../types/inat_api";
import { mapStore } from "./store.ts";

export function bboxPlace(bbox: LngLat[]): NormalizediNatPlace {
  return {
    id: 0,
    name: "Custom Boundary",
    display_name: "Custom Boundary",
    bounding_box: { type: "Polygon", coordinates: [bbox] },
  };
}

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
  let { layer, lngLatCoors } = getAndDrawMapBoundingBox(map);
  appStore.refreshMap = {
    ...appStore.refreshMap,
    layer: layer as any,
  };

  // save place to store
  appStore.selectedPlaces = [bboxPlace(lngLatCoors)];
  appStore.placesMapLayers = { "0": [layer as unknown as CustomGeoJSON] };

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
        appStore.inatApiParams.place_id = placeId.toString();
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
  renderPlacesList(appStore);
  updateUrl(window.location, appStore);
}

// called when user deletes a place
export async function removePlace(placeId: number, appStore: MapStore) {
  if (!appStore.selectedPlaces) return;

  // remove place
  removeOnePlaceFromStoreAndMap(appStore, placeId);

  // remove existing taxa tiles, and refetch taxa tiles
  for await (const taxon of appStore.selectedTaxa) {
    removeOneTaxonFromMap(appStore, taxon.id);
    await fetchiNatMapData(taxon, appStore);
  }

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

function removeOnePlaceFromStoreAndMap(appStore: MapStore, placeId: number) {
  removeOnePlaceFromMap(appStore, placeId);

  if (placeId === 0) {
    delete appStore.inatApiParams.nelat;
    delete appStore.inatApiParams.nelng;
    delete appStore.inatApiParams.swlat;
    delete appStore.inatApiParams.swlng;
  } else {
    let ids = idStringRemoveId(placeId, appStore.inatApiParams.place_id);
    if (ids) {
      appStore.inatApiParams.place_id = ids;
    } else {
      delete appStore.inatApiParams.place_id;
    }
  }

  appStore.selectedPlaces = appStore.selectedPlaces.filter(
    (place) => place.id !== placeId,
  );
  if (appStore.selectedPlaces.length === 0) {
    removeTaxaFromStoreAndMap(appStore);
  }
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
  // HACK: trigger change in proxy store
  appStore.taxaMapLayers = appStore.taxaMapLayers;
}

export function removeOnePlaceFromMap(appStore: MapStore, placeId: number) {
  if (!appStore.placesMapLayers) return;
  let mapLayers = appStore.placesMapLayers[placeId];
  if (!mapLayers) return;

  mapLayers.forEach((layer) => layer.remove());

  delete appStore.placesMapLayers[placeId];
}

function removeTaxaFromStoreAndMap(appStore: MapStore) {
  let layerControl = appStore.map.layerControl;
  if (!layerControl) return;

  // remove from map
  Object.values(appStore.taxaMapLayers).forEach((layers) => {
    layers.forEach((layer) => {
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
  // remove from map
  Object.values(appStore.placesMapLayers).forEach((layers) => {
    layers.forEach((layer) => {
      // remove layer from map
      layer.remove();
    });
  });

  appStore.refreshMap.layer = null;

  // remove from store
  appStore.placesMapLayers = {};
  delete appStore.inatApiParams.place_id;
  delete appStore.inatApiParams.nelat;
  delete appStore.inatApiParams.nelng;
  delete appStore.inatApiParams.swlat;
  delete appStore.inatApiParams.swlng;
  appStore.selectedPlaces = [];
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

export let fieldsWithAny = [
  "quality_grade",
  "reviewed",
  "verifiable",
  "place_id",
  "captive",
];

export async function initApp(appStore: MapStore, urlStore: MapStore) {
  let map = appStore.map.map;
  if (!map) return;

  // quality_grade, reviewed, verifiable, place_id, captive
  for (const [key, value] of Object.entries(urlStore.inatApiParams)) {
    if (fieldsWithAny.includes(key) && value === "any") {
      delete appStore.inatApiParams[key as iNatApiParamsKeys];
    } else {
      delete appStore.inatApiParams[key as iNatApiParamsKeys];
      (appStore.inatApiParams[key as iNatApiParamsKeys] as any) = value;
    }
  }

  // HACK: deleting and setting a property in inatApiParams does not trigger the
  // an update in proxy store. Need to replace inatApiParams to trigger
  // an update in proxy store.
  appStore.inatApiParams = appStore.inatApiParams;

  // get taxa data, optional place data, optional bounding box
  if (urlStore.selectedTaxa && urlStore.selectedTaxa.length > 0) {
    for await (const urlStoreTaxon of urlStore.selectedTaxa) {
      let taxonData = await getTaxonById(urlStoreTaxon.id);
      if (!taxonData) {
        continue;
      }
      await processTaxonData(taxonData, appStore, urlStore);
    }
    renderTaxaList(appStore);
    renderPlacesList(appStore);
    fitBoundsPlaces(appStore);

    // get place data only
  } else if (
    urlStore.selectedPlaces &&
    urlStore.selectedPlaces.length > 0 &&
    urlStore.inatApiParams.nelat === undefined
  ) {
    for await (const urlStorePlace of urlStore.selectedPlaces) {
      let placeData = await getPlaceById(urlStorePlace.id);
      if (!placeData) {
        continue;
      }
      await processPlaceData(placeData, appStore);
    }
    renderPlacesList(appStore);
    fitBoundsPlaces(appStore);

    // get bounding box only
  } else if (urlStore.inatApiParams.nelat !== undefined) {
    processBBoxData(appStore, urlStore);
    renderPlacesList(appStore);
    fitBoundsPlaces(appStore);
  }
}

export async function processTaxonData(
  taxonData: TaxaResult,
  appStore: MapStore,
  urlStore: MapStore,
) {
  let map = appStore.map.map;
  if (map == null) return;
  let urlStoreTaxon = urlStore.selectedTaxa.find((t) => t.id === taxonData.id);
  if (!urlStoreTaxon) return;

  // create taxon object
  let taxon: NormalizediNatTaxon = {
    name: taxonData.name,
    default_photo: taxonData.default_photo?.square_url,
    preferred_common_name: taxonData.preferred_common_name,
    matched_term: taxonData.name,
    rank: taxonData.rank,
    id: taxonData.id,
    color: urlStoreTaxon.color,
  };

  let { title, subtitle } = formatTaxonName(taxon, taxon.name as string, false);
  taxon.display_name = title;
  taxon.title = title;
  taxon.subtitle = subtitle;

  // update appStore
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    taxon_id: taxon.id,
    color: urlStoreTaxon.color,
  };
  if (urlStoreTaxon.color) {
    appStore.color = urlStoreTaxon.color;
  }

  // handle selected places
  if (
    urlStore.selectedPlaces &&
    urlStore.selectedPlaces.length > 0 &&
    urlStore.inatApiParams.nelat === undefined
  ) {
    for await (const urlStorePlace of urlStore.selectedPlaces) {
      let placeData = await getPlaceById(urlStorePlace.id);
      if (!placeData) {
        continue;
      }
      await processPlaceData(placeData, appStore);
    }
    // handle bounding box
  } else if (urlStore.inatApiParams.nelat !== undefined) {
    processBBoxData(appStore, urlStore);
  }
  await fetchiNatMapData(taxon, appStore);
}

export function processPlaceData(placeData: PlacesResult, appStore: MapStore) {
  let map = appStore.map.map;
  if (!map) return;

  // draw boundaries of selected place
  let options: any = {
    color: "red",
    fillColor: "none",
    layer_description: `place layer: ${placeData.name}, ${placeData.id}`,
  };
  let layer = L.geoJSON(placeData.geometry_geojson as any, options);
  layer.addTo(map);

  // save place to store
  appStore.placesMapLayers[placeData.id] = [layer as CustomGeoJSON];

  let bbox = placeData.bounding_box_geojson;
  appStore.selectedPlaces = [
    ...appStore.selectedPlaces,
    {
      id: placeData.id,
      name: placeData.name,
      display_name: placeData.display_name,
      bounding_box: bbox,
    },
  ];

  // create comma seperated place_id
  appStore.inatApiParams.place_id = idStringAddId(
    placeData.id,
    appStore.inatApiParams.place_id,
  );
}

export function idStringAddId(newId?: number, currentId?: string) {
  if (newId === undefined) return;

  if (currentId === undefined) {
    currentId = newId.toString();
  } else {
    currentId = currentId + "," + newId;
  }

  return currentId;
}

export function idStringRemoveId(newId?: number, currentId?: string) {
  if (newId === undefined) return;
  if (currentId === undefined) return;

  let ids = currentId
    .split(",")
    .filter((id) => Number(id) !== newId)
    .join(",");
  if (ids === "") return;
  return ids;
}

export function processBBoxData(appStore: MapStore, urlStore: MapStore) {
  let map = appStore.map.map;
  if (!map) return;
  let lngLatCoors = convertParamsBBoxToLngLat(urlStore.inatApiParams);
  if (!lngLatCoors) return;

  let layer = drawMapBoundingBox(map, lngLatCoors) as any;
  appStore.refreshMap = {
    ...appStore.refreshMap,
    layer: layer,
  };

  appStore.inatApiParams.nelat = urlStore.inatApiParams.nelat;
  appStore.inatApiParams.nelng = urlStore.inatApiParams.nelng;
  appStore.inatApiParams.swlat = urlStore.inatApiParams.swlat;
  appStore.inatApiParams.swlng = urlStore.inatApiParams.swlng;

  appStore.selectedPlaces = [bboxPlace(lngLatCoors)];
  appStore.placesMapLayers["0"] = [layer as unknown as CustomGeoJSON];
}

export function updateStoreUsingFilters(
  appStore: MapStore,
  filtersResults: {
    params: iNatApiParams;
    string: string;
  },
) {
  // update store formFilters
  appStore.formFilters = filtersResults;
  // console.log("------------ updateStoreUsingFilters");
  // console.log("default:", mapStore.inatApiParams);
  // console.log("appStore:", appStore.inatApiParams);
  // console.log("filtersResults", filtersResults);

  for (let [k, _value] of Object.entries(appStore.inatApiParams)) {
    let key = k as iNatApiParamsKeys;
    // console.log(key, _value);

    // ignore params that can't be changed in the filter modal
    if (!iNatApiFilterableParams.includes(key)) {
      continue;
    }

    // handle inatApiParams that set in default mapStore
    if (mapStore.inatApiParams[key] !== undefined) {
      // field is not set in the form filter
      if (filtersResults.params[key] === undefined) {
        if (key === "verifiable") {
          if (appStore.inatApiParams.verifiable === true) {
            delete appStore.inatApiParams[key];
          }
        } else if (key === "spam") {
          if (appStore.inatApiParams.spam === true) {
            appStore.inatApiParams.spam = false;
          }
        }
      }
      // handle inatApiParams that have been changed by the filtes
    } else if (appStore.inatApiParams[key] !== filtersResults.params[key]) {
      if (filtersResults.params[key] === undefined) {
        delete appStore.inatApiParams[key];
      }
    }
  }

  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    ...filtersResults.params,
  };
}

export function displayUserData(appStore: MapStore, _source: string) {
  function formatTaxaMapLayers() {
    let temp: any = {};
    Object.entries(appStore.taxaMapLayers).forEach(([key, val]) => {
      temp[key] = val.map((v: any) => v.options.layer_description);
    });
    return temp;
  }
  function formatPlacesMapLayers() {
    let temp: any = {};
    Object.entries(appStore.placesMapLayers).forEach(([key, val]) => {
      temp[key] = val.map((v: any) => v.options.layer_description);
    });
    return temp;
  }

  let data = {
    inatApiParams: appStore.inatApiParams,
    color: appStore.color,
    formFilters: appStore.formFilters,
    selectedTaxa: appStore.selectedTaxa,
    taxaMapLayers: formatTaxaMapLayers(),
    selectedPlaces: appStore.selectedPlaces,
    placesMapLayers: formatPlacesMapLayers(),
    refreshMap: {
      showRefreshMapButton: appStore.refreshMap.showRefreshMapButton,
      layer: {
        layer_description: appStore.refreshMap.layer?.options.layer_description,
        // bounds: appStore.refreshMap.layer?._bounds,
      },
    },
    mapLayerDescriptions: leafletVisibleLayers(appStore),
  };
  displayJson(data, appStore.displayJsonEl);
}
