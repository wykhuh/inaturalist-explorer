import { displayAppstoreData } from "../components/AppstoreViewer/utils.ts";
import { selectedResources } from "../data/app_data.ts";
import type {
  AppStoreType,
  AppStoreKeysType,
  NormalizediNatUserType,
} from "../types/app.d.ts";
import type {
  IdentificationsAPI,
  iNatObservationsAPI,
} from "../types/inat_api";
import { loggerEvent, loggerStore } from "./logger.ts";

// NOTE: update when adding selectedResource; default mapStore
export const mapStore: AppStoreType = {
  placesMapLayers: {},
  selectedPlaces: [],
  selectedWithoutPlaces: [],
  selectedProjects: [],
  selectedWithoutProjects: [],
  selectedReviewer: {} as NormalizediNatUserType,
  selectedTaxa: [],
  selectedWithoutTaxa: [],
  selectedTaxaIdentified: [],
  selectedWithoutTaxaIdentified: [],
  selectedUnobservedByUser: {} as NormalizediNatUserType,
  selectedUsers: [],
  selectedWithoutUsers: [],
  selectedUsersAnnotators: [],
  selectedUsersIdentifiers: [],
  selectedWithoutUsersIdentifiers: [],
  taxaMapLayers: {},
  taxaIdentifiedMapLayers: {},
  observationsApiParams: { verifiable: true, spam: false, locale: "en" },
  identificationsApiParams: {},
  color: "",
  map: { map: null, layerControl: null, terraDraw: null },
  formFilters: { params: {}, string: "" },
  iNatStats: {
    headerCounts: new Map() as unknown as Record<string, number>,
    headerCountsIndex: [],
  },
  cacheData: {
    observations: {
      observations: {} as iNatObservationsAPI,
      graphs: { month_of_year: [], year: [], month: [] },
      graphsSpecies: { month_of_year: [], year: [], month: [] },
      graphsPlaces: { month_of_year: [], year: [], month: [] },
      popularFieldsOptions: [],
      popularFields: {},
    },
    identifications: { identifications: {} as IdentificationsAPI },
  },
  currentView: "observations_observations",
  viewMetadata: {
    observations_observations: {
      subview: "map",
      perPage: 24,
      displayFields: {},
      graphs: { category: "month_of_year" },
    },
    observations_species: { perPage: 24 },
    observations_identifiers: { perPage: 100 },
    observations_observers: { perPage: 100 },
    identifications_identifications: { subview: "map", perPage: 24 },
    identifications_species: { perPage: 24 },
    identifications_identifiers: { perPage: 100 },
    identifications_observers: { perPage: 100 },
    name_order: "cs",
    side_menu: "show",
  },
  record_type: "observations",
};

const proxiedStore = new Proxy(structuredClone(mapStore), {
  set(target, property: AppStoreKeysType, value) {
    (target as any)[property] = value;

    loggerStore(`[proxiedStore] ${property} changed`);

    displayAppstoreData(proxiedStore, `proxiedStore ${property}`);

    // NOTE: selectedResource changes multiple times one one resource
    // is added or removed.
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
