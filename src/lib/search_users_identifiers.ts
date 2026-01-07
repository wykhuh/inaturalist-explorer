import type { NormalizediNatUserType, AppStoreType } from "../types/app.d.ts";
import {
  addValueToCommaSeparatedString,
  isIdentificationsCheck,
  isObservationsCheck,
  removeOneUserIdentifierFromStore,
  resetPageNumber,
} from "./data_utils.ts";
import { updateCountForOne, updateCountForAll } from "./count_utils.ts";
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

  if (isObservations) {
    appStore.selectedUsersIdentifiers = [selection];
    resetPageNumber(appStore);
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      ident_user_id: selection.id.toString(),
    };
  } else {
    appStore.selectedUsersIdentifiers = [
      ...appStore.selectedUsersIdentifiers,
      selection,
    ];
    resetPageNumber(appStore);
    appStore.identificationsApiParams = {
      ...appStore.identificationsApiParams,
      user_id: addValueToCommaSeparatedString(
        selection.id,
        appStore.identificationsApiParams.user_id,
      ),
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

  await updateCountForOne(
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
  if (isIdentificationsCheck(appStore)) {
    appStore.selectedUsersIdentifiers.forEach((user) => {
      let templateEl = document.createElement("users-list-item");
      templateEl.dataset.user = JSON.stringify(user);
      templateEl.dataset.user_type = "identifier";
      listEl.appendChild(templateEl);
    });
  } else if (
    isObservationsCheck(appStore) &&
    appStore.selectedUsersIdentifiers.length > 0
  ) {
    // NOTE: only show last identifier since iNat observations API only allows
    // one identifier
    let user =
      appStore.selectedUsersIdentifiers[
        appStore.selectedUsersIdentifiers.length - 1
      ];

    let templateEl = document.createElement("users-list-item");
    templateEl.dataset.user = JSON.stringify(user);
    templateEl.dataset.user_type = "identifier";
    listEl.appendChild(templateEl);
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
