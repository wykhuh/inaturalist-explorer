import type {
  NormalizediNatTaxon,
  MapStore,
  iNatApiParams,
  CustomLayerOptions,
  CustomPolygon,
  CustomLayer,
} from "../types/app";
import {
  addOverlayToMap,
  formatiNatAPIBoundingBoxParams,
  getAndDrawMapBoundingBox,
} from "./map_utils.ts";
import { displayJson } from "./utils.ts";
import { getiNatMapTiles, getiNatObservationsTotal } from "./inat_api.ts";
import { renderTaxaList, renderPlacesList } from "./autocomplete_utils.ts";
import type { Map } from "leaflet";

// called when user clicks refresh map button
export async function refreshiNatMapLayers(
  appStore: MapStore,
  placeId: number | undefined = undefined,
) {
  let map = appStore.map.map;
  let layerControl = appStore.map.layerControl;

  if (map == null) return;
  if (layerControl == null) return;

  removeRefreshBBox(appStore, map);

  // removeTaxaFromStoreAndMap(appStore);
  removePlacesFromStoreAndMap(appStore);

  let refreshLayer = getAndDrawMapBoundingBox(map);
  appStore.refreshMap = {
    ...appStore.refreshMap,
    layer: refreshLayer as CustomPolygon,
  };

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
}

// called when user deletes a taxon
export function removeTaxon(taxonId: number, appStore: MapStore) {
  removeOneTaxonFromStoreAndMap(appStore, taxonId);

  renderTaxaList(appStore);
}

// called when user deletes a place
export function removePlace(appStore: MapStore) {
  removeTaxaFromStoreAndMap(appStore);
  removePlacesFromStoreAndMap(appStore);

  renderTaxaList(appStore);
  renderPlacesList(appStore);
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
  renderTaxaList(appStore);
  renderPlacesList(appStore);

  // fetch iNaturalist map layers
  let { iNatGrid, iNatHeatmap, iNatTaxonRange, iNatPoint } = getiNatMapTiles(
    taxonObj.id,
    appStore.inatApiParams,
  );

  // remove layers from layer control
  // console.log(">>>!!!");

  if (taxonObj.id in appStore.taxaMapLayers) {
    // console.log(
    //   ">>>!!!",
    //   // appStore.taxaMapLayers.map((l) => l.options.custom_id),
    // );
    // appStore.taxaMapLayers[taxonObj.id].forEach((layer) => {
    //   layer.removeFrom(map);
    // });
    // removeOneTaxonFromStoreAndMap(appStore, taxonObj.id);
  }
  // if (taxonObj.id in appStore.taxaMapLayers) {
  //   console.log(">>>!!!");
  //   // removeOneTaxonFromStoreAndMap(appStore, taxonObj.id);
  // }

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

  appStore.selectedTaxa = appStore.selectedTaxa.filter(
    (taxon) => taxon.id !== taxonId,
  );
}

function removeOneTaxonFromMap(appStore: MapStore, taxonId: number) {
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

  // remove from store
  delete appStore.inatApiParams.place_id;
  appStore.selectedPlaces = undefined;
  appStore.placesMapLayers = undefined;
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

  if (title) {
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
        } else {
          console.log("?????", Object.keys(layer));
        }
      } else {
        console.log("???", Object.keys(layer));
      }
    });
  }

  return layer_descriptions;
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
    selectedTaxa: appStore.selectedTaxa,
    taxaMapLayers: temp,
    selectedPlaces: appStore.selectedPlaces,
    placesMapLayers: appStore.placesMapLayers?.options.layer_description,
    mapLayerDescriptions: leafletVisibleLayers(appStore, true),
  };
  displayJson(data, appStore.displayJsonEl);
}
