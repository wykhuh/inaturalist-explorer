import { displayAppstoreData } from "../components/AppstoreViewer/utils.ts";
import type {
  MapStore,
  MapStoreKeys,
  NormalizediNatUser,
} from "../types/app.d.ts";
import { loggerEvent, loggerStore } from "./logger.ts";

export const mapStore: MapStore = {
  selectedTaxa: [],
  selectedTaxaIdentified: [],
  taxaMapLayers: {},
  selectedPlaces: [],
  placesMapLayers: {},
  selectedProjects: [],
  selectedUsers: [],
  selectedUsersIdentifiers: [],
  selectedUnobservedByUser: {} as NormalizediNatUser,
  observationsApiParams: { verifiable: true, spam: false, locale: "en" },
  identificationsApiParams: {},
  color: "",
  map: { map: null, layerControl: null },
  refreshMap: {
    refreshMapButtonEl: null,
    showRefreshMapButton: false,
    layer: null,
  },
  formFilters: { params: {}, string: "" },
  iNatStats: {
    headerCounts: new Map() as unknown as Record<string, number>,
    headerCountsIndex: [],
  },
  observationsSubviewData: [],
  currentView: "observations_observations",
  viewMetadata: {
    observations_observations: { subview: "grid" },
    observations_species: {},
    observations_identifiers: {},
    observations_observers: {},
    identifications_observations: { subview: "grid" },
    identifications_species: {},
    identifications_identifiers: {},
    identifications_identifications: {},
    identifications_observers: {},
    name_order: "cs",
  },
  record_type: "observations",
};

const proxiedStore = new Proxy(structuredClone(mapStore), {
  set(target, property: MapStoreKeys, value) {
    (target as any)[property] = value;

    loggerStore(`proxy store.${property} changed`);

    displayAppstoreData(proxiedStore, `proxiedStore ${property}`);
    if (property === "selectedPlaces") {
      window.dispatchEvent(new Event("selectedPlacesChange"));
      loggerEvent(`dispatch ${property}Change`);
    } else if (property === "selectedProjects") {
      window.dispatchEvent(new Event("selectedProjectsChange"));
      loggerEvent(`dispatch ${property}Change`);
    } else if (property === "selectedTaxa") {
      window.dispatchEvent(new Event("selectedTaxaChange"));
      loggerEvent(`dispatch ${property}Change`);
    } else if (property === "selectedTaxaIdentified") {
      window.dispatchEvent(new Event("selectedTaxaIdentifiedChange"));
      loggerEvent(`dispatch ${property}Change`);
    } else if (property === "selectedUsers") {
      window.dispatchEvent(new Event("selectedUsersChange"));
      loggerEvent(`dispatch ${property}Change`);
    } else if (property === "selectedUsersIdentifiers") {
      window.dispatchEvent(new Event("selectedUsersIdentifiersChange"));
      loggerEvent(`dispatch ${property}Change`);
    }

    return true;
  },
});

export default proxiedStore;
