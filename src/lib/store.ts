import type { MapStore } from "../types/app.d.ts";
import { displayUserData } from "./data_utils.ts";

export const mapStore: MapStore = {
  selectedTaxa: [],
  taxaMapLayers: {},
  inatApiParams: {},
  displayJsonEl: null,
  taxaListEl: null,
  color: "",
  map: { map: null, layerControl: null },
  refreshMap: { refreshMapButtonEl: null, showRefreshMapButton: false },
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
    return true;
  },
});

export default proxiedStore;
