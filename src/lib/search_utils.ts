import type {
  MapStore,
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

export async function updateTilesForAllTaxa(appStore: MapStore) {
  for await (const taxon of appStore.selectedTaxa) {
    // remove existing taxon layers from map
    removeOneTaxonFromMap(appStore, taxon.id);

    let paramsTemp = {
      ...appStore.observationsApiParams,
      taxon_id: taxon.id.toString(),
      colors: taxon.color,
    };

    // get new iNat map tiles
    await fetchiNatMapDataForTaxon(taxon, appStore, paramsTemp);
  }
}

export async function updateObservationsCountFor(
  ignoreResource: MapStoreSelectedResourcesKeys | "all",
  appStore: MapStore,
) {
  let resources = [
    "selectedTaxa",
    "selectedPlaces",
    "selectedProjects",
    "selectedUsers",
    "selectedUsersIdentifiers",
  ];

  let targetResources = resources.filter((r) => r != ignoreResource);
  for await (const res of targetResources) {
    if (res === "selectedTaxa") {
      await updateObservationsCountForAllTaxa(appStore);
    } else if (res === "selectedPlaces") {
      await updateObservationsCountForAllPlaces(appStore);
    } else if (res === "selectedProjects") {
      await updateObservationsCountForAllProjects(appStore);
    } else if (res === "selectedUsers") {
      await updateObservationsCountForAllUsers(appStore);
    } else if (res === "selectedUsersIdentifiers") {
      await updateObservationsCountForAllUsers(appStore);
    }
  }
}

async function updateObservationsCountForAllTaxa(appStore: MapStore) {
  for await (const taxon of appStore.selectedTaxa) {
    let paramsTemp = {
      ...appStore.observationsApiParams,
      taxon_id: taxon.id.toString(),
    };
    await getObservationsCountForTaxon(taxon, appStore, paramsTemp);
  }
}

async function updateObservationsCountForAllPlaces(appStore: MapStore) {
  for await (const place of appStore.selectedPlaces) {
    let paramsTemp = {
      ...appStore.observationsApiParams,
      place_id: place.id.toString(),
    };
    await getObservationsCountForPlace(place, appStore, paramsTemp);
  }
}

async function updateObservationsCountForAllProjects(appStore: MapStore) {
  for await (const project of appStore.selectedProjects) {
    let paramsTemp = {
      ...appStore.observationsApiParams,
      project_id: project.id.toString(),
    };
    await getObservationsCountForProject(project, appStore, paramsTemp);
  }
}

async function updateObservationsCountForAllUsers(appStore: MapStore) {
  for await (const user of appStore.selectedUsers) {
    let paramsTemp = {
      ...appStore.observationsApiParams,
      user_id: user.id.toString(),
    };
    await getObservationsCountForUser(user, appStore, paramsTemp);
  }
}

export async function updateObservationsCountForAllUsersIdentifiers(
  appStore: MapStore,
) {
  for await (const user of appStore.selectedUsersIdentifiers) {
    let paramsTemp = {
      ...appStore.observationsApiParams,
      ident_user_id: user.id.toString(),
    };
    await getObservationsCountForUser(user, appStore, paramsTemp);
  }
}

export function renderSelectedResources(
  appStore: MapStore,
  doSideEffects = true,
) {
  renderTaxaList(appStore);
  renderPlacesList(appStore);
  renderProjectsList(appStore);
  renderUsersList(appStore);

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

export function showHideProjectsHeader() {
  showHideHeader("#sidebar-menu .projects-heading", "selectedProjects");
}

export function showHidePlacesHeader() {
  showHideHeader("#sidebar-menu .places-heading", "selectedPlaces");
}
