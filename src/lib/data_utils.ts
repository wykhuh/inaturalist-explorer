import type { Map, TileLayer } from "leaflet";
import L from "leaflet";

import type {
  NormalizediNatTaxonType,
  AppStoreType,
  ObservationsApiParamsType,
  CustomLayerOptionsType,
  CustomLayerType,
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
} from "../types/app";
import { addOverlayToMap } from "./map_utils.ts";
import { getiNatMapTiles } from "./inat_api.ts";
import { allTaxaRecord } from "../data/inat_data.ts";
import {
  identificationsApiNonFilterableNames,
  observationsApiNonFilterableNames,
} from "../data/app_data.ts";
import { iNatOrange } from "./map_colors_utils.ts";
import { logger, loggerFilters } from "./logger.ts";
import { mapStore } from "./store.ts";
import type {
  IdentificationsResult,
  ObservationsObserversResult,
  ObservationsResult,
  ResourceIdentifiersResult,
  ResourceSpeciesCountResult,
  SpeciesCountTaxon,
  Taxon,
} from "../types/inat_api";
import {
  isIdentificationsResult,
  isNormalizediNatTaxonType,
  isObservationsResult,
  isResourceIdentifierResult,
  isResourceSpeciesResult,
} from "../types/utils.ts";
import { updateCountForOne } from "./count_utils.ts";
import {
  cleanupIdentificationsMapParams,
  cleanupObservationsMapParams,
} from "./cleanup_params_utils.ts";

import squareImg from "../assets/images/square.jpeg";
import mediumImg from "../assets/images/medium.jpeg";
import userMedium from "../assets/images/user_medium.jpg";
import userThumb from "../assets/images/user_thumb.jpg";

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
      taxon_id: `${taxonObj.id}`,
      color: taxonObj.color,
    };
  } else {
    let params = cleanupIdentificationsMapParams(
      appStore.identificationsApiParams,
    );
    mapParams = {
      ...params,
      taxon_id: `${taxonObj.id}`,
      color: taxonObj.color,
    };
  }

  // get iNaturalist map layers
  let { iNatGrid, iNatHeatmap, iNatTaxonRange, iNatPoint } = getiNatMapTiles(
    mapParams,
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
// default taxon
// ================

export async function addDefaultTaxaRecordToStore(appStore: AppStoreType) {
  if (isObservationsCheck(appStore)) {
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      colors: iNatOrange,
      taxon_id: "0",
    };
  } else if (isIdentificationsCheck(appStore)) {
    appStore.identificationsApiParams = {
      ...appStore.identificationsApiParams,
      observation_taxon_id: "0",
    };
  }

  appStore.color = iNatOrange;
  await updateCountForOne(
    structuredClone(allTaxaRecord),
    "selectedTaxa",
    appStore,
    appStore.observationsApiParams,
  );
}

export async function addDefaultTaxaRecordToMap(appStore: AppStoreType) {
  await fetchiNatMapDataForTaxon(structuredClone(allTaxaRecord), appStore);
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

function updateStoreColor(
  appStore: AppStoreType,
  resource: AppStoreSelectedResourcesKeysType,
) {
  if (appStore[resource].length == 0) {
    if (isObservationsCheck(appStore)) {
      delete appStore.observationsApiParams.colors;
    }
  } else {
    // delete color
    if (isObservationsCheck(appStore)) {
      appStore.observationsApiParams.colors = appStore.selectedTaxa
        .map((r) => r.color)
        .join(",");
    }
  }
}

function removeResourceId(
  appStore: AppStoreType,
  resource: AppStoreSelectedResourcesKeysType,
  property: ObservationsApiParamsKeysType | IdentificationsApiParamsKeysType,
  value: any,
) {
  let isObservations = isObservationsCheck(appStore);

  if (appStore[resource].length === 0) {
    if (isObservations) {
      delete appStore.observationsApiParams[
        property as ObservationsApiParamsKeysType
      ];
    } else {
      delete appStore.identificationsApiParams[
        property as IdentificationsApiParamsKeysType
      ];
    }
  } else {
    if (appStore[resource].map((p) => p.id).includes(value)) {
    } else {
      if (isObservations) {
        setObservationsApiParams(
          appStore,
          property as ObservationsApiParamsKeysType,
          value,
        );
      } else {
        setIdentificationsApiParams(
          appStore,
          property as IdentificationsApiParamsKeysType,
          value,
        );
      }
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
    } else {
      removeResourceId(appStore, resource, "taxon_id", value);
      updateStoreColor(appStore, resource);
    }
  } else if (resource === "selectedTaxa") {
    if (isObservations) {
      removeResourceId(appStore, resource, "taxon_id", value);
      updateStoreColor(appStore, resource);
    } else {
      removeResourceId(appStore, resource, "observation_taxon_id", value);
    }
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
  } else {
    throw new Error(
      `removeIdfromInatApiParams not implemented for ${resource}`,
    );
  }
}

function setObservationsApiParams(
  appStore: AppStoreType,
  property: ObservationsApiParamsKeysType,
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

function setIdentificationsApiParams(
  appStore: AppStoreType,
  property: IdentificationsApiParamsKeysType,
  value: any,
) {
  let ids = removeValueFromCommaSeparatedString(
    value,
    appStore.identificationsApiParams[property],
  );
  if (ids) {
    appStore.identificationsApiParams[property] = ids;
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

export function leafletVisibleLayers(appStore: AppStoreType, strict = false) {
  let layer_descriptions: any[] = [];
  if (appStore.map.map) {
    appStore.map.map.eachLayer((lay) => {
      let layer = lay as unknown as CustomLayerType;
      let options = layer.options as CustomLayerOptionsType;

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
  delete appStore.viewMetadata.identifications_observations.page;
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
      result.observation.observation_photos.forEach((photo) => {
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
