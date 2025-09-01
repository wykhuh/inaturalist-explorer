import type { MapStore, MapStoreKeys } from "../types/app.d.ts";
import { displayUserData } from "./data_utils.ts";

export const mapStore: MapStore = {
  selectedTaxa: [],
  taxaMapLayers: {},
  taxaListEl: null,
  selectedPlaces: [],
  placesMapLayers: {},
  placesListEl: null,
  inatApiParams: { verifiable: true, spam: false },
  displayJsonEl: null,
  color: "",
  map: { map: null, layerControl: null },
  refreshMap: {
    refreshMapButtonEl: null,
    showRefreshMapButton: false,
    layer: null,
  },
  formFilters: { params: "" },
};

const proxiedStore = new Proxy(mapStore, {
  set(target, property: MapStoreKeys, value) {
    target[property] = value;

    console.log(`proxy store.${property} changed`);
    displayUserData(proxiedStore, `proxiedStore ${property}`);

    return true;
  },
});

export default proxiedStore;
