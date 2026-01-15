import { displayAppstoreData } from "../components/AppstoreViewer/utils.ts";
import { selectedResources } from "../data/app_data.ts";
import type {
  AppStoreType,
  AppStoreKeysType,
  NormalizediNatUserType,
  NormalizediNatProjectType,
} from "../types/app.d.ts";
import { loggerEvent, loggerStore } from "./logger.ts";

// NOTE: update when adding selectedResource; default mapStore
export const mapStore: AppStoreType = {
  placesMapLayers: {},
  selectedPlaces: [],
  selectedProjects: [],
  selectedReviewer: {} as NormalizediNatUserType,
  selectedTaxa: [],
  selectedTaxaIdentified: [],
  selectedWithoutTaxa: [],
  selectedWithoutTaxaIdentified: [],
  selectedUnobservedByUser: {} as NormalizediNatUserType,
  selectedUsers: [],
  selectedUsersAnnotators: [],
  selectedUsersIdentifiers: [],
  selectedNotInProject: {} as NormalizediNatProjectType,
  taxaMapLayers: {},
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
    observations_observations: { subview: "map", perPage: 24 },
    observations_species: { perPage: 24 },
    observations_identifiers: { perPage: 100 },
    observations_observers: { perPage: 100 },
    identifications_observations: { subview: "map", perPage: 24 },
    identifications_species: { perPage: 24 },
    identifications_identifiers: { perPage: 100 },
    identifications_identifications: { perPage: 24 },
    identifications_observers: { perPage: 100 },
    name_order: "cs",
  },
  record_type: "observations",
};

const proxiedStore = new Proxy(structuredClone(mapStore), {
  set(target, property: AppStoreKeysType, value) {
    (target as any)[property] = value;

    loggerStore(`[proxiedStore] ${property} changed`);

    displayAppstoreData(proxiedStore, `proxiedStore ${property}`);

    selectedResources.forEach((resource) => {
      if (property === resource) {
        loggerEvent(`[proxiedStore dispatchEvent] ${property}Change`);
        window.dispatchEvent(new Event(`${resource}Change`));
      }
    });

    return true;
  },
});

export default proxiedStore;
