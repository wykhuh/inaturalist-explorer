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
} from "./inat_api.ts";
import {
  fieldsWithAny,
  iNatApiNames,
  iNatApiNonFilterableNames,
  allTaxa,
} from "./inat_data.ts";

import { renderTaxaList, renderPlacesList } from "./autocomplete_utils.ts";
import type { Map } from "leaflet";
import type { PlacesResult, TaxaResult } from "../types/inat_api";
import { iNatOrange } from "./map_colors_utils.ts";

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

  // if no selected taxa, load allTaxa
  if (appStore.selectedTaxa.length === 0) {
    await addAllTaxaToMapAndStore(appStore);
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
    await fetchiNatMapDataForTaxon(taxon, appStore);
    await getObservationsCountForTaxon(taxon, appStore);
  }

  renderTaxaList(appStore);
  renderPlacesList(appStore);
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
    taxonObj.id,
    appStore.inatApiParams,
  );

  let title = taxonObj.display_name;
  if (!title) return;

  // add layers to map and layer control
  let iNatGridLayer = addOverlayToMap(iNatGrid, map, layerControl, title, true);
  let iNatPointLayer = addOverlayToMap(iNatPoint, map, layerControl, title);
  let iNatHeatmapLayer = addOverlayToMap(iNatHeatmap, map, layerControl, title);

  // only need taxon range if taxon is selected
  let layers = [];
  if (taxonObj.id === 0) {
    layers = [iNatGridLayer, iNatPointLayer, iNatHeatmapLayer];
  } else {
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

export async function addAllTaxaToMapAndStore(appStore: MapStore) {
  // set colors because colors is used to fetch map tiles
  appStore.inatApiParams.colors = iNatOrange;

  await fetchiNatMapDataForTaxon(allTaxa, appStore);
  await getObservationsCountForTaxon(allTaxa, appStore);

  // set taxon_id after getting map data
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    taxon_id: "0",
    colors: iNatOrange,
  };
  appStore.selectedTaxa = [allTaxa];
  appStore.color = iNatOrange;
}

function removeOneTaxonFromStoreAndMap(appStore: MapStore, taxonId: number) {
  removeOneTaxonFromMap(appStore, taxonId);

  delete appStore.inatApiParams.taxon_id;

  appStore.selectedTaxa = appStore.selectedTaxa.filter(
    (taxon) => taxon.id !== taxonId,
  );
}

async function removeOnePlaceFromStoreAndMap(
  appStore: MapStore,
  placeId: number,
) {
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
  if (
    appStore.selectedPlaces.length === 0 &&
    appStore.inatApiParams.taxon_id === "0"
  ) {
    removeAllTaxaFromStoreAndMap(appStore);
    await addAllTaxaToMapAndStore(appStore);
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

  mapLayers.forEach((layer) => {
    layer.remove();
  });

  delete appStore.placesMapLayers[placeId];
}

export function removeAllTaxaFromStoreAndMap(appStore: MapStore) {
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
            console.log(">>>", Object.keys(layer)); // keep
          }
          layer_descriptions.push(options.layer_description);
        } else if (log) {
          console.log("?????", Object.keys(layer)); // keep
        }
      } else if (log) {
        console.log("???", Object.keys(layer)); // keep
      }
    });
  }

  return layer_descriptions;
}

export async function initApp(appStore: MapStore, urlStore: MapStore) {
  let map = appStore.map.map;
  if (!map) return;

  // use url store to populate appStore.inatApiParams
  for (const [k, value] of Object.entries(urlStore.inatApiParams)) {
    let key = k as iNatApiParamsKeys;
    // ignore params whose value is any
    if (fieldsWithAny.includes(key) && value === "any") {
      delete appStore.inatApiParams[key];
      // add valid params to inatApiParams
    } else if (iNatApiNames.includes(key)) {
      delete appStore.inatApiParams[key];
      appStore.inatApiParams[key] = value;
    }
  }

  // HACK: trigger change in proxy store
  appStore.inatApiParams = appStore.inatApiParams;

  // get place data
  if (
    urlStore.selectedPlaces?.length > 0 &&
    urlStore.inatApiParams.nelat === undefined
  ) {
    for await (const urlStorePlace of urlStore.selectedPlaces) {
      let placeData = await getPlaceById(urlStorePlace.id);
      if (!placeData) {
        continue;
      }
      processPlaceData(placeData, appStore);
    }
    // get bounding box data
  } else if (urlStore.inatApiParams.nelat !== undefined) {
    processBBoxData(appStore, urlStore);
  }

  // get taxa data
  if (urlStore.selectedTaxa && urlStore.selectedTaxa.length > 0) {
    for await (const urlStoreTaxon of urlStore.selectedTaxa) {
      let taxonData = await getTaxonById(urlStoreTaxon.id);
      if (!taxonData) {
        continue;
      }
      let taxon = await processTaxonData(taxonData, appStore, urlStore);
      if (taxon) {
        await fetchiNatMapDataForTaxon(taxon, appStore);
        await getObservationsCountForTaxon(taxon, appStore);
      }
    }
  }

  // load allTaxon map tiles if no taxon id in the url
  if (
    urlStore.selectedTaxa === undefined ||
    urlStore.selectedTaxa.length === 0
  ) {
    await addAllTaxaToMapAndStore(appStore);
  }

  renderTaxaList(appStore);
  renderPlacesList(appStore);
  fitBoundsPlaces(appStore);

  window.dispatchEvent(new Event("appInitialized"));
}

export async function processTaxonData(
  taxonData: TaxaResult,
  appStore: MapStore,
  urlStore: MapStore,
) {
  let map = appStore.map.map;
  if (map === null) return;
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
    taxon_id: taxon.id.toString(),
    colors: urlStoreTaxon.color,
  };
  if (urlStoreTaxon.color) {
    appStore.color = urlStoreTaxon.color;
  }

  return taxon;
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
  // console.log("------------ updateStoreUsingFilters"); // keep
  // console.log("default:", mapStore.inatApiParams); // keep
  // console.log("appStore:", appStore.inatApiParams); // keep
  // console.log("filtersResults", filtersResults); // keep

  for (let [k, _value] of Object.entries(appStore.inatApiParams)) {
    let key = k as iNatApiParamsKeys;
    // console.log(key, _value); // keep

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
