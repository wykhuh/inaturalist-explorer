import type { AppStoreType, CustomGeoJSONType, LngLatType } from "../types/app";
import { convertLnLatToiNatBBox, renderBoundingBoxLayer } from "./map_utils.ts";
import { bboxPlaceRecord } from "../data/inat_data.ts";
import {
  updateTilesForSelectedTaxa,
  renderSelectedResources,
} from "./search_utils.ts";
import { updateCountForOneRecord, updateCountForAll } from "./count_utils.ts";

// called when user clicks draw rectangle icon
//coordinates is array of 5 sets of long, lat [[-105.032343864, 46.120849022]]
export async function saveBBoxToStore(
  coordinates: LngLatType[],
  appStore: AppStoreType,
) {
  let map = appStore.map.map;
  let layerControl = appStore.map.layerControl;
  if (map === null) return;
  if (layerControl === null) return;

  // remove old places
  removePlacesFromStoreAndMap(appStore);

  // render leaflet layer
  let layer = renderBoundingBoxLayer(map, coordinates) as any;

  // delete terradraw layer
  appStore.map.terraDraw?.clear();

  // save place
  let place = bboxPlaceRecord(coordinates);
  appStore.selectedPlaces = [place];
  appStore.placesMapLayers = { "0": [layer as unknown as CustomGeoJSONType] };

  // update observationsApiParams
  let { nelng, swlng, nelat, swlat } = convertLnLatToiNatBBox(coordinates);
  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    nelng,
    nelat,
    swlat,
    swlng,
  };

  await updateTilesForSelectedTaxa(appStore);

  await updateCountForOneRecord(place, "selectedPlaces", appStore, {
    ...appStore.observationsApiParams,
  });
  await updateCountForAll("selectedPlaces", appStore);

  renderSelectedResources(appStore, true);
}

function removePlacesFromStoreAndMap(appStore: AppStoreType) {
  // remove from map
  Object.values(appStore.placesMapLayers).forEach((layers) => {
    layers.forEach((layer) => {
      // remove layer from map
      layer.remove();
    });
  });

  // remove from store
  appStore.placesMapLayers = {};
  appStore.selectedPlaces = [];

  delete appStore.observationsApiParams.place_id;
  delete appStore.observationsApiParams.nelat;
  delete appStore.observationsApiParams.nelng;
  delete appStore.observationsApiParams.swlat;
  delete appStore.observationsApiParams.swlng;
}
