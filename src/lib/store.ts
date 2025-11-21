import { displayAppstoreData } from "../components/AppstoreViewer/utils.ts";
import type {
  MapStore,
  MapStoreKeys,
  NormalizediNatUser,
} from "../types/app.d.ts";
import { loggerStore } from "./logger.ts";

export const mapStore: MapStore = {
  selectedTaxa: [],
  taxaMapLayers: {},
  selectedPlaces: [],
  placesMapLayers: {},
  selectedProjects: [],
  selectedUsers: [],
  selectedUsersIdentifiers: [],
  selectedUnobservedByUser: {} as NormalizediNatUser,
  observationsApiParams: { verifiable: true, spam: false, locale: "en" },
  color: "",
  map: { map: null, layerControl: null },
  refreshMap: {
    refreshMapButtonEl: null,
    showRefreshMapButton: false,
    layer: null,
  },
  formFilters: { params: {}, string: "" },
  iNatStats: {},
  observationsSubviewData: [],
  currentView: "observations",
  viewMetadata: {
    observations: { subview: "grid" },
    species: {},
    identifiers: {},
    identifications: {},
    observers: {},
    name_order: "cs",
  },
  record_type: "observations",
};

const proxiedStore = new Proxy(structuredClone(mapStore), {
  set(target, property: MapStoreKeys, value) {
    target[property] = value;

    loggerStore(`proxy store.${property} changed`);

    displayAppstoreData(proxiedStore, `proxiedStore ${property}`);
    if (property === "selectedPlaces") {
      window.dispatchEvent(new Event("selectedPlacesChange"));
    } else if (property === "selectedProjects") {
      window.dispatchEvent(new Event("selectedProjectsChange"));
    } else if (property === "selectedTaxa") {
      window.dispatchEvent(new Event("selectedTaxaChange"));
    } else if (property === "selectedUsers") {
      window.dispatchEvent(new Event("selectedUsersChange"));
    } else if (property === "selectedUsersIdentifiers") {
      window.dispatchEvent(new Event("selectedUsersIdentifiersChange"));
    }

    return true;
  },
});

export default proxiedStore;
