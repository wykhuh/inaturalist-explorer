import {
  displayAppstoreData,
  // displayMapData,
} from "../components/AppstoreViewer/utils.ts";
import { selectedResources } from "../data/app_data.ts";
import type {
  AppStoreType,
  AppStoreKeysType,
  NormalizediNatUserType,
} from "../types/app.d.ts";
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
  map: {
    map: null,
    layerControl: null,
    terraDraw: null,
    activeLayers: new Set(),
    activeBasemap: new Set(),
    keepMapActiveLayers: false,
  },
  animatedMap: {
    mapTimePeriods: [],
    observationsApiParams: {},
    looping: false,
    setTimeoutIds: [],
    currentIndex: 0,
    speed: 5,
  },
  formFilters: { params: {}, string: "" },
  iNatStats: {
    headerCounts: new Map() as unknown as Record<string, number>,
    headerCountsIndex: [],
  },
  currentView: "observations_observations",
  viewMetadata: {
    popularFieldsByTaxa: {},
    popularFieldsOptions: [],
    observations_observations: {
      subview: "map",
      perPage: 24,
      displayFields: {},
      graphs: { category: "month_of_year", valueType: "counts" },
      map: {
        category: "none",
      },
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
    // displayMapData(proxiedStore);

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
