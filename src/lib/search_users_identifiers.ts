import type { NormalizediNatUserType, AppStoreType } from "../types/app.d.ts";
import {
  addValueToCommaSeparatedString,
  isObservationsCheck,
  removeIdfromInatApiParams,
  resetPageNumber,
} from "./data_utils.ts";
import { updateCountForOneRecord, updateCountForAll } from "./count_utils.ts";
import {
  renderSelectedResources,
  showHideHeader,
  updateTilesForSelectedTaxa,
} from "./search_utils.ts";
import { setupUserSearch } from "./search_users.ts";

export function setupUserIdentifierSearch(selector: string) {
  const autoCompleteUsersJS = setupUserSearch(selector);

  return autoCompleteUsersJS;
}

// called by autocomplete search when an user option is selected
export async function userIdentifierSelectedHandler(
  selection: NormalizediNatUserType,
  _query: string,
  appStore: AppStoreType,
) {
  let isObservations = isObservationsCheck(appStore);

  // add user to store
  appStore.selectedUsersIdentifiers = [
    ...appStore.selectedUsersIdentifiers,
    selection,
  ];
  resetPageNumber(appStore);

  if (isObservations) {
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      ident_user_id: addValueToCommaSeparatedString(
        selection.id,
        appStore.observationsApiParams.ident_user_id,
      ),
    };
  } else {
    // NOTE: only allow one user id because iNat identifications api returns
    // zero records if there are multiple user ids
    appStore.identificationsApiParams = {
      ...appStore.identificationsApiParams,
      user_id: `${selection.id}`,
    };
  }

  let paramsTemp = {};

  if (isObservations) {
    paramsTemp = {
      ...appStore.observationsApiParams,
      ident_user_id: selection.id.toString(),
    };
  } else {
    paramsTemp = {
      ...appStore.identificationsApiParams,
      user_id: selection.id.toString(),
    };
  }

  await updateCountForOneRecord(
    selection,
    "selectedUsersIdentifiers",
    appStore,
    paramsTemp,
  );
  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedUsersIdentifiers", appStore);

  renderSelectedResources(appStore, true);
}

export function showHideUsersIdentifiersHeader() {
  showHideHeader(
    "#sidebar-menu .users-identifiers-heading",
    "selectedUsersIdentifiers",
  );
}

export function renderUsersIdentifiersList(appStore: AppStoreType) {
  let listEl = document.querySelector("#selected-users-identifiers-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  if (isObservationsCheck(appStore)) {
    appStore.selectedUsersIdentifiers.forEach((user) => {
      let templateEl = document.createElement("users-list-item");
      templateEl.dataset.user = JSON.stringify(user);
      templateEl.dataset.type = "identifier";
      listEl.appendChild(templateEl);
    });
  } else {
    // show last identifier for identifications
    let users = appStore.selectedUsersIdentifiers;
    let user = users[users.length - 1];
    if (user) {
      let templateEl = document.createElement("users-list-item");
      templateEl.dataset.user = JSON.stringify(user);
      templateEl.dataset.type = "identifier";
      listEl.appendChild(templateEl);
    }
  }
}

export async function removeUserIdentifier(
  userId: number,
  appStore: AppStoreType,
) {
  if (!appStore.selectedUsersIdentifiers) return;

  // remove user
  removeOneUserIdentifierFromStore(appStore, userId);

  // remove existing taxa tiles, and refetch taxa tiles
  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedUsersIdentifiers", appStore);

  renderSelectedResources(appStore, true);
}

export function removeOneUserIdentifierFromStore(
  appStore: AppStoreType,
  userId: number,
) {
  appStore.selectedUsersIdentifiers = appStore.selectedUsersIdentifiers.filter(
    (item) => item.id !== userId,
  );
  resetPageNumber(appStore);
  removeIdfromInatApiParams(appStore, "selectedUsersIdentifiers", userId);
}
