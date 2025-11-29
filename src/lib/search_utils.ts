import type {
  MapStore,
  MapStoreSelectedResourcesKeys,
  SearchOptions,
  SearchOptionsKeys,
} from "../types/app";
import {
  fetchiNatMapDataForTaxon,
  updateObservationsCountForOne,
  removeOneTaxonFromMap,
} from "./data_utils";

import { updateAppUrl } from "./utils";

import {
  placeSelectedHandler,
  setupPlacesSearch,
  renderPlacesList,
} from "../lib/search_places.ts";
import {
  projectSelectedHandler,
  setupProjectSearch,
  renderProjectsList,
} from "../lib/search_projects.ts";
import {
  setupUserSearch,
  userSelectedHandler,
  renderUsersList,
} from "../lib/search_users.ts";
import {
  setupTaxaSearch,
  taxonSelectedHandler,
  renderTaxaList,
} from "../lib/search_taxa.ts";
import { isResourceObject } from "../types/utils.ts";
import {
  renderUsersIdentifiersList,
  setupUserIdentifierSearch,
  userIdentifierSelectedHandler,
} from "./search_users_identifiers.ts";
import {
  renderTaxaIdentifiedList,
  setupTaxaIdentifiedSearch,
  taxonIdentifiedSelectedHandler,
} from "./search_taxa_identified.ts";

export async function updateTilesForAllTaxa(appStore: MapStore) {
  for await (const taxon of appStore.selectedTaxa) {
    // remove existing taxon layers from map
    removeOneTaxonFromMap(appStore, taxon.id);

    let paramsTemp = {
      ...appStore.observationsApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };

    // NOTE: iNat observations API only allows one ident_user_id value
    let identifierId = appStore.observationsApiParams.ident_user_id;
    if (identifierId && appStore.record_type === "observations") {
      identifierId = identifierId.split(",")[0];
      paramsTemp.ident_user_id = identifierId;
    }

    // get new iNat map tiles
    await fetchiNatMapDataForTaxon(taxon, appStore, paramsTemp);
  }
}

export async function updateObservationsCountForAll(
  ignoreResource: MapStoreSelectedResourcesKeys | "all",
  appStore: MapStore,
) {
  let resources = [
    "selectedTaxa",
    "selectedTaxaIdentified",
    "selectedPlaces",
    "selectedProjects",
    "selectedUsers",
    "selectedUsersIdentifiers",
  ] as MapStoreSelectedResourcesKeys[];

  let targetResources = resources.filter((r) => r != ignoreResource);
  for await (const res of targetResources) {
    await updateObservationsCountForResource(res, appStore);
  }
}

async function updateObservationsCountForResource(
  resource: MapStoreSelectedResourcesKeys,
  appStore: MapStore,
) {
  let idField = "";
  if (resource === "selectedPlaces") {
    idField = "place_id";
  } else if (resource === "selectedProjects") {
    idField = "project_id";
  } else if (resource === "selectedTaxa") {
    idField = "taxon_id";
  } else if (resource === "selectedTaxaIdentified") {
    idField = "taxon_id";
  } else if (resource === "selectedUsers") {
    idField = "user_id";
  } else if (resource === "selectedUsersIdentifiers") {
    idField = "ident_user_id";
  } else {
    throw Error("invalid selected resource: " + resource);
  }

  for await (const record of appStore[resource]) {
    let paramsTemp = {
      ...appStore.observationsApiParams,
      [idField]: record.id.toString(),
    };
    await updateObservationsCountForOne(record, resource, appStore, paramsTemp);
  }
}

export function renderSelectedResources(
  appStore: MapStore,
  doSideEffects = true,
) {
  renderTaxaList(appStore);
  renderTaxaIdentifiedList(appStore);
  renderPlacesList(appStore);
  renderProjectsList(appStore);
  renderUsersList(appStore);
  renderUsersIdentifiersList(appStore);

  if (doSideEffects) {
    updateAppUrl(window.location, appStore);
    if (appStore.record_type === "identifications") {
      window.dispatchEvent(new Event("identificationsChange"));
    } else if (appStore.record_type === "observations") {
      window.dispatchEvent(new Event("observationsChange"));
    }
  }
}

export function multisearchSetup(appStore: MapStore) {
  let searchSelector = "#inatAutocomplete";
  let searchInputEl = document.querySelector(
    searchSelector,
  ) as HTMLInputElement;
  if (!searchInputEl) return;

  let searchSelectEl = document.querySelector(
    "#search-type",
  ) as HTMLSelectElement;
  if (!searchSelectEl) return;

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
    taxaIdentified: {
      setup: setupTaxaIdentifiedSearch,
      selectedHandler: taxonIdentifiedSelectedHandler,
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
  storeResource: MapStoreSelectedResourcesKeys,
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

export function showHideUsersHeader() {
  showHideHeader("#sidebar-menu .users-heading", "selectedUsers");
}

export function showHideUsersIdentifiersHeader() {
  showHideHeader(
    "#sidebar-menu .users-identifiers-heading",
    "selectedUsersIdentifiers",
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
