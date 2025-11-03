import type {
  MapStore,
  NormalizediNatUser,
  MapStoreSelectedResourcesKeys,
  SearchOptions,
  SearchOptionsKeys,
} from "../types/app";
import {
  fetchiNatMapDataForTaxon,
  getObservationsCountForPlace,
  getObservationsCountForTaxon,
  getObservationsCountForProject,
  removeOneTaxonFromMap,
  getObservationsCountForUser,
  getObservationsCountForUserIdentifier,
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
import {
  renderUsersIdentifiersList,
  setupUserIdentifierSearch,
  userIdentifierSelectedHandler,
} from "./search_users_identifiers";

export async function updateTilesAndCountForAllTaxa(appStore: MapStore) {
  for await (const taxon of appStore.selectedTaxa) {
    // remove existing taxon layers from map
    removeOneTaxonFromMap(appStore, taxon.id);

    let paramsTemp = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };

    // get new iNat map tiles
    await fetchiNatMapDataForTaxon(taxon, appStore, paramsTemp);
    // fetch new counts from api
    await getObservationsCountForTaxon(taxon, appStore, paramsTemp);
  }
}

export async function updateCountForAllTaxa(appStore: MapStore) {
  for await (const taxon of appStore.selectedTaxa) {
    let paramsTemp = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
    };
    await getObservationsCountForTaxon(taxon, appStore, paramsTemp);
  }
}

export async function updateCountForAllPlaces(appStore: MapStore) {
  for await (const place of appStore.selectedPlaces) {
    let paramsTemp = {
      ...appStore.inatApiParams,
      place_id: place.id.toString(),
    };
    await getObservationsCountForPlace(place, appStore, paramsTemp);
  }
}

export async function updateCountForAllProjects(appStore: MapStore) {
  for await (const project of appStore.selectedProjects) {
    let paramsTemp = {
      ...appStore.inatApiParams,
      project_id: project.id.toString(),
    };
    await getObservationsCountForProject(project, appStore, paramsTemp);
  }
}

export async function updateTilesForAllTaxa(appStore: MapStore) {
  for await (const taxon of appStore.selectedTaxa) {
    // remove existing taxon layers from map
    removeOneTaxonFromMap(appStore, taxon.id);

    let paramsTemp = {
      ...appStore.inatApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };

    // get new iNat map tiles
    await fetchiNatMapDataForTaxon(taxon, appStore, paramsTemp);
  }
}

export async function updateCountForAllUsers(appStore: MapStore) {
  for await (const user of appStore.selectedUsers) {
    let paramsTemp = {
      ...appStore.inatApiParams,
      user_id: user.id.toString(),
    };
    await getObservationsCountForUser(user, appStore, paramsTemp);
  }
}

export async function updateCountForAllUsersIdentifiers(appStore: MapStore) {
  const user = appStore.selectedUsersIdentifiers;
  let paramsTemp = {
    ...appStore.inatApiParams,
    ident_user_id: user.id,
  };
  await getObservationsCountForUserIdentifier(user, appStore, paramsTemp);
}

export function renderSelectedResources(
  appStore: MapStore,
  doSideEffects = true,
) {
  renderTaxaList(appStore);
  renderPlacesList(appStore);
  renderProjectsList(appStore);
  renderUsersList(appStore);
  renderUsersIdentifiersList(appStore);

  if (doSideEffects) {
    updateAppUrl(window.location, appStore);
    window.dispatchEvent(new Event("observationsChange"));
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
    users_identifiers: {
      setup: setupUserIdentifierSearch,
      selectedHandler: userIdentifierSelectedHandler,
    },
    taxa: {
      setup: setupTaxaSearch,
      selectedHandler: taxonSelectedHandler,
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

    // remove event listerner for autocomplete search
    setup.unInit();
    // clear search input
    searchInputEl.innerHTML = "";
    searchInputEl.value = "";

    let targetSearch = searchOptions[target.value as SearchOptionsKeys];

    setup = targetSearch.setup(searchSelector, appStore);
    selectedHandler = targetSearch.selectedHandler;
  });
}

function isResourceObject(input: any): input is NormalizediNatUser {
  return !Array.isArray(input);
}

function showHideHeader(
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

export function searchHeadingSetup() {
  window.addEventListener("selectedPlacesChange", () => {
    showHideHeader("#home #sidebar-menu .places-heading", "selectedPlaces");
  });
  window.addEventListener("selectedProjectsChange", () => {
    showHideHeader("#home #sidebar-menu .projects-heading", "selectedProjects");
  });
  window.addEventListener("selectedUsersChange", () => {
    showHideHeader("#home #sidebar-menu .users-heading", "selectedUsers");
  });
  window.addEventListener("selectedUsersIdentifiersChange", () => {
    showHideHeader(
      "#home #sidebar-menu .users-identifiers-heading",
      "selectedUsersIdentifiers",
    );
  });
}
