import type {
  NormalizediNatTaxon,
  MapStore,
  iNatApiParams,
  CustomLayerOptions,
  CustomLayer,
  CustomGeoJSON,
  iNatApiParamsKeys,
} from "../types/app";
import {
  addOverlayToMap,
  formatiNatAPIBoundingBoxParams,
  getAndDrawMapBoundingBox,
} from "./map_utils.ts";
import { displayJson, updateUrl } from "./utils.ts";
import { getiNatMapTiles, getiNatObservationsTotal } from "./inat_api.ts";
import {
  iNatApiNonFilterableNames,
  allTaxaRecord,
  bboxPlaceRecord,
} from "./inat_data.ts";

import {
  renderTaxaList,
  renderPlacesList,
  renderProjectsList,
  renderUsersList,
} from "./autocomplete_utils.ts";
import type { Map, TileLayer } from "leaflet";
import { iNatOrange } from "./map_colors_utils.ts";
import { logger, loggerFilters } from "./logger.ts";
import { mapStore } from "./store.ts";

// called when user clicks refresh map button
export async function refreshBoundingBox(
  appStore: MapStore,
  placeId: number | undefined = undefined,
) {
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
  appStore.selectedPlaces = [bboxPlaceRecord(lngLatCoors)];
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
        taxon_id: taxon.id.toString(),
        colors: taxon.color,
      };

      if (placeId !== undefined) {
        appStore.inatApiParams.place_id = placeId.toString();
      }

      await fetchiNatMapDataForTaxon(taxon, appStore);
      await getObservationsCountForTaxon(taxon, appStore);
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
export async function removeTaxon(taxonId: number, appStore: MapStore) {
  removeOneTaxonFromStoreAndMap(appStore, taxonId);

  // if no selected taxa, load allTaxaRecord
  if (appStore.selectedTaxa.length === 0) {
    await addAllTaxaRecordToMapAndStore(appStore);
  }

  renderTaxaList(appStore);
  renderPlacesList(appStore);
  updateUrl(window.location, appStore);
}

// called when user deletes a place
export async function removePlace(placeId: number, appStore: MapStore) {
  if (!appStore.selectedPlaces) return;

  // remove place
  await removeOnePlaceFromStoreAndMap(appStore, placeId);

  // remove existing taxa tiles, and refetch taxa tiles
  for await (const taxon of appStore.selectedTaxa) {
    removeOneTaxonFromMap(appStore, taxon.id);

    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };
    await fetchiNatMapDataForTaxon(taxon, appStore);
    await getObservationsCountForTaxon(taxon, appStore);
  }

  renderTaxaList(appStore);
  renderPlacesList(appStore);
  updateUrl(window.location, appStore);
}

// called when user deletes a project
export async function removeProject(projectId: number, appStore: MapStore) {
  if (!appStore.selectedProjects) return;

  // remove project
  await removeOneProjectFromStore(appStore, projectId);

  // remove existing taxa tiles, and refetch taxa tiles
  for await (const taxon of appStore.selectedTaxa) {
    removeOneTaxonFromMap(appStore, taxon.id);

    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };
    await fetchiNatMapDataForTaxon(taxon, appStore);
    await getObservationsCountForTaxon(taxon, appStore);
  }

  renderTaxaList(appStore);
  renderProjectsList(appStore);
  updateUrl(window.location, appStore);
}

export async function removeUser(userId: number, appStore: MapStore) {
  if (!appStore.selectedUsers) return;

  // remove user
  await removeOneUserFromStore(appStore, userId);

  // remove existing taxa tiles, and refetch taxa tiles
  for await (const taxon of appStore.selectedTaxa) {
    removeOneTaxonFromMap(appStore, taxon.id);

    appStore.inatApiParams = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };
    await fetchiNatMapDataForTaxon(taxon, appStore);
    await getObservationsCountForTaxon(taxon, appStore);
  }

  renderTaxaList(appStore);
  renderUsersList(appStore);
  updateUrl(window.location, appStore);
}

// called when user select taxa or place
export async function fetchiNatMapDataForTaxon(
  taxonObj: NormalizediNatTaxon,
  appStore: MapStore,
) {
  let map = appStore.map.map;
  let layerControl = appStore.map.layerControl;
  if (map === null) return;
  if (layerControl === null) return;

  // get iNaturalist map layers
  let { iNatGrid, iNatHeatmap, iNatTaxonRange, iNatPoint } = getiNatMapTiles(
    appStore.inatApiParams,
  );

  let title = taxonObj.display_name;
  if (!title) return;

  // add layers to map and layer control
  let iNatGridLayer = addOverlayToMap(iNatGrid, map, layerControl, title, true);
  let iNatPointLayer = addOverlayToMap(iNatPoint, map, layerControl, title);
  let iNatHeatmapLayer = addOverlayToMap(iNatHeatmap, map, layerControl, title);

  // only need taxon range if taxon is selected
  let layers: TileLayer[] = [];
  if (taxonObj.id === 0) {
    layers = [iNatGridLayer, iNatPointLayer, iNatHeatmapLayer];
    // add taxon range layer to map and layer control
  } else if (iNatTaxonRange) {
    let iNatTaxonRangeLayer = addOverlayToMap(
      iNatTaxonRange,
      map,
      layerControl,
      title,
    );
    layers = [
      iNatGridLayer,
      iNatPointLayer,
      iNatHeatmapLayer,
      iNatTaxonRangeLayer,
    ];
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
  taxonObj: NormalizediNatTaxon,
  appStore: MapStore,
) {
  // get observations count
  let observationParams: iNatApiParams = {
    ...appStore.inatApiParams,
    per_page: 0,
  };
  // delete colors
  delete observationParams.colors;

  // delete taxon_id when allTaxon
  if (observationParams.taxon_id === "0") {
    delete observationParams.taxon_id;
  }

  let count = await getiNatObservationsTotal(observationParams);
  taxonObj.observations_count = count;

  // update store.selectedTaxa
  updateSelectedTaxa(appStore, taxonObj);
}

export function updateSelectedTaxa(
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

export async function addAllTaxaRecordToMapAndStore(appStore: MapStore) {
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    colors: iNatOrange,
    taxon_id: "0",
  };

  await fetchiNatMapDataForTaxon(allTaxaRecord, appStore);
  await getObservationsCountForTaxon(allTaxaRecord, appStore);

  // set taxon_id after getting map data
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    taxon_id: "0",
    colors: iNatOrange,
  };
  appStore.selectedTaxa = [allTaxaRecord];
  appStore.color = iNatOrange;
}

function removeOneTaxonFromStoreAndMap(appStore: MapStore, taxonId: number) {
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

// ================
// place
// ================

async function removeOnePlaceFromStoreAndMap(
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

// ================
// project
// ================

function removeOneProjectFromStore(appStore: MapStore, projectId: number) {
  appStore.selectedProjects = appStore.selectedProjects.filter(
    (item) => item.id !== projectId,
  );
  removeIdfromInatApiParams(appStore, "project_id", projectId);
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

function removeOneUserFromStore(appStore: MapStore, userId: number) {
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
  let ids = removeIdFromCommaSeparatedString(
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

export function leafletVisibleLayers(appStore: MapStore, strict = false) {
  let layer_descriptions: any[] = [];
  if (appStore.map.map) {
    appStore.map.map.eachLayer((lay) => {
      let layer = lay as unknown as CustomLayer;
      let options = layer.options as CustomLayerOptions;

      if (options.layer_description) {
        if (layer._path || layer._container || !strict) {
          logger(">>>", Object.keys(layer));

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

export function addIdToCommaSeparatedString(
  newId?: number,
  currentId?: string,
) {
  if (newId === undefined) return;

  if (currentId === undefined) {
    currentId = newId.toString();
  } else {
    // only add newId to currentId if currentId does not have newId
    let parts = currentId.split(",").map((i) => Number(i));
    if (!parts.includes(newId)) {
      currentId = currentId + "," + newId;
    }
  }

  return currentId;
}

export function removeIdFromCommaSeparatedString(
  newId?: number,
  currentId?: string,
) {
  if (newId === undefined) return;
  if (currentId === undefined) return;

  let ids = currentId
    .split(",")
    .filter((id) => Number(id) !== newId)
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

  let yearString = "";
  if (appStore.iNatStats.years) {
    let allYears = appStore.iNatStats.years;
    yearString = `${allYears[0]}-${allYears[allYears.length - 1]}`;
  }

  let data = {
    inatApiParams: appStore.inatApiParams,
    color: appStore.color,
    formFilters: appStore.formFilters,
    selectedTaxa: appStore.selectedTaxa,
    taxaMapLayers: formatTaxaMapLayers(),
    selectedPlaces: appStore.selectedPlaces,
    placesMapLayers: formatPlacesMapLayers(),
    selectedProjects: appStore.selectedProjects,
    refreshMap: {
      showRefreshMapButton: appStore.refreshMap.showRefreshMapButton,
      layer: {
        layer_description: appStore.refreshMap.layer?.options.layer_description,
        // bounds: appStore.refreshMap.layer?._bounds,
      },
    },
    mapLayerDescriptions: leafletVisibleLayers(appStore),
    iNatStats: { years_summary: yearString },
  };
  displayJson(data, appStore.displayJsonEl);
}
