import type { Map, TileLayer } from "leaflet";

import type {
  NormalizediNatTaxon,
  MapStore,
  iNatApiParams,
  CustomLayerOptions,
  CustomLayer,
  CustomGeoJSON,
  iNatApiParamsKeys,
  NormalizediNatPlace,
  MapStoreSelectedResourcesKeys,
  NormalizediNatProject,
  NormalizediNatUser,
} from "../types/app";
import {
  addOverlayToMap,
  formatiNatAPIBoundingBoxParams,
  getAndDrawMapBoundingBox,
} from "./map_utils.ts";
import { formatAppUrl, updateAppUrl } from "./utils.ts";
import { getiNatMapTiles, getObservations } from "./inat_api.ts";
import {
  iNatApiNonFilterableNames,
  allTaxaRecord,
  bboxPlaceRecord,
} from "../data/inat_data.ts";
import { renderPlacesList } from "./search_places.ts";
import { iNatOrange } from "./map_colors_utils.ts";
import { logger, loggerFilters } from "./logger.ts";
import { mapStore } from "./store.ts";
import type { SpeciesCountTaxon } from "../types/inat_api";
import { renderTaxaList } from "./search_taxa.ts";
import { person2 } from "../assets/icons.ts";
import { updateTilesAndCountForAllTaxa } from "./search_utils.ts";

// called when user clicks refresh map button
export async function refreshBoundingBox(appStore: MapStore) {
  let map = appStore.map.map;
  let layerControl = appStore.map.layerControl;

  if (map === null) return;
  if (layerControl === null) return;

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
  let place = bboxPlaceRecord(lngLatCoors);
  appStore.selectedPlaces = [place];
  appStore.placesMapLayers = { "0": [layer as unknown as CustomGeoJSON] };

  let bbox = map.getBounds();
  let inatBbox = formatiNatAPIBoundingBoxParams(bbox);
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    ...inatBbox,
  };

  await updateTilesAndCountForAllTaxa(appStore);

  let paramsTemp = {
    ...appStore.inatApiParams,
  };

  await getObservationsCountForPlace(place, appStore, paramsTemp);

  renderTaxaList(appStore);
  renderPlacesList(appStore);
  updateAppUrl(window.location, appStore);
  window.dispatchEvent(new Event("observationsChange"));
}

// called when user select taxa or place
export async function fetchiNatMapDataForTaxon(
  taxonObj: NormalizediNatTaxon,
  appStore: MapStore,
  paramsTemp: iNatApiParams,
) {
  let map = appStore.map.map;
  let layerControl = appStore.map.layerControl;
  if (map === null) return;
  if (layerControl === null) return;

  // get iNaturalist map layers
  let { iNatGrid, iNatHeatmap, iNatTaxonRange, iNatPoint } = getiNatMapTiles(
    paramsTemp,
    taxonObj,
  );

  // add layers to map and layer control
  let iNatGridLayer = addOverlayToMap(iNatGrid, map, layerControl, true);
  let iNatPointLayer = addOverlayToMap(iNatPoint, map, layerControl);
  let iNatHeatmapLayer = addOverlayToMap(iNatHeatmap, map, layerControl);
  let iNatTaxonRangeLayer;
  if (iNatTaxonRange) {
    iNatTaxonRangeLayer = addOverlayToMap(iNatTaxonRange, map, layerControl);
  }

  let layers: (TileLayer | undefined)[] = [
    iNatGridLayer,
    iNatPointLayer,
    iNatHeatmapLayer,
  ];
  if (iNatTaxonRangeLayer) {
    layers.push(iNatTaxonRangeLayer);
  }

  // save layers to store so the app can delete them later on
  appStore.taxaMapLayers = {
    ...appStore.taxaMapLayers,
    [taxonObj.id]: layers,
  };
}

// ================
// taxon
// ================

export async function getObservationsCountForTaxon(
  taxon: NormalizediNatTaxon,
  appStore: MapStore,
  paramsTemp: iNatApiParams,
) {
  await getObservationsCountForResource(
    taxon,
    "selectedTaxa",
    appStore,
    paramsTemp,
  );
}

export async function addAllTaxaRecordToMapAndStore(appStore: MapStore) {
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    colors: iNatOrange,
    taxon_id: "0",
  };
  let paramsTemp = appStore.inatApiParams;
  appStore.color = iNatOrange;

  await fetchiNatMapDataForTaxon(allTaxaRecord, appStore, paramsTemp);
  await getObservationsCountForTaxon(allTaxaRecord, appStore, paramsTemp);

  // set taxon_id after getting map data
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    taxon_id: "0",
    colors: iNatOrange,
  };
  appStore.selectedTaxa = [allTaxaRecord];
}

export function removeOneTaxonFromStoreAndMap(
  appStore: MapStore,
  taxonId: number,
) {
  removeOneTaxonFromMap(appStore, taxonId);

  appStore.selectedTaxa = appStore.selectedTaxa.filter(
    (taxon) => taxon.id !== taxonId,
  );

  removeIdfromInatApiParams(appStore, "taxon_id", taxonId);
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

export function removeTaxaFromStoreAndMap(appStore: MapStore) {
  let layerControl = appStore.map.layerControl;

  if (layerControl) {
    // remove from map
    Object.values(appStore.taxaMapLayers).forEach((layers) => {
      layers.forEach((layer) => {
        // remove layer from layer control
        layerControl.removeLayer(layer);
        // remove layer from map
        layer.remove();
      });
    });
  }

  // remove from store
  delete appStore.inatApiParams.taxon_id;
  delete appStore.inatApiParams.colors;
  appStore.selectedTaxa = [];
  appStore.taxaMapLayers = {};
  appStore.color = "";
}

// ================
// place
// ================

export async function removeOnePlaceFromStoreAndMap(
  appStore: MapStore,
  placeId: number,
) {
  removeOnePlaceFromMap(appStore, placeId);

  appStore.selectedPlaces = appStore.selectedPlaces.filter(
    (place) => place.id !== placeId,
  );

  // update inatApiParams for bounding box
  if (placeId === 0) {
    delete appStore.inatApiParams.nelat;
    delete appStore.inatApiParams.nelng;
    delete appStore.inatApiParams.swlat;
    delete appStore.inatApiParams.swlng;
    // update inatApiParams for places
  } else {
    removeIdfromInatApiParams(appStore, "place_id", placeId);
  }
}

export function removeOnePlaceFromMap(appStore: MapStore, placeId: number) {
  if (!appStore.placesMapLayers) return;

  let mapLayers = appStore.placesMapLayers[placeId];
  if (!mapLayers) return;

  mapLayers.forEach((layer) => {
    layer.remove();
  });

  delete appStore.placesMapLayers[placeId];
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

export async function getObservationsCountForPlace(
  place: NormalizediNatPlace,
  appStore: MapStore,
  paramsTemp: iNatApiParams,
) {
  await getObservationsCountForResource(
    place,
    "selectedPlaces",
    appStore,
    paramsTemp,
  );
}

// ================
// project
// ================

export function removeOneProjectFromStore(
  appStore: MapStore,
  projectId: number,
) {
  appStore.selectedProjects = appStore.selectedProjects.filter(
    (item) => item.id !== projectId,
  );
  removeIdfromInatApiParams(appStore, "project_id", projectId);
}

// ================
// selected resource
// ================

async function getObservationsCountForResource(
  record:
    | NormalizediNatPlace
    | NormalizediNatTaxon
    | NormalizediNatProject
    | NormalizediNatUser,
  resourceName: MapStoreSelectedResourcesKeys,
  appStore: MapStore,
  paramsTemp: iNatApiParams,
) {
  let params = cleanupObervationsParamsForRecord(paramsTemp);
  let perPage = 0;
  let data = await getObservations(params, perPage);
  record.observations_count = data?.total_results;

  updateSelectedResource(record, resourceName, appStore);
}

export function updateSelectedResource(
  record:
    | NormalizediNatPlace
    | NormalizediNatTaxon
    | NormalizediNatProject
    | NormalizediNatUser,
  resourceName: MapStoreSelectedResourcesKeys,
  appStore: MapStore,
) {
  let temp = [];
  let ids: number[] = [];

  appStore[resourceName].forEach((selectedResource) => {
    // update existing taxon
    if (selectedResource.id === record.id) {
      temp.push(record);
      // keep existing taxon
    } else {
      temp.push(selectedResource);
    }
    ids.push(selectedResource.id);
  });

  // add new record
  if (!ids.includes(record.id)) {
    temp.push(record);
  }

  appStore[resourceName] = temp as any;
}

// ================
// bounding box
// ================

function removeRefreshBBox(appStore: MapStore, map: Map) {
  if (appStore.refreshMap.layer) {
    appStore.refreshMap.layer.removeFrom(map);
  }
}

// ================
// user
// ================

export function removeOneUserFromStore(appStore: MapStore, userId: number) {
  appStore.selectedUsers = appStore.selectedUsers.filter(
    (item) => item.id !== userId,
  );
  removeIdfromInatApiParams(appStore, "user_id", userId);
}

// ================
// misc
// ================

function removeTaxonId(appStore: MapStore) {
  if (appStore.selectedTaxa.length == 0) {
    delete appStore.inatApiParams.taxon_id;
    delete appStore.inatApiParams.colors;
    // get id of last taxa is selectedTaxa
  } else {
    let lastTaxon = appStore.selectedTaxa[appStore.selectedTaxa.length - 1];
    appStore.inatApiParams.taxon_id = lastTaxon.id.toString();
    appStore.inatApiParams.colors = lastTaxon.color;
  }
}

function setinatApiParams(
  appStore: MapStore,
  property: iNatApiParamsKeys,
  value: any,
) {
  let ids = removeValueFromCommaSeparatedString(
    value,
    appStore.inatApiParams[property],
  );
  if (ids) {
    appStore.inatApiParams[property] = ids;
  }
}

function removePlaceId(
  appStore: MapStore,
  property: iNatApiParamsKeys,
  value: any,
) {
  if (appStore.selectedPlaces.length === 0) {
    delete appStore.inatApiParams.place_id;
  } else {
    let lastPlace = appStore.selectedPlaces[appStore.selectedPlaces.length - 1];
    if (lastPlace.id === value) {
    } else if (appStore.selectedPlaces.map((p) => p.id).includes(value)) {
    } else {
      setinatApiParams(appStore, property, value);
    }
  }
}

function removeProjectId(
  appStore: MapStore,
  property: iNatApiParamsKeys,
  value: any,
) {
  if (appStore.selectedProjects.length === 0) {
    delete appStore.inatApiParams.project_id;
  } else {
    let lastRecord =
      appStore.selectedProjects[appStore.selectedProjects.length - 1];
    if (lastRecord.id === value) {
    } else if (appStore.selectedProjects.map((p) => p.id).includes(value)) {
    } else {
      setinatApiParams(appStore, property, value);
    }
  }
}

function removeUserId(
  appStore: MapStore,
  property: iNatApiParamsKeys,
  value: any,
) {
  if (appStore.selectedUsers.length === 0) {
    delete appStore.inatApiParams.user_id;
  } else {
    let lastRecord = appStore.selectedUsers[appStore.selectedUsers.length - 1];
    if (lastRecord.id === value) {
    } else if (appStore.selectedUsers.map((p) => p.id).includes(value)) {
    } else {
      setinatApiParams(appStore, property, value);
    }
  }
}

export function removeIdfromInatApiParams(
  appStore: MapStore,
  property: iNatApiParamsKeys,
  value: any,
) {
  if (property === "taxon_id") {
    removeTaxonId(appStore);
  } else if (property === "place_id") {
    removePlaceId(appStore, "place_id", value);
  } else if (property === "project_id") {
    removeProjectId(appStore, "project_id", value);
  } else if (property === "user_id") {
    removeUserId(appStore, "user_id", value);
  } else {
    throw new Error(
      `removeIdfromInatApiParams not implemented for ${property}`,
    );
  }
}

function isNormalizediNatTaxon(
  record: NormalizediNatTaxon | SpeciesCountTaxon,
): record is NormalizediNatTaxon {
  return "matched_term" in record;
}

function capitalizeFirstLetter(text: string) {
  return text && text[0].toUpperCase() + text.slice(1);
}

export function formatTaxonName(
  item: NormalizediNatTaxon | SpeciesCountTaxon,
  inputValue: string,
  includeMatchedTerm = true,
) {
  let hasCommonName = true;
  let title;
  let titleAriaLabel;
  let subtitle;
  let subtitleAriaLabel;

  // has common name
  if (item.preferred_common_name) {
    title = item.preferred_common_name
      .split(" ")
      .map((word) => {
        if (word !== "and") {
          return capitalizeFirstLetter(word);
        } else {
          return word;
        }
      })
      .join(" ");

    titleAriaLabel = "taxon common name";

    // has scientific name
    if (item.name) {
      subtitle = item.name;
      subtitleAriaLabel = "taxon scientific name";

      // add optional (matched_term)
      if (includeMatchedTerm && isNormalizediNatTaxon(item)) {
        if (item.matched_term === item.preferred_common_name) {
        } else if (item.matched_term === item.name) {
        } else if (
          item.matched_term &&
          !item.preferred_common_name
            ?.toLowerCase()
            .includes(inputValue.toLowerCase()) &&
          !item.name.toLowerCase().includes(inputValue.toLowerCase())
        ) {
          title += ` (${capitalizeFirstLetter(item.matched_term)})`;
        }
      }
    }
    // no common-name
  } else {
    hasCommonName = false;
    title = item.name;
    titleAriaLabel = "taxon scientific name";
  }

  return { title, titleAriaLabel, subtitle, subtitleAriaLabel, hasCommonName };
}

export function leafletVisibleLayers(appStore: MapStore, strict = false) {
  let layer_descriptions: any[] = [];
  if (appStore.map.map) {
    appStore.map.map.eachLayer((lay) => {
      let layer = lay as unknown as CustomLayer;
      let options = layer.options as CustomLayerOptions;

      if (options.layer_description) {
        if (layer._path || layer._container || !strict) {
          // logger(">>>", Object.keys(layer));

          layer_descriptions.push(options.layer_description);
        } else {
          logger("?????", Object.keys(layer));
        }
      } else {
        logger("???", Object.keys(layer));
      }
    });
  }

  return layer_descriptions;
}

export function addValueToCommaSeparatedString(
  newValue?: number | string,
  currentValue?: string,
) {
  if (newValue === undefined) return;

  if (currentValue === undefined) {
    currentValue = newValue.toString();
  } else {
    // only add newValue to currentValue if currentValue does not have newValue
    let parts = currentValue.split(",").map((i) => {
      if (typeof newValue === "number") {
        return Number(i);
      } else {
        return i;
      }
    });
    if (!parts.includes(newValue)) {
      currentValue = currentValue + "," + newValue;
    }
  }

  return currentValue;
}

export function removeValueFromCommaSeparatedString(
  newValue?: number,
  currentValue?: string,
) {
  if (newValue === undefined) return;
  if (currentValue === undefined) return;

  let ids = currentValue
    .split(",")
    .filter((id) => Number(id) !== newValue)
    .join(",");
  if (ids === "") return;
  return ids;
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
  loggerFilters("------------ updateStoreUsingFilters");
  loggerFilters("default:", mapStore.inatApiParams);
  loggerFilters("appStore:", appStore.inatApiParams);
  loggerFilters("filtersResults", filtersResults);

  for (let [k, _value] of Object.entries(appStore.inatApiParams)) {
    let key = k as iNatApiParamsKeys;
    loggerFilters(key, _value);

    // ignore params that can't be changed in the filter modal
    if (iNatApiNonFilterableNames.includes(key)) {
      continue;
    }

    if (key === "verifiable") {
      if (filtersResults.params.verifiable === undefined) {
        delete appStore.inatApiParams[key];
      }
    } else if (key === "spam") {
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

export function formatAvatar(imgUrl?: string | null) {
  if (imgUrl) {
    return `<img class="avatar" src="${imgUrl}">`;
  } else {
    return person2;
  }
}

export function normalizeAppParams(appParams: string) {
  let rawParams = new URLSearchParams(appParams);
  if (rawParams.get("verifiable") === null) {
    rawParams.append("verifiable", "true");
  }
  if (rawParams.get("spam") === null) {
    rawParams.append("spam", "false");
  }
  return rawParams;
}

export function viewAndTemplateObject(targetView: string) {
  let view;
  if (targetView === "species") {
    view = "x-view-species";
  } else if (targetView === "identifiers") {
    view = "x-view-identifiers";
  } else if (targetView === "observers") {
    view = "x-view-observers";
  } else {
    view = "x-view-map";
  }
  return view;
}

export function cleanupObervationsParams(appStore: MapStore) {
  let params = cleanupParams(appStore);
  return params.toString();
}

function cleanupParams(appStore: MapStore) {
  let string = formatAppUrl(appStore);
  let params = new URLSearchParams(string);

  // delete properties that should not go to api
  params.delete("colors");
  params.delete("view");
  params.delete("subview");

  if (params.get("taxon_id") === "0") {
    params.delete("taxon_id");
  }
  if (params.get("place_id") === "0") {
    params.delete("place_id");
  }

  return params;
}

export function cleanupObervationsParamsForRecord(inatParams: iNatApiParams) {
  let params = new URLSearchParams(inatParams as any);
  params.delete("colors");
  params.delete("view");
  params.delete("subview");

  if (inatParams.taxon_id === "0") {
    params.delete("taxon_id");
  }
  if (inatParams.place_id === "0") {
    params.delete("place_id");
  }

  return params.toString();
}

export function cleanupObervationsObserversParams(appStore: MapStore) {
  let params = cleanupParams(appStore);

  params.delete("order");
  params.delete("order_by");

  return params.toString();
}
