import type { Map, TileLayer } from "leaflet";
import L from "leaflet";

import type {
  NormalizediNatTaxon,
  MapStore,
  ObservationsApiParams,
  CustomLayerOptions,
  CustomLayer,
  CustomGeoJSON,
  ObservationsApiParamsKeys,
  NormalizediNatPlace,
  NormalizediNatProject,
  NormalizediNatUser,
  MapStoreSelectedResourcesArrayKeys,
} from "../types/app";
import {
  addOverlayToMap,
  formatiNatAPIBoundingBoxParams,
  getAndDrawMapBoundingBox,
} from "./map_utils.ts";
import { formatAppUrl } from "./utils.ts";
import { getiNatMapTiles, getObservations } from "./inat_api.ts";
import {
  ObservationsApiNonFilterableNames,
  allTaxaRecord,
  bboxPlaceRecord,
} from "../data/inat_data.ts";
import { iNatOrange } from "./map_colors_utils.ts";
import { logger, loggerFilters } from "./logger.ts";
import { mapStore } from "./store.ts";
import type { SpeciesCountTaxon, Taxon } from "../types/inat_api";
import {
  updateTilesForAllTaxa,
  renderSelectedResources,
  updateObservationsCountFor,
} from "./search_utils.ts";
import { isNormalizediNatTaxon } from "../types/utils.ts";

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
  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    ...inatBbox,
  };

  await updateTilesForAllTaxa(appStore);
  await updateObservationsCountFor("selectedPlaces", appStore);

  let paramsTemp = {
    ...appStore.observationsApiParams,
  };

  await getObservationsCountForPlace(place, appStore, paramsTemp);

  renderSelectedResources(appStore);
}

// called when user select taxa or place
export async function fetchiNatMapDataForTaxon(
  taxonObj: NormalizediNatTaxon,
  appStore: MapStore,
  paramsTemp: ObservationsApiParams,
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
  paramsTemp: ObservationsApiParams,
) {
  await getObservationsCountForResource(
    taxon,
    "selectedTaxa",
    appStore,
    paramsTemp,
  );
}

export async function addAllTaxaRecordToMapAndStore(appStore: MapStore) {
  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    colors: iNatOrange,
    taxon_id: "0",
  };
  let paramsTemp = appStore.observationsApiParams;
  appStore.color = iNatOrange;

  await fetchiNatMapDataForTaxon(allTaxaRecord, appStore, paramsTemp);
  await getObservationsCountForTaxon(allTaxaRecord, appStore, paramsTemp);

  // set taxon_id after getting map data
  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
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
  delete appStore.observationsApiParams.taxon_id;
  delete appStore.observationsApiParams.colors;
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

  // update observationsApiParams for bounding box
  if (placeId === 0) {
    delete appStore.observationsApiParams.nelat;
    delete appStore.observationsApiParams.nelng;
    delete appStore.observationsApiParams.swlat;
    delete appStore.observationsApiParams.swlng;
    // update observationsApiParams for places
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
  delete appStore.observationsApiParams.place_id;
  delete appStore.observationsApiParams.nelat;
  delete appStore.observationsApiParams.nelng;
  delete appStore.observationsApiParams.swlat;
  delete appStore.observationsApiParams.swlng;
  appStore.selectedPlaces = [];
}

export async function getObservationsCountForPlace(
  place: NormalizediNatPlace,
  appStore: MapStore,
  paramsTemp: ObservationsApiParams,
) {
  await getObservationsCountForResource(
    place,
    "selectedPlaces",
    appStore,
    paramsTemp,
  );
}

export function renderSelectedPlacesBoundaries(appStore: MapStore) {
  let map = appStore.map.map;
  if (!map) return;

  // add places layers
  appStore.selectedPlaces.forEach((place) => {
    let layer = renderResourceGeometryLayer(place, map, "place layer");

    appStore.placesMapLayers = {
      ...appStore.placesMapLayers,
      [place.id]: [layer as CustomGeoJSON],
    };
  });
}

// ================
// project
// ================

export function removeOneProjectFromStoreAndMap(
  appStore: MapStore,
  projectId: number,
) {
  if (appStore.projectsMapLayers) {
    let mapLayers = appStore.projectsMapLayers[projectId];

    if (mapLayers) {
      mapLayers.forEach((layer) => {
        layer.remove();
      });
    }

    delete appStore.projectsMapLayers[projectId];
  }

  appStore.selectedProjects = appStore.selectedProjects.filter(
    (item) => item.id !== projectId,
  );
  removeIdfromInatApiParams(appStore, "project_id", projectId);
}

export async function getObservationsCountForProject(
  project: NormalizediNatPlace,
  appStore: MapStore,
  paramsTemp: ObservationsApiParams,
) {
  await getObservationsCountForResource(
    project,
    "selectedProjects",
    appStore,
    paramsTemp,
  );
}

export async function getObservationsCountForUser(
  user: NormalizediNatUser,
  appStore: MapStore,
  paramsTemp: ObservationsApiParams,
) {
  await getObservationsCountForResource(
    user,
    "selectedUsers",
    appStore,
    paramsTemp,
  );
}

export function renderSelectedProjectsBoundaries(appStore: MapStore) {
  let map = appStore.map.map;
  if (!map) return;

  // add project layers
  appStore.selectedProjects.forEach((project) => {
    if (!project.geometry) return;

    let layer = renderResourceGeometryLayer(project, map, "project layer");

    appStore.projectsMapLayers = {
      ...appStore.projectsMapLayers,
      [project.id]: [layer as CustomGeoJSON],
    };
  });
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
  resourceName: MapStoreSelectedResourcesArrayKeys,
  appStore: MapStore,
  paramsTemp: ObservationsApiParams,
) {
  if (import.meta.env.VITE_CACHE === "true") {
    record.observations_count = -888;
    updateSelectedResource(record, resourceName, appStore);
    return;
  }

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
  resourceName: MapStoreSelectedResourcesArrayKeys,
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

export function renderResourceGeometryLayer(
  resource: NormalizediNatProject | NormalizediNatPlace,
  map: Map,
  layerDescription: string,
): L.GeoJSON {
  let options: any = {
    color: "red",
    fillColor: "none",
    layer_description: `${layerDescription}: ${resource.name}, ${resource.id}`,
  };
  let layer = L.geoJSON(resource.geometry as any, options);
  layer.addTo(map);
  return layer;
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

export function removeOneUserIdentifierFromStore(
  appStore: MapStore,
  userId: number,
) {
  appStore.selectedUsersIdentifiers = appStore.selectedUsersIdentifiers.filter(
    (item) => item.id !== userId,
  );
  removeIdfromInatApiParams(appStore, "ident_user_id", userId);
}

export function removeOneUnobservedByUserFromStore(appStore: MapStore) {
  appStore.selectedUnobservedByUser = {} as NormalizediNatUser;
  delete appStore.observationsApiParams.unobserved_by_user_id;
}

// ================
// misc
// ================

function removeTaxonId(appStore: MapStore) {
  if (appStore.selectedTaxa.length == 0) {
    delete appStore.observationsApiParams.taxon_id;
    delete appStore.observationsApiParams.colors;
    // get id of last taxa is selectedTaxa
  } else {
    let lastTaxon = appStore.selectedTaxa[appStore.selectedTaxa.length - 1];
    appStore.observationsApiParams.taxon_id = lastTaxon.id.toString();
    appStore.observationsApiParams.colors = lastTaxon.color;
  }
}

function setobservationsApiParams(
  appStore: MapStore,
  property: ObservationsApiParamsKeys,
  value: any,
) {
  let ids = removeValueFromCommaSeparatedString(
    value,
    appStore.observationsApiParams[property],
  );
  if (ids) {
    appStore.observationsApiParams[property] = ids;
  }
}

function removePlaceId(
  appStore: MapStore,
  property: ObservationsApiParamsKeys,
  value: any,
) {
  if (appStore.selectedPlaces.length === 0) {
    delete appStore.observationsApiParams.place_id;
  } else {
    let lastPlace = appStore.selectedPlaces[appStore.selectedPlaces.length - 1];
    if (lastPlace.id === value) {
    } else if (appStore.selectedPlaces.map((p) => p.id).includes(value)) {
    } else {
      setobservationsApiParams(appStore, property, value);
    }
  }
}

function removeProjectId(
  appStore: MapStore,
  property: ObservationsApiParamsKeys,
  value: any,
) {
  if (appStore.selectedProjects.length === 0) {
    delete appStore.observationsApiParams.project_id;
  } else {
    let lastRecord =
      appStore.selectedProjects[appStore.selectedProjects.length - 1];
    if (lastRecord.id === value) {
    } else if (appStore.selectedProjects.map((p) => p.id).includes(value)) {
    } else {
      setobservationsApiParams(appStore, property, value);
    }
  }
}

function removeUserId(
  appStore: MapStore,
  property: ObservationsApiParamsKeys,
  value: any,
) {
  if (appStore.selectedUsers.length === 0) {
    delete appStore.observationsApiParams.user_id;
  } else {
    let lastRecord = appStore.selectedUsers[appStore.selectedUsers.length - 1];
    if (lastRecord.id === value) {
    } else if (appStore.selectedUsers.map((p) => p.id).includes(value)) {
    } else {
      setobservationsApiParams(appStore, property, value);
    }
  }
}

export function removeIdfromInatApiParams(
  appStore: MapStore,
  property: ObservationsApiParamsKeys,
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

export function capitalizeFirstLetter(text: string) {
  return text && text[0].toUpperCase() + text.slice(1);
}

export function formatTaxonName(
  item: NormalizediNatTaxon | SpeciesCountTaxon | Taxon,
  appStore: MapStore,
  searchTerm = "",
) {
  let includeMatchedTerm = searchTerm.length > 0;
  let hasCommonName = true;
  let title;
  let titleAriaLabel;
  let subtitle;
  let subtitleAriaLabel;
  let commonName;
  let scientificName;
  let rank;

  // has common name
  if (item.preferred_common_name) {
    commonName = item.preferred_common_name
      .split(" ")
      .map((word) => {
        if (word !== "and") {
          return capitalizeFirstLetter(word);
        } else {
          return word;
        }
      })
      .join(" ");
  } else {
    hasCommonName = false;
  }

  // has scientific name
  if (item.name) {
    scientificName = item.name;
  }

  if (item.rank) {
    rank = item.rank;
  }

  // add optional (matched_term)
  if (includeMatchedTerm && isNormalizediNatTaxon(item) && item.matched_term) {
    if (item.matched_term.toLowerCase() === commonName?.toLowerCase()) {
    } else if (
      item.matched_term.toLowerCase() === scientificName?.toLowerCase()
    ) {
    } else if (
      !commonName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !scientificName?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      commonName += ` (${capitalizeFirstLetter(item.matched_term)})`;
    }
  }

  let nameOrder = appStore.viewMetadata.name_order;
  if (nameOrder === "cs") {
    title = commonName;
    titleAriaLabel = commonName ? "taxon common name" : undefined;
    subtitle = scientificName;
    subtitleAriaLabel = scientificName ? "taxon scientific name" : undefined;
  } else if (nameOrder === "sc") {
    title = scientificName;
    titleAriaLabel = scientificName ? "taxon scientific name" : undefined;
    subtitle = commonName;
    subtitleAriaLabel = commonName ? "taxon common name" : undefined;
  } else {
    title = scientificName;
    titleAriaLabel = scientificName ? "taxon scientific name" : undefined;
  }

  return {
    title,
    titleAriaLabel,
    subtitle,
    subtitleAriaLabel,
    hasCommonName,
    rank,
  };
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
  currentValue?: string | number,
) {
  if (newValue === undefined) return;

  if (currentValue === undefined) {
    currentValue = newValue.toString();
  } else {
    if (typeof currentValue === "number") {
      currentValue = currentValue.toString();
    }
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
    params: ObservationsApiParams;
    string: string;
  },
) {
  // update store formFilters
  appStore.formFilters = filtersResults;
  loggerFilters("------------ updateStoreUsingFilters");
  loggerFilters("default:", mapStore.observationsApiParams);
  loggerFilters("appStore:", appStore.observationsApiParams);
  loggerFilters("filtersResults", filtersResults);

  for (let [k, _value] of Object.entries(appStore.observationsApiParams)) {
    let key = k as ObservationsApiParamsKeys;
    loggerFilters(key, _value);

    // ignore params that can't be changed in the filter modal
    if (ObservationsApiNonFilterableNames.includes(key)) {
      continue;
    }

    if (key === "verifiable") {
      if (filtersResults.params.verifiable === undefined) {
        delete appStore.observationsApiParams[key];
      }
    } else if (key === "spam") {
    } else if (
      appStore.observationsApiParams[key] !== filtersResults.params[key]
    ) {
      if (filtersResults.params[key] === undefined) {
        delete appStore.observationsApiParams[key];
      }
    }
  }

  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    ...filtersResults.params,
  };
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
    view = "view-species";
  } else if (targetView === "identifiers") {
    view = "view-identifiers";
  } else if (targetView === "observers") {
    view = "view-observers";
  } else if (targetView === "observations") {
    view = "view-map";
  } else if (targetView === "identifications") {
    view = "view-identifications";
  } else {
    throw Error("Need to add view /template");
  }
  return view;
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

export function cleanupObervationsParamsForRecord(
  inatParams: ObservationsApiParams,
) {
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

export function cleanupObervationsParams(appStore: MapStore) {
  let params = cleanupParams(appStore);
  return params.toString();
}

export function cleanupObervationsObserversParams(appStore: MapStore) {
  let params = cleanupParams(appStore);

  params.delete("order");
  params.delete("order_by");

  return params.toString();
}

export function cleanupIdentificationParams(appStore: MapStore) {
  let params = cleanupParams(appStore);

  let ident_user_id = params.get("ident_user_id");
  if (ident_user_id) {
    params.set("user_id", ident_user_id);
    params.delete("ident_user_id");
  }

  return params.toString();
}

export function cleanupIdentificationsObserversParams(appStore: MapStore) {
  let params = cleanupParams(appStore);

  params.delete("order");
  params.delete("order_by");

  return params.toString();
}
