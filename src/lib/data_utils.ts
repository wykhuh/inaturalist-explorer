import type {
  NormalizediNatTaxon,
  MapStore,
  iNatApiParams,
} from "../types/app";
import {
  addOverlayToMap,
  formatiNatAPIBoundingBoxParams,
  getAndDrawMapBoundingBox,
} from "./map_utils.ts";
import { displayJson } from "./utils.ts";
import { getiNatMapTiles, getiNatObservationsTotal } from "./inat_api.ts";

// called when user clicks refresh map button
export async function refreshiNatMapLayers(
  appStore: MapStore,
  placeId: number | undefined = undefined,
) {
  let map = appStore.map.map;
  let layerControl = appStore.map.layerControl;
  if (map == null) return;
  if (layerControl == null) return;
  console.log(">> refreshiNatMapLayers");

  // getAndDrawMapBoundingBox(map);

  let bbox = map.getBounds();
  let inatBbox = formatiNatAPIBoundingBoxParams(bbox);
  for await (const taxon of appStore.selectedTaxa) {
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
}

// called when user deletes a taxon
export function removeTaxon(taxonId: number, appStore: MapStore) {
  if (appStore.map.layerControl == null) return;
  // console.log(">> removeTaxon");

  removeSelectedTaxaProxy(appStore, taxonId);
  removeLayerFromLayerControl(appStore, taxonId);
  removeTaxaMapLayersProxy(appStore, taxonId);
  renderTaxaList(appStore);
}

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

  // fetch iNaturalist map layers
  let { iNatGrid, iNatHeatmap, iNatTaxonRange, iNatPoint } = getiNatMapTiles(
    taxonObj.id,
    appStore.inatApiParams,
  );

  // remove layers from layer control
  removeLayerFromLayerControl(appStore, taxonObj.id);

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

function removeSelectedTaxaProxy(appStore: MapStore, taxonId: number) {
  // console.log(">> removeSelectedTaxaProxy");

  appStore.selectedTaxa = appStore.selectedTaxa.filter(
    (taxon) => taxon.id !== taxonId,
  );
}

function removeTaxaMapLayersProxy(appStore: MapStore, taxonId: number) {
  // console.log(">> removeMapLayerFromStoreProxy");

  // NOTE: can't use delete appStore.taxaMapLayers[taxonId] because Proxy won't
  // recognize the change.
  let temp: any = {};
  for (let [key, value] of Object.entries(appStore.taxaMapLayers)) {
    if (key !== taxonId.toString()) {
      temp[key] = value;
    }
  }
  appStore.taxaMapLayers = temp;
}

function removeLayerFromLayerControl(appStore: MapStore, taxonId: number) {
  let mapLayers = appStore.taxaMapLayers[taxonId];
  let layerControl = appStore.map.layerControl;
  if (!layerControl) return;
  if (!mapLayers) return;
  // console.log(">> removeLayerFromLayerControl");

  mapLayers.forEach((layer) => {
    // remove layer from layer control
    layerControl.removeLayer(layer);
    // remove layer from map
    layer.remove();
  });
}

export function renderTaxaList(appStore: MapStore) {
  if (!appStore.taxaListEl) return;

  appStore.taxaListEl.innerHTML = "";

  appStore.selectedTaxa.forEach((taxon) => {
    let templateEl = document.createElement("x-taxa-list-item");
    templateEl.dataset.taxon = JSON.stringify(taxon);
    appStore.taxaListEl!.appendChild(templateEl);
  });
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

export function displayUserData(appStore: MapStore, _source: string) {
  let temp: any = {};
  // console.log(">> displayUserData", _source);
  Object.entries(appStore.taxaMapLayers).forEach(([key, val]) => {
    temp[key] = val.map((v: any) =>
      v._url.replace("https://api.inaturalist.org/v1/", ""),
    );
  });
  let data = {
    refreshMap: appStore.refreshMap,
    inatApiParams: appStore.inatApiParams,
    selectedTaxa: appStore.selectedTaxa,
    taxaMapLayers: temp,
  };
  displayJson(data, appStore.displayJsonEl);
}
