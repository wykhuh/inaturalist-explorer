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

    console.log(`proxy store.${property} changed`);
    displayUserData(proxiedStore, `proxiedStore ${property}`);

    return true;
  },
});

export default proxiedStore;
