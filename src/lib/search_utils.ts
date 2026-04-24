import type {
  AppStoreType,
  AppStoreSelectedResourcesKeysType,
  SearchOptions,
  SearchOptionsKeys,
} from "../types/app";
import {
  fetchiNatMapDataForTaxon,
  isAnimatedMapCategory,
  isIdentificationsCheck,
  isObservationsCheck,
} from "./data_utils";
import { updateAppUrl } from "./utils";
import {
  placeSelectedHandler,
  setupPlacesSearch,
} from "../lib/search_places.ts";
import {
  projectSelectedHandler,
  setupProjectSearch,
} from "../lib/search_projects.ts";
import { setupUserSearch, userSelectedHandler } from "../lib/search_users.ts";
import {
  removeOneTaxonFromMap,
  setupTaxaSearch,
  taxonSelectedHandler,
} from "../lib/search_taxa.ts";
import { isResourceObject } from "../types/utils.ts";
import {
  setupUserIdentifierSearch,
  userIdentifierSelectedHandler,
} from "./search_users_identifiers.ts";
import {
  removeOneTaxonIdentifiedFromMap,
  setupTaxaIdentifiedSearch,
  taxonIdentifiedSelectedHandler,
} from "./search_taxa_identified.ts";
import { loggerEvent } from "./logger.ts";
import {
  setupUserAnnotatorsSearch,
  userAnnotatorsSelectedHandler,
} from "./search_users_annotators.ts";
import {
  setupWithoutTaxaSearch,
  withoutTaxonSelectedHandler,
} from "./search_without_taxa.ts";
import {
  setupWithoutTaxaIdentifiedSearch,
  withoutTaxonIdentifiedSelectedHandler,
} from "./search_without_taxa_identified.ts";
import { renderSelectResourcesLists } from "../data/app_data.ts";
import {
  notInProjectSelectedHandler,
  setupNotInProjectSearch,
} from "./search_without_project.ts";
import {
  setupWithoutPlacesSearch,
  withoutPlaceSelectedHandler,
} from "./search_without_places.ts";
import {
  setupWithoutUserSearch,
  withoutUserSelectedHandler,
} from "./search_without_users.ts";
import {
  setupWithoutUserIdentifierSearch,
  withoutUserIdentifierSelectedHandler,
} from "./search_without_users_identifiers.ts";

export async function updateTilesForSelectedTaxa(
  appStore: AppStoreType,
  loadMapAnimations = false,
) {
  // Early return when selected resources are added/removed while on
  // animated map tab. Let map component handle fetching animated map tiles
  if (loadMapAnimations === false && isAnimatedMapCategory(appStore)) return;

  appStore.map.keepMapActiveLayers = true;

  for await (const taxon of appStore.selectedTaxa) {
    // remove existing taxon layers from map
    removeOneTaxonFromMap(appStore, taxon.id);

    // get new iNat map tiles
    let layers = await fetchiNatMapDataForTaxon(taxon, appStore);
    if (layers) {
      appStore.taxaMapLayers = {
        ...appStore.taxaMapLayers,
        [taxon.id]: layers,
      };
    }
  }
  appStore.map.keepMapActiveLayers = false;
}

export async function updateTilesForSelectedTaxaIdentified(
  appStore: AppStoreType,
) {
  for await (const taxon of appStore.selectedTaxaIdentified) {
    // remove existing taxon layers from map
    removeOneTaxonIdentifiedFromMap(appStore, taxon.id);
    // get new iNat map tiles
    let layers = await fetchiNatMapDataForTaxon(taxon, appStore);
    if (layers) {
      appStore.taxaIdentifiedMapLayers = {
        ...appStore.taxaIdentifiedMapLayers,
        [taxon.id]: layers,
      };
    }
  }
}

export function renderSelectedResources(
  appStore: AppStoreType,
  doSideEffects: boolean,
) {
  // NOTE: update when adding selectedResource; renderSelectedResources
  renderSelectResourcesLists.forEach((list) => {
    list(appStore);
  });

  if (doSideEffects) {
    updateAppUrl(window.location, appStore);

    // dispatch event instead of using proxy store dispatch event because
    // there are mutiple store events when selected resources change
    if (isIdentificationsCheck(appStore)) {
      loggerEvent(
        "[renderSelectedResources dispatchEvent] identificationsChange",
      );
      window.dispatchEvent(new Event("identificationsChange"));
    } else if (isObservationsCheck(appStore)) {
      loggerEvent("[renderSelectedResources dispatchEvent] observationsChange");
      window.dispatchEvent(new Event("observationsChange"));
    }
  }
}

export function multisearchSetup(appStore: AppStoreType) {
  let searchSelector = "#inatAutocomplete";
  let searchInputEl = document.querySelector(
    searchSelector,
  ) as HTMLInputElement;
  if (!searchInputEl) return;

  let searchSelectEl = document.querySelector(
    "#search-type",
  ) as HTMLSelectElement;
  if (!searchSelectEl) return;

  // NOTE: update when adding selectedResource; searchOptions
  let searchOptions: SearchOptions = {
    places: {
      setup: setupPlacesSearch,
      selectedHandler: placeSelectedHandler,
    },
    withoutPlaces: {
      setup: setupWithoutPlacesSearch,
      selectedHandler: withoutPlaceSelectedHandler,
    },
    projects: {
      setup: setupProjectSearch,
      selectedHandler: projectSelectedHandler,
    },
    withoutProjects: {
      setup: setupNotInProjectSearch,
      selectedHandler: notInProjectSelectedHandler,
    },
    users: {
      setup: setupUserSearch,
      selectedHandler: userSelectedHandler,
    },
    withoutUsers: {
      setup: setupWithoutUserSearch,
      selectedHandler: withoutUserSelectedHandler,
    },
    taxa: {
      setup: setupTaxaSearch,
      selectedHandler: taxonSelectedHandler,
    },
    withoutTaxa: {
      setup: setupWithoutTaxaSearch,
      selectedHandler: withoutTaxonSelectedHandler,
    },
    usersIdentifiers: {
      setup: setupUserIdentifierSearch,
      selectedHandler: userIdentifierSelectedHandler,
    },
    withoutUsersIdentifiers: {
      setup: setupWithoutUserIdentifierSearch,
      selectedHandler: withoutUserIdentifierSelectedHandler,
    },
    usersAnnotators: {
      setup: setupUserAnnotatorsSearch,
      selectedHandler: userAnnotatorsSelectedHandler,
    },
    taxaIdentified: {
      setup: setupTaxaIdentifiedSearch,
      selectedHandler: taxonIdentifiedSelectedHandler,
    },
    withoutTaxaIdentified: {
      setup: setupWithoutTaxaIdentifiedSearch,
      selectedHandler: withoutTaxonIdentifiedSelectedHandler,
    },
  };

  let setup = setupTaxaSearch(searchSelector, appStore);
  let selectedHandler = taxonSelectedHandler;

  // when user selects an search result,
  searchInputEl.addEventListener("selection", async function (event: any) {
    let selection = event.detail.selection.value;
    let query = event.detail.query;
    await selectedHandler(selection, query, window.app.store);
  });

  // update search input when user changes the search type
  searchSelectEl.addEventListener("change", (event) => {
    let target = event.target as HTMLInputElement;
    if (target === null) return;

    let targetSearch = searchOptions[target.value as SearchOptionsKeys];
    if (!targetSearch) {
      throw Error("missing search config for " + target.value);
    }

    // unInit comes from autocomplete library. unInit removes event listerners
    // for autocomplete search
    setup.unInit();

    // clear search input
    searchInputEl.innerHTML = "";
    searchInputEl.value = "";

    setup = targetSearch.setup(searchSelector, appStore);
    selectedHandler = targetSearch.selectedHandler;
  });
}

export function searchSetup(searchSelector: string, selectedHandler: any) {
  let searchInputEl = document.querySelector(
    searchSelector,
  ) as HTMLInputElement;
  if (!searchInputEl) return;

  searchInputEl.addEventListener("selection", async function (event: any) {
    let selection = event.detail.selection.value;
    let query = event.detail.query;
    await selectedHandler(selection, query, window.app.store);
  });
}

export function showHideHeader(
  selector: string,
  storeResource: AppStoreSelectedResourcesKeysType,
) {
  let heading = document.querySelector(selector) as HTMLElement;

  if (!heading) return;
  let resource = window.app.store[storeResource];
  if (isResourceObject(resource)) {
    heading.hidden = resource.id ? false : true;
  } else {
    heading.hidden = resource.length === 0 ? true : false;
  }
}
