import type {
  AppStoreType,
  AppStoreSelectedResourcesKeysType,
  SearchOptions,
  SearchOptionsKeys,
} from "../types/app";
import {
  fetchiNatMapDataForTaxon,
  isIdentificationsCheck,
  isObservationsCheck,
  removeOneTaxonFromMap,
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
import { setupTaxaSearch, taxonSelectedHandler } from "../lib/search_taxa.ts";
import { isResourceObject } from "../types/utils.ts";
import {
  setupUserIdentifierSearch,
  userIdentifierSelectedHandler,
} from "./search_users_identifiers.ts";
import {
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

export async function updateTilesForSelectedTaxa(appStore: AppStoreType) {
  for await (const taxon of appStore.selectedTaxa) {
    // remove existing taxon layers from map
    removeOneTaxonFromMap(appStore, taxon.id);

    // get new iNat map tiles
    await fetchiNatMapDataForTaxon(taxon, appStore);
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
    projects: {
      setup: setupProjectSearch,
      selectedHandler: projectSelectedHandler,
    },
    users: {
      setup: setupUserSearch,
      selectedHandler: userSelectedHandler,
    },
    taxa: {
      setup: setupTaxaSearch,
      selectedHandler: taxonSelectedHandler,
    },
    usersIdentifiers: {
      setup: setupUserIdentifierSearch,
      selectedHandler: userIdentifierSelectedHandler,
    },
    usersAnnotators: {
      setup: setupUserAnnotatorsSearch,
      selectedHandler: userAnnotatorsSelectedHandler,
    },
    taxaIdentified: {
      setup: setupTaxaIdentifiedSearch,
      selectedHandler: taxonIdentifiedSelectedHandler,
    },
    withoutTaxa: {
      setup: setupWithoutTaxaSearch,
      selectedHandler: withoutTaxonSelectedHandler,
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

    // unInit comes from autocomplete library. unInit removes event listerners
    // for autocomplete search
    setup.unInit();

    // clear search input
    searchInputEl.innerHTML = "";
    searchInputEl.value = "";

    let targetSearch = searchOptions[target.value as SearchOptionsKeys];
    if (!targetSearch) {
      throw Error("missing search config for " + target.value);
    }

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

// NOTE: update when adding selectedResource; showHide Header
export function showHideUsersHeader() {
  showHideHeader("#sidebar-menu .users-heading", "selectedUsers");
}

export function showHideUsersIdentifiersHeader() {
  showHideHeader(
    "#sidebar-menu .users-identifiers-heading",
    "selectedUsersIdentifiers",
  );
}

export function showHideUsersAnnotatorsHeader() {
  showHideHeader(
    "#sidebar-menu .users-annotators-heading",
    "selectedUsersAnnotators",
  );
}

export function showHideProjectsHeader() {
  showHideHeader("#sidebar-menu .projects-heading", "selectedProjects");
}

export function showHidePlacesHeader() {
  showHideHeader("#sidebar-menu .places-heading", "selectedPlaces");
}

export function showHideTaxaHeader() {
  showHideHeader("#sidebar-menu .taxa-heading", "selectedTaxa");
}

export function showHideTaxaIdentifiedHeader() {
  showHideHeader(
    "#sidebar-menu .taxa-identified-heading",
    "selectedTaxaIdentified",
  );
}

export function showHideWithoutTaxaHeader() {
  showHideHeader("#sidebar-menu .without-taxa-heading", "selectedWithoutTaxa");
}

export function showHideWithoutTaxaIdentifiedHeader() {
  showHideHeader(
    "#sidebar-menu .without-taxa-identified-heading",
    "selectedWithoutTaxaIdentified",
  );
}
