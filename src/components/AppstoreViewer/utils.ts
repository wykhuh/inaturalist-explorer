import type { AppStoreType, AppStoreKeysType } from "../../types/app";
import type { PolygonJson } from "../../types/inat_api";
import { leafletVisibleLayers } from "../../lib/data_utils";
import { displayJson } from "../../lib/utils";

function formatTaxaMapLayers(appStore: AppStoreType) {
  let temp: any = {};
  Object.entries(appStore.taxaMapLayers).forEach(([key, val]) => {
    temp[key] = val
      .filter((v) => v)
      .map((v: any) => v.options?.layer_description);
  });
  return temp;
}
function formatSelectedPlaces(appStore: AppStoreType) {
  return appStore.selectedPlaces.map((place) => {
    let temp = {} as any;
    Object.entries(place).forEach(([key, val]) => {
      if (["bounding_box", "geometry"].includes(key)) {
        let value = val as PolygonJson;

        let coors;
        if (value.coordinates[0][0]) {
          if (value.coordinates[0][0].length <= 5) {
            coors = value.coordinates[0];
          } else {
            coors = value.coordinates[0][0].length;
          }
        } else if (value.coordinates[0]) {
          if (value.coordinates[0].length <= 5) {
            coors = value.coordinates[0];
          } else {
            coors = value.coordinates[0].length;
          }
        }

        if (value !== null) {
          temp[key] = {
            type: value.type,
            coordinates: coors,
          };
        }
      } else {
        temp[key] = val;
      }
    });
    return temp;
  });
}
function formatPlacesMapLayers(appStore: AppStoreType) {
  let temp: any = {};
  Object.entries(appStore.placesMapLayers).forEach(([key, val]) => {
    temp[key] = val.map((v: any) => v.options?.layer_description);
  });
  return temp;
}

export function displayAppstoreData(appStore: AppStoreType, _source: string) {
  const debug = import.meta.env?.VITE_DEBUG;
  if (!debug || debug === "false") return;

  let displayJsonWrapperEl = document.getElementById("display-json-wrapper");
  if (!displayJsonWrapperEl) return;

  let data = {} as any;
  Object.keys(appStore).forEach((k) => {
    let key = k as AppStoreKeysType;
    if (key === "taxaMapLayers") {
      data.taxaMapLayers = formatTaxaMapLayers(appStore);
    } else if (key === "placesMapLayers") {
      data.placesMapLayers = formatPlacesMapLayers(appStore);
    } else if (key === "map") {
      data.map = {
        map: !!appStore.map.map,
        layerControl: !!appStore.map.layerControl,
      };
      data.mapLayerDescriptions = leafletVisibleLayers(appStore);
    } else if (key === "selectedPlaces") {
      data.selectedPlaces = formatSelectedPlaces(appStore);
    } else if (key === "observationsSubviewData") {
      data.observationsSubviewData =
        appStore.observationsSubviewData?.length || 0;
    } else if (key === "iNatStats") {
      // convert Map to object https://gist.github.com/lukehorvat/133e2293ba6ae96a35ba
      let obj = Object.fromEntries(appStore.iNatStats.headerCounts.entries());

      data.iNatStats = { ...appStore.iNatStats, headerCounts: obj };
    } else {
      data[key] = appStore[key];
    }
  });

  displayJson(data, displayJsonWrapperEl);
}
