import type { MapStore, MapStoreKeys } from "../types/app.d.ts";
import { displayUserData } from "./data_utils.ts";
import { logger } from "./logger.ts";

export const mapStore: MapStore = {
  selectedTaxa: [],
  taxaMapLayers: {},
  selectedPlaces: [],
  placesMapLayers: {},
  selectedProjects: [],
  selectedUsers: [],
  inatApiParams: { verifiable: true, spam: false },
  color: "",
  map: { map: null, layerControl: null },
  refreshMap: {
    refreshMapButtonEl: null,
    showRefreshMapButton: false,
    layer: null,
  },
  formFilters: { params: {}, string: "" },
  iNatStats: {},
  search: {},
};

const proxiedStore = new Proxy(structuredClone(mapStore), {
  set(target, property: MapStoreKeys, value) {
    target[property] = value;

    logger(`proxy store.${property} changed`);
    displayUserData(proxiedStore, `proxiedStore ${property}`);
    if (property === "selectedPlaces") {
      window.dispatchEvent(new Event("selectedPlacesChange"));
    } else if (property === "selectedProjects") {
      window.dispatchEvent(new Event("selectedProjectsChange"));
    } else if (property === "selectedTaxa") {
      window.dispatchEvent(new Event("selectedTaxaChange"));
    } else if (property === "selectedUsers") {
      window.dispatchEvent(new Event("selectedUsersChange"));
    }

    return true;
  },
});

export default proxiedStore;
