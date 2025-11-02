import type { MapStore } from "../types/app";
import {
  fetchiNatMapDataForTaxon,
  getObservationsCountForPlace,
  getObservationsCountForTaxon,
  getObservationsCountForProject,
  removeOneTaxonFromMap,
  getObservationsCountForUser,
  getObservationsCountForUserIdentifier,
} from "./data_utils";
import { renderPlacesList } from "./search_places";
import { renderProjectsList } from "./search_projects";
import { renderTaxaList } from "./search_taxa";
import { renderUsersList } from "./search_users";
import { renderUsersIdentifiersList } from "./search_users_identifiers";
import { updateAppUrl } from "./utils";

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
