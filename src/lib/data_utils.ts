import type { Layer, Map, TileLayer } from "leaflet";
import L from "leaflet";

import type {
  NormalizediNatTaxonType,
  AppStoreType,
  ObservationsApiParamsType,
  CustomLayerOptionsType,
  CustomGeoJSONType,
  ObservationsApiParamsKeysType,
  NormalizediNatPlaceType,
  NormalizediNatProjectType,
  NormalizediNatUserType,
  AppStoreSelectedResourcesKeysType,
  AppStoreTypeParamsKeys,
  IdentificationsApiParamsType,
  IdentificationsApiParamsKeysType,
  MapTilesAPIParamsType,
  ObservationTilesSettingType,
  LeafletControl,
} from "../types/app";
import { addOverlayToMap } from "./map_utils.ts";
import { getiNatMapTiles } from "./inat_api.ts";
import {
  allTaxaRecord,
  annotationsTerms,
  speciesOrHigherRanks,
  subspeciesRanks,
  taxonRanks,
} from "../data/inat_data.ts";
import {
  identificationsApiNonFilterableNames,
  observationsApiNonFilterableNames,
} from "../data/app_data.ts";
import { iNatOrange } from "./map_colors_utils.ts";
import { loggerFilters } from "./logger.ts";
import { mapStore } from "./store.ts";
import type {
  IdentificationsResult,
  ObservationsObserversResult,
  ObservationsResult,
  ResourceIdentifiersResult,
  ResourceSpeciesCountResult,
  SpeciesCountTaxon,
  Taxon,
  TaxonomyResult,
  TaxonRanks,
} from "../types/inat_api";
import {
  isIdentificationsResult,
  isNormalizediNatTaxonType,
  isObservationsResult,
  isResourceIdentifierResult,
  isResourceSpeciesResult,
} from "../types/utils.ts";
import { updateCountForOneRecord } from "./count_utils.ts";
import {
  cleanupIdentificationsMapParams,
  cleanupObservationsMapParams,
} from "./cleanup_params_utils.ts";

import squareImg from "../assets/images/square.jpeg";
import mediumImg from "../assets/images/medium.jpeg";
import userMedium from "../assets/images/user_medium.jpg";
import userThumb from "../assets/images/user_thumb.jpg";
import { getItem } from "./localStorage.ts";

// called when user select taxa or place
export async function fetchiNatMapDataForTaxon(
  taxonObj: NormalizediNatTaxonType,
  appStore: AppStoreType,
) {
  let map = appStore.map.map;
  let layerControl = appStore.map.layerControl;

  if (map === null) return;
  if (layerControl === null) return;

  let mapParams = {} as MapTilesAPIParamsType;
  if (isObservationsCheck(appStore)) {
    let params = cleanupObservationsMapParams(appStore.observationsApiParams);
    mapParams = {
      ...params,
      color: taxonObj.color,
    };
    if (taxonObj.id !== 0) {
      mapParams.taxon_id = taxonObj.id;
    }
  } else {
    let params = cleanupIdentificationsMapParams(
      appStore.identificationsApiParams,
    );
    mapParams = {
      ...params,
      color: taxonObj.color,
    };
    if (taxonObj.id !== 0) {
      mapParams.ident_taxon_id = taxonObj.id;
    }
  }

  // get iNaturalist map layers
  let { iNatGrid, iNatHeatmap, iNatTaxonRange, iNatPoint } = getiNatMapTiles(
    mapParams,
    taxonObj,
    appStore.record_type,
  );

  let iNatGridLayer = addLayerToMapAndStore(
    iNatGrid,
    taxonObj,
    appStore,
    map,
    layerControl,
  );
  let iNatPointLayer = addLayerToMapAndStore(
    iNatPoint,
    taxonObj,
    appStore,
    map,
    layerControl,
  );
  let iNatHeatmapLayer = addLayerToMapAndStore(
    iNatHeatmap,
    taxonObj,
    appStore,
    map,
    layerControl,
  );
  let iNatTaxonRangeLayer;
  if (iNatTaxonRange) {
    iNatTaxonRangeLayer = addLayerToMapAndStore(
      iNatTaxonRange,
      taxonObj,
      appStore,
      map,
      layerControl,
    );
  }

  let layers: (TileLayer | undefined)[] = [
    iNatGridLayer,
    iNatPointLayer,
    iNatHeatmapLayer,
  ];
  if (iNatTaxonRangeLayer) {
    layers.push(iNatTaxonRangeLayer);
  }

  return layers;
}

function addLayerToMapAndStore(
  layer: ObservationTilesSettingType,
  taxonObj: NormalizediNatTaxonType,
  appStore: AppStoreType,
  map: Map,
  layerControl: L.Control.Layers,
) {
  // if no activeLayers, add layer to map
  if (appStore.map.activeLayers.size === 0) {
    appStore.map.activeLayers.add(layer.options.layer_description);
    return addOverlayToMap(layer, map, layerControl, true);
  }

  // if layer is in activeLayers, add to map
  let test1 = isActiveLayer(layer, appStore);
  if (test1) {
    appStore.map.activeLayers.add(layer.options.layer_description);
    return addOverlayToMap(layer, map, layerControl, true);
  }

  // if taxon is not in activeLayers, add to map
  let test2 = [...appStore.map.activeLayers].every((activeLayer) => {
    let parts = activeLayer.split(",");
    let taxonId = parts[1].trim().split(" ")[1];
    return Number(taxonId) !== taxonObj.id;
  });
  if (test2) {
    appStore.map.activeLayers.add(layer.options.layer_description);
    return addOverlayToMap(layer, map, layerControl, true);
  }

  // if layer has partial match with one of the activeLayer, add to map
  let relatedLayerName = [...appStore.map.activeLayers].find((activeLayer) => {
    let layerTypeTaxon = activeLayer.split(",").slice(0, 2).join(",");
    return layer.options.layer_description.startsWith(layerTypeTaxon);
  });
  if (relatedLayerName) {
    appStore.map.activeLayers.delete(relatedLayerName);
    appStore.map.activeLayers.add(layer.options.layer_description);
    return addOverlayToMap(layer, map, layerControl, true);
  }

  // add inactive layer to map
  return addOverlayToMap(layer, map, layerControl, false);
}

// ================
// default taxon
// ================

export async function addDefaultTaxaRecordToStore(
  appStore: AppStoreType,
  fetchCount = true,
) {
  let taxaResource: AppStoreSelectedResourcesKeysType;
  if (isObservationsCheck(appStore)) {
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      colors: iNatOrange,
      taxon_id: "0",
    };
    taxaResource = "selectedTaxa";
  } else {
    appStore.identificationsApiParams = {
      ...appStore.identificationsApiParams,
      colors: iNatOrange,
      taxon_id: "0",
    };
    taxaResource = "selectedTaxaIdentified";
  }

  updateSelectedResource(
    structuredClone(allTaxaRecord),
    taxaResource,
    appStore,
  );

  appStore.color = iNatOrange;

  if (fetchCount) {
    let params = isObservationsCheck(appStore)
      ? { ...appStore.observationsApiParams }
      : { ...appStore.identificationsApiParams };

    await updateCountForOneRecord(
      structuredClone(allTaxaRecord),
      taxaResource,
      appStore,
      params,
    );
  }
}

export async function addDefaultTaxaRecordToMap(appStore: AppStoreType) {
  let layers = await fetchiNatMapDataForTaxon(
    structuredClone(allTaxaRecord),
    appStore,
  );
  if (!layers) return;

  if (isObservationsCheck(appStore)) {
    appStore.taxaMapLayers = {
      ...appStore.taxaMapLayers,
      [allTaxaRecord.id]: layers,
    };
  } else {
    appStore.taxaIdentifiedMapLayers = {
      ...appStore.taxaIdentifiedMapLayers,
      [allTaxaRecord.id]: layers,
    };
  }
}

export async function addDefaultTaxa(appStore: AppStoreType) {
  if (
    appStore.selectedTaxa.length === 0 &&
    appStore.selectedTaxaIdentified.length === 0
  ) {
    await addDefaultTaxonToStoreAndMap(appStore);
  } else if (
    isObservationsCheck(appStore) &&
    appStore.selectedTaxa.length === 0
  ) {
    if (appStore.selectedTaxaIdentified[0].id === 0) {
      removeDefaultTaxonFromStoreAndMap(appStore);
    }
    await addDefaultTaxonToStoreAndMap(appStore);
  } else if (
    isIdentificationsCheck(appStore) &&
    appStore.selectedTaxaIdentified.length === 0
  ) {
    if (appStore.selectedTaxa[0].id === 0) {
      removeDefaultTaxonFromStoreAndMap(appStore);
    }
    await addDefaultTaxonToStoreAndMap(appStore);
  } else {
  }
}

export async function addDefaultTaxonToStoreAndMap(appStore: AppStoreType) {
  await addDefaultTaxaRecordToStore(appStore);
  await addDefaultTaxaRecordToMap(appStore);
}

export function removeDefaultTaxonFromStoreAndMap(appStore: AppStoreType) {
  let layerControl = appStore.map.layerControl;
  let isObservations = isObservationsCheck(appStore);

  if (layerControl) {
    // remove from map
    let mapLayers = isObservations
      ? appStore.taxaMapLayers
      : appStore.taxaIdentifiedMapLayers;
    clearMapLayers(mapLayers, layerControl);
  }

  // remove from store
  if (isObservations) {
    clearSelectedTaxa(appStore);
  } else {
    clearSelectedTaxaIdentified(appStore);
  }

  appStore.color = "";
}

export function removeDefaultTaxonFromStoreAndMapSwitchPage(
  appStore: AppStoreType,
) {
  let layerControl = appStore.map.layerControl;
  let isObservations = isObservationsCheck(appStore);

  // remove from map
  if (layerControl) {
    let mapLayers = isObservations
      ? appStore.taxaIdentifiedMapLayers
      : appStore.taxaMapLayers;
    clearMapLayers(mapLayers, layerControl);
  }

  // remove from store
  if (isObservations) {
    clearSelectedTaxaIdentified(appStore);
  } else {
    clearSelectedTaxa(appStore);
  }

  appStore.color = "";
}

function clearMapLayers(
  mapLayers: { [index: string]: TileLayer[] },
  layerControl: L.Control.Layers,
) {
  Object.values(mapLayers).forEach((layers) => {
    layers.forEach((layer) => {
      // remove layer from layer control
      layerControl.removeLayer(layer);
      // remove layer from map
      layer.remove();
    });
  });
}

function clearSelectedTaxa(appStore: AppStoreType) {
  delete appStore.observationsApiParams.taxon_id;
  delete appStore.observationsApiParams.colors;
  appStore.selectedTaxa = [];
  appStore.taxaMapLayers = {};
}

function clearSelectedTaxaIdentified(appStore: AppStoreType) {
  delete appStore.identificationsApiParams.taxon_id;
  delete appStore.identificationsApiParams.colors;
  appStore.selectedTaxaIdentified = [];
  appStore.taxaIdentifiedMapLayers = {};
}

// ================
// map layers
// ================

export function renderSelectedPlacesBoundaries(appStore: AppStoreType) {
  let map = appStore.map.map;
  if (!map) return;

  // add places layers
  appStore.selectedPlaces.forEach((place) => {
    let layer = renderResourceGeometryLayer(place, map, "place layer");

    appStore.placesMapLayers = {
      ...appStore.placesMapLayers,
      [place.id]: [layer as CustomGeoJSONType],
    };
  });
}

export function renderSelectedProjectsBoundaries(appStore: AppStoreType) {
  let map = appStore.map.map;
  if (!map) return;

  // add project layers
  appStore.selectedProjects.forEach((project) => {
    if (!project.geometry) return;

    let layer = renderResourceGeometryLayer(project, map, "project layer");

    appStore.projectsMapLayers = {
      ...appStore.projectsMapLayers,
      [project.id]: [layer as CustomGeoJSONType],
    };
  });
}

// ================
// selected resource
// ================

export function updateSelectedResource(
  record:
    | NormalizediNatPlaceType
    | NormalizediNatTaxonType
    | NormalizediNatProjectType
    | NormalizediNatUserType,
  resourceName: AppStoreSelectedResourcesKeysType,
  appStore: AppStoreType,
) {
  let records = [];
  let ids: number[] = [];

  appStore[resourceName].forEach((selectedResource) => {
    // update existing taxon
    if (selectedResource.id === record.id) {
      records.push(record);
      // keep existing taxon
    } else {
      records.push(selectedResource);
    }
    ids.push(selectedResource.id);
  });

  // add new record
  if (!ids.includes(record.id)) {
    records.push(record);
  }

  appStore[resourceName] = records as any;
}

export function renderResourceGeometryLayer(
  resource: NormalizediNatProjectType | NormalizediNatPlaceType,
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
// misc
// ================

export function updateSelectedTaxaColor(
  appStore: AppStoreType,
  resource: AppStoreSelectedResourcesKeysType,
) {
  let isObservations = isObservationsCheck(appStore);
  if (appStore[resource].length > 0) {
    if (isObservations) {
      appStore.observationsApiParams.colors = appStore.selectedTaxa
        .map((r) => r.color)
        .join(",");
    } else {
      appStore.identificationsApiParams.colors = appStore.selectedTaxaIdentified
        .map((r) => r.color)
        .join(",");
    }
  }
  if (
    appStore.selectedTaxa.length === 0 &&
    appStore.selectedTaxaIdentified.length === 0
  ) {
    if (isObservations) {
      delete appStore.observationsApiParams.colors;
    } else {
      delete appStore.identificationsApiParams.colors;
    }
  }
}

function removeResourceId(
  appStore: AppStoreType,
  resource: AppStoreSelectedResourcesKeysType,
  property: ObservationsApiParamsKeysType | IdentificationsApiParamsKeysType,
  targetId: any,
) {
  let isObservations = isObservationsCheck(appStore);

  // do nothing if existing resource has corresponding  target id
  if (appStore[resource].map((p) => p.id).includes(targetId)) {
    // if no selected resource, delete property
  } else if (appStore[resource].length === 0) {
    if (isObservations) {
      delete appStore.observationsApiParams[
        property as ObservationsApiParamsKeysType
      ];
    } else {
      delete appStore.identificationsApiParams[
        property as IdentificationsApiParamsKeysType
      ];
    }
    // NOTE: only allow one user id because iNat identifications api returns
    // zero records if there are multiple user ids
  } else if (resource === "selectedUsersIdentifiers" && !isObservations) {
    // set user id to last user id
    let ids = appStore.selectedUsersIdentifiers
      .map((r) => r.id)
      .filter((id) => id !== targetId);
    appStore.identificationsApiParams.user_id = ids[ids.length - 1].toString();
  } else {
    // remove target id from comma separated string
    let resourceParams = getResourceApiParams(isObservations);
    let ids = removeValueFromCommaSeparatedString(
      targetId,
      // @ts-ignore
      appStore[resourceParams][property],
    );
    if (ids) {
      // @ts-ignore
      appStore[resourceParams][property] = ids;
    }
  }
}

export function removeIdfromInatApiParams(
  appStore: AppStoreType,
  resource: AppStoreSelectedResourcesKeysType,
  value: any,
) {
  let isObservations = isObservationsCheck(appStore);
  let isIdentifications = isIdentificationsCheck(appStore);

  // NOTE: update when adding selectedResource
  if (resource === "selectedTaxaIdentified") {
    if (isObservations) {
      removeResourceId(appStore, resource, "ident_taxon_id", value);
    } else {
      removeResourceId(appStore, resource, "taxon_id", value);
    }
    updateSelectedTaxaColor(appStore, resource);
  } else if (resource === "selectedTaxa") {
    if (isObservations) {
      removeResourceId(appStore, resource, "taxon_id", value);
    } else {
      removeResourceId(appStore, resource, "observation_taxon_id", value);
    }
    updateSelectedTaxaColor(appStore, resource);
  } else if (resource === "selectedPlaces") {
    removeResourceId(appStore, resource, "place_id", value);
  } else if (resource === "selectedProjects") {
    removeResourceId(appStore, resource, "project_id", value);
  } else if (resource === "selectedUsers") {
    if (isObservations) {
      removeResourceId(appStore, resource, "user_id", value);
    }
  } else if (resource === "selectedUsersIdentifiers") {
    if (isObservations) {
      removeResourceId(appStore, resource, "ident_user_id", value);
    } else {
      removeResourceId(appStore, resource, "user_id", value);
    }
  } else if (resource === "selectedUsersAnnotators") {
    if (isObservations) {
      removeResourceId(appStore, resource, "annotation_user_id", value);
    }
  } else if (resource === "selectedWithoutPlaces") {
    removeResourceId(appStore, resource, "not_in_place", value);
  } else if (resource === "selectedWithoutTaxa") {
    if (isObservations) {
      removeResourceId(appStore, resource, "without_taxon_id", value);
    } else {
      removeResourceId(
        appStore,
        resource,
        "without_observation_taxon_id",
        value,
      );
    }
  } else if (resource === "selectedWithoutTaxaIdentified") {
    if (isIdentifications) {
      removeResourceId(appStore, resource, "without_taxon_id", value);
    }
  } else if (resource === "selectedWithoutProjects") {
    removeResourceId(appStore, resource, "not_in_project", value);
  } else if (resource === "selectedWithoutUsers") {
    removeResourceId(appStore, resource, "not_user_id", value);
  } else if (resource === "selectedWithoutUsersIdentifiers") {
    removeResourceId(appStore, resource, "without_ident_user_id", value);
  } else {
    throw new Error(
      `removeIdfromInatApiParams not implemented for ${resource}`,
    );
  }
}

export function capitalizeFirstLetter(text: string) {
  return text && text[0].toUpperCase() + text.slice(1);
}

export function formatTaxonName(
  item: NormalizediNatTaxonType | SpeciesCountTaxon | Taxon,
  appStore: AppStoreType,
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
  if (
    includeMatchedTerm &&
    isNormalizediNatTaxonType(item) &&
    item.matched_term
  ) {
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

export function leafletMapLayers(
  appStore: AppStoreType,
  field = "layer_description" as keyof CustomLayerOptionsType,
) {
  let items: any[] = [];
  if (appStore.map.map) {
    appStore.map.map.eachLayer((layer) => {
      let options = layer.options as CustomLayerOptionsType;
      if (options[field]) {
        items.push(options[field]);
      }
    });
  }

  return items;
}

export function leafletControlLayers(appStore: AppStoreType) {
  let control = appStore.map.layerControl as LeafletControl;
  if (control) {
    return control._layers.map((l) => l.layer.options.control_name);
  }
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

export type FiltersResults = {
  params: ObservationsApiParamsType | IdentificationsApiParamsType;
  string: string;
};

export function updateStoreUsingFilters(
  appStore: AppStoreType,
  filtersResults: FiltersResults,
) {
  let isObservations = isObservationsCheck(appStore);
  let resourceApiParams = getResourceApiParams(isObservations);

  // update store formFilters
  appStore.formFilters = filtersResults;
  loggerFilters("------------ updateStoreUsingFilters");
  loggerFilters("default:", mapStore[resourceApiParams]);
  loggerFilters("appStore:", appStore[resourceApiParams]);
  loggerFilters("filtersResults", filtersResults);

  if (isObservations) {
    handleObservationsFilters(filtersResults, appStore);
  } else {
    handleIdentificationsFilters(filtersResults, appStore);
  }

  appStore[resourceApiParams] = {
    ...appStore[resourceApiParams],
    ...filtersResults.params,
  };
}

function handleObservationsFilters(
  filtersResults: FiltersResults,
  appStore: AppStoreType,
) {
  for (let [k, _value] of Object.entries(appStore.observationsApiParams)) {
    let key = k as ObservationsApiParamsKeysType;
    loggerFilters(key, _value);

    // ignore params that can't be changed in the filter modal
    if (observationsApiNonFilterableNames.includes(key)) {
      continue;
    }

    let params = filtersResults.params as ObservationsApiParamsType;
    if (key === "verifiable") {
      if (params.verifiable === undefined) {
        delete appStore.observationsApiParams[key];
      }
    } else if (key === "spam") {
    } else if (appStore.observationsApiParams[key] !== params[key]) {
      if (params[key] === undefined) {
        delete appStore.observationsApiParams[key];
      }
    }
  }
}

function handleIdentificationsFilters(
  filtersResults: FiltersResults,
  appStore: AppStoreType,
) {
  for (let [k, _value] of Object.entries(appStore.identificationsApiParams)) {
    let key = k as IdentificationsApiParamsKeysType;
    loggerFilters(key, _value);

    // ignore params that can't be changed in the filter modal
    if (identificationsApiNonFilterableNames.includes(key)) {
      continue;
    }

    let params = filtersResults.params as IdentificationsApiParamsType;
    if (appStore.identificationsApiParams[key] !== params[key]) {
      if (params[key] === undefined) {
        delete appStore.identificationsApiParams[key];
      }
    }
  }
}

export function isIdentificationsCheck(appStore: AppStoreType) {
  return appStore.record_type === "identifications";
}

export function isObservationsCheck(appStore: AppStoreType) {
  return appStore.record_type === "observations";
}

export function isOtherCheck(appStore: AppStoreType) {
  return appStore.record_type === "about";
}

export function isSubpeciesCheck(appStore: AppStoreType) {
  if (appStore.observationsApiParams.rank === undefined) return false;

  return appStore.observationsApiParams.rank.split(",").some((rank) => {
    return subspeciesRanks.includes(rank);
  });
}

export function isSpeciesOrHigerCheck(appStore: AppStoreType) {
  if (appStore.observationsApiParams.rank === undefined) return false;

  return appStore.observationsApiParams.rank.split(",").some((rank) => {
    return speciesOrHigherRanks.includes(rank);
  });
}

export function isPopularFieldCategory(appStore: AppStoreType) {
  let graphsMetadata = appStore.viewMetadata.observations_observations.graphs;
  if (graphsMetadata && graphsMetadata.category) {
    return Object.keys(annotationsTerms).includes(graphsMetadata.category);
  }
  return false;
}

export function isPopularFieldCategoryMap(appStore: AppStoreType) {
  let metadata = appStore.viewMetadata.observations_observations.map;
  if (metadata && metadata.category) {
    return Object.keys(annotationsTerms).includes(metadata.category);
  }
  return false;
}

export function isAnimatedMapCategory(appStore: AppStoreType) {
  let category = appStore.viewMetadata.observations_observations.map.category;
  if (category) {
    return (
      category === "year" ||
      category === "month" ||
      category === "month_of_year"
    );
  }
  return false;
}

export function isActiveLayer(
  layer: ObservationTilesSettingType | Layer,
  appStore: AppStoreType,
) {
  // @ts-ignore
  return appStore.map.activeLayers.has(layer.options.layer_description);
}

export function isActiveBaseMap(
  layer: ObservationTilesSettingType | Layer,
  appStore: AppStoreType,
) {
  // @ts-ignore
  return appStore.map.activeBasemap.has(layer.options.layer_description);
}

export function getResourceApiParams(isObservations: boolean) {
  return (
    isObservations ? "observationsApiParams" : "identificationsApiParams"
  ) as AppStoreTypeParamsKeys;
}

// reset page when changing filters so that pagination goes back to page 1
export function resetPageNumber(appStore: AppStoreType) {
  if (isObservationsCheck(appStore)) {
    delete appStore.observationsApiParams.page;
  } else {
    delete appStore.identificationsApiParams.page;
  }

  delete appStore.viewMetadata.identifications_identifications.page;
  delete appStore.viewMetadata.identifications_identifiers.page;
  delete appStore.viewMetadata.identifications_observers.page;
  delete appStore.viewMetadata.identifications_species.page;
  delete appStore.viewMetadata.observations_identifiers.page;
  delete appStore.viewMetadata.observations_observations.page;
  delete appStore.viewMetadata.observations_observers.page;
  delete appStore.viewMetadata.observations_species.page;
}

export function replaceWithCacheImages(
  results:
    | IdentificationsResult[]
    | ObservationsResult[]
    | ResourceIdentifiersResult[]
    | ObservationsObserversResult[]
    | ResourceSpeciesCountResult[],
) {
  if (isIdentificationsResult(results)) {
    replaceWithCacheImagesIdentifications(results);
  } else if (isObservationsResult(results)) {
    replaceWithCacheImagesObservations(results);
  } else if (isResourceIdentifierResult(results)) {
    replaceWithCacheImagesBasicUser(results);
  } else if (isResourceSpeciesResult(results)) {
    replaceWithCacheImagesBasicTaxon(results);
  }

  return results;
}

function replaceWithCacheImagesBasicTaxon(
  results: ResourceSpeciesCountResult[],
) {
  results.forEach((result) => {
    if (result.taxon.default_photo) {
      result.taxon.default_photo.medium_url = mediumImg;
      result.taxon.default_photo.square_url = squareImg;
      result.taxon.default_photo.url = squareImg;
    }
  });
}

function replaceWithCacheImagesBasicUser(results: ResourceIdentifiersResult[]) {
  results.forEach((result) => {
    result.user.icon = userThumb;
    result.user.icon_url = userMedium;
  });
}

function replaceWithCacheImagesObservations(results: ObservationsResult[]) {
  results.forEach((result) => {
    result.photos.forEach((photo) => {
      photo.url = mediumImg;
    });
  });
}

function replaceWithCacheImagesIdentifications(
  results: IdentificationsResult[],
) {
  results.forEach((result) => {
    if (result.observation.taxon.default_photo) {
      result.observation.taxon.default_photo.medium_url = mediumImg;
      result.observation.taxon.default_photo.square_url = squareImg;
      result.observation.taxon.default_photo.url = squareImg;
    }

    if (result.observation.observation_photos) {
      result.observation.photos.forEach((photo) => {
        photo.url = mediumImg;
      });
    }

    result.observation.user.icon = userThumb;
    result.observation.user.icon_url = userMedium;

    result.observation.identifications.forEach((ident) => {
      if (ident.user) {
        ident.user.icon = userThumb;
        ident.user.icon_url = userMedium;
      }
      if (ident.taxon?.default_photo) {
        ident.taxon.default_photo.medium_url = mediumImg;
        ident.taxon.default_photo.square_url = squareImg;
        ident.taxon.default_photo.url = squareImg;
      }
    });
  });

  return results;
}

export function setPerPage(appStore: AppStoreType) {
  let defaultPerPage = 24;
  let view = appStore.currentView;
  if (!view) return defaultPerPage;

  let viewPerPage = appStore.viewMetadata[view].perPage;
  let resourceParams = getResourceApiParams(isObservationsCheck(appStore));
  let savedPerPage;
  if (
    view === "observations_observations" ||
    view === "identifications_identifications"
  ) {
    savedPerPage = getItem("perPageObservations");
  }
  appStore[resourceParams].per_page = savedPerPage || viewPerPage;
}

export function sortRanks(ranks: TaxonRanks[]) {
  let ranksAndIndex: TaxonRanks[] = [];
  ranks.forEach((rank) => {
    ranksAndIndex[taxonRanks.indexOf(rank)] = rank;
  });
  return ranksAndIndex.filter((r) => r);
}

export function findAncestorForIdAndRank(
  taxonId: number,
  targetRank: TaxonRanks,
  taxonomyResults: TaxonomyResult[],
) {
  let ancestor = {} as TaxonomyResult | undefined;
  let targetTaxon = taxonomyResults.find((taxon) => taxon.id === taxonId);
  let doLoop = true;
  let count = 0;
  while (doLoop) {
    ancestor = taxonomyResults.find(
      (taxon) => taxon.id === targetTaxon?.parent_id,
    );
    if (ancestor === undefined) {
      targetTaxon = ancestor;
    } else if (ancestor && ancestor.rank == targetRank) {
      doLoop = false;
    } else if (ancestor.rank === "stateofmatter") {
      doLoop = false;
    } else if (count > 50) {
      doLoop = false;
    } else {
      targetTaxon = ancestor;
    }
    count += 1;
  }

  return ancestor;
}
