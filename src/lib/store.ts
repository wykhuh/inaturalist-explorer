import type { MapStore } from "../types/app.d.ts";
import { displayUserData } from "./data_utils.ts";

export const mapStore: MapStore = {
  selectedTaxa: [],
  taxaMapLayers: {},
  taxaListEl: null,
  selectedPlaces: undefined,
  placesMapLayers: undefined,
  placesListEl: null,
  inatApiParams: {},
  displayJsonEl: null,
  color: "",
  map: { map: null, layerControl: null },
  refreshMap: {
    refreshMapButtonEl: null,
    showRefreshMapButton: false,
    layer: null,
  },
};

type ValidProperties = keyof MapStore;

const proxiedStore = new Proxy(mapStore, {
  set(target, property: ValidProperties, value) {
    target[property] = value;
    if (property == "selectedTaxa") {
      console.log("proxy store.selectedTaxa changed", value);
      displayUserData(proxiedStore, "proxiedStore selectedTaxa");
    }
    if (property == "taxaMapLayers") {
      console.log("proxy store.taxaMapLayers changed", Object.keys(value));
      displayUserData(proxiedStore, "proxiedStore taxaMapLayers");
    }
    if (property == "selectedPlaces") {
      console.log(
        "proxy store.selectedPlaces changed",
        value ? value.name : "",
      );
      displayUserData(proxiedStore, "proxiedStore selectedPlaces");
    }
    if (property == "refreshMap") {
      console.log("proxy store.refreshMap changed", value);
      displayUserData(proxiedStore, "proxiedStore refreshMap");
    }
    return true;
  },
});

export default proxiedStore;
