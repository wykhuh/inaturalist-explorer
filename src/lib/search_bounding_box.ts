import type { Map } from "leaflet";

import type { MapStore, CustomGeoJSON } from "../types/app";
import {
  formatiNatAPIBoundingBoxParams,
  getAndDrawMapBoundingBox,
} from "./map_utils.ts";
import { bboxPlaceRecord } from "../data/inat_data.ts";
import {
  updateTilesForSelectedTaxa,
  renderSelectedResources,
} from "./search_utils.ts";
import { updateCountForOne, updateCountForAll } from "./count_utils.ts";

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

  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedPlaces", appStore);

  let paramsTemp = {
    ...appStore.observationsApiParams,
  };

  await updateCountForOne(place, "selectedPlaces", appStore, paramsTemp);

  renderSelectedResources(appStore, true);
}

export function removeRefreshBBox(appStore: MapStore, map: Map) {
  if (appStore.refreshMap.layer) {
    appStore.refreshMap.layer.removeFrom(map);
  }
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
  appStore.selectedPlaces = [];

  delete appStore.observationsApiParams.place_id;
  delete appStore.observationsApiParams.nelat;
  delete appStore.observationsApiParams.nelng;
  delete appStore.observationsApiParams.swlat;
  delete appStore.observationsApiParams.swlng;
}
