import type { NormalizediNatUserType, AppStoreType } from "../types/app.d.ts";
import {
  addValueToCommaSeparatedString,
  isObservationsCheck,
  removeIdfromInatApiParams,
  resetPageNumber,
} from "./data_utils.ts";
import { updateCountForAll } from "./count_utils.ts";
import {
  renderSelectedResources,
  showHideHeader,
  updateTilesForSelectedTaxa,
} from "./search_utils.ts";
import { setupUserSearch } from "./search_users.ts";

export function setupWithoutUserIdentifierSearch(selector: string) {
  const autoCompleteUsersJS = setupUserSearch(selector);

  return autoCompleteUsersJS;
}

// called by autocomplete search when an user option is selected
export async function withoutUserIdentifierSelectedHandler(
  selection: NormalizediNatUserType,
  _query: string,
  appStore: AppStoreType,
) {
  let isObservations = isObservationsCheck(appStore);
  if (!isObservations) return;

  // add user to store

  appStore.selectedWithoutUsersIdentifiers = [
    ...appStore.selectedWithoutUsersIdentifiers,
    selection,
  ];
  resetPageNumber(appStore);

  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    without_ident_user_id: addValueToCommaSeparatedString(
      selection.id,
      appStore.observationsApiParams.without_ident_user_id,
    ),
  };

  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedWithoutUsersIdentifiers", appStore);

  renderSelectedResources(appStore, true);
}

export function showHideWithoutUsersIdentifiersHeader() {
  showHideHeader(
    "#sidebar-menu .without-users-identifiers-heading",
    "selectedWithoutUsersIdentifiers",
  );
}

export function renderWithoutUsersIdentifiersList(appStore: AppStoreType) {
  let listEl = document.querySelector(
    "#selected-without-users-identifiers-list",
  );
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedWithoutUsersIdentifiers.forEach((user) => {
    let templateEl = document.createElement("users-list-item");
    templateEl.dataset.user = JSON.stringify(user);
    templateEl.dataset.type = "withoutIdentifier";
    listEl.appendChild(templateEl);
  });
}

export async function removeWithoutUserIdentifier(
  userId: number,
  appStore: AppStoreType,
) {
  if (!appStore.selectedWithoutUsersIdentifiers) return;

  // remove user
  removeOneWithoutUserIdentifierFromStore(appStore, userId);

  // remove existing taxa tiles, and refetch taxa tiles
  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedWithoutUsersIdentifiers", appStore);

  renderSelectedResources(appStore, true);
}

export function removeOneWithoutUserIdentifierFromStore(
  appStore: AppStoreType,
  userId: number,
) {
  appStore.selectedWithoutUsersIdentifiers =
    appStore.selectedWithoutUsersIdentifiers.filter(
      (item) => item.id !== userId,
    );
  resetPageNumber(appStore);
  removeIdfromInatApiParams(
    appStore,
    "selectedWithoutUsersIdentifiers",
    userId,
  );
}
