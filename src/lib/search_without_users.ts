import type { NormalizediNatUserType } from "../types/app.d.ts";
import type { AppStoreType } from "../types/app";
import {
  addValueToCommaSeparatedString,
  isObservationsCheck,
  removeIdfromInatApiParams,
  resetPageNumber,
} from "./data_utils.ts";
import { updateCountForAll } from "./count_utils.ts";
import {
  updateTilesForSelectedTaxa,
  renderSelectedResources,
  showHideHeader,
} from "./search_utils.ts";
import { setupUserSearch } from "./search_users.ts";

export function setupWithoutUserSearch(selector: string) {
  const autoCompleteUsersJS = setupUserSearch(selector);
  return autoCompleteUsersJS;
}

// called by autocomplete search when an user option is selected
export async function withoutUserSelectedHandler(
  selection: NormalizediNatUserType,
  _query: string,
  appStore: AppStoreType,
) {
  let isObservations = isObservationsCheck(appStore);
  if (!isObservations) return;

  // add user to store
  appStore.selectedWithoutUsers = [...appStore.selectedWithoutUsers, selection];
  resetPageNumber(appStore);

  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    not_user_id: addValueToCommaSeparatedString(
      selection.id,
      appStore.observationsApiParams.not_user_id,
    ),
  };

  updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedWithoutUsers", appStore);

  renderSelectedResources(appStore, true);
}

export function showHideWithoutUsersHeader() {
  showHideHeader(
    "#sidebar-menu .without-users-heading",
    "selectedWithoutUsers",
  );
}

export function renderWithoutUsersList(appStore: AppStoreType) {
  let listEl = document.querySelector("#selected-without-users-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedWithoutUsers.forEach((user) => {
    let templateEl = document.createElement("users-list-item");
    templateEl.dataset.user = JSON.stringify(user);
    templateEl.dataset.type = "withoutObserver";
    listEl.appendChild(templateEl);
  });
}

export async function removeWithoutUser(
  userId: number,
  appStore: AppStoreType,
) {
  if (!appStore.selectedUsers) return;

  // remove user
  removeOneWithoutUserFromStore(appStore, userId);

  // remove existing taxa tiles, and refetch taxa tiles
  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedWithoutUsers", appStore);

  renderSelectedResources(appStore, true);
}

export function removeOneWithoutUserFromStore(
  appStore: AppStoreType,
  userId: number,
) {
  appStore.selectedWithoutUsers = appStore.selectedWithoutUsers.filter(
    (item) => item.id !== userId,
  );
  resetPageNumber(appStore);
  removeIdfromInatApiParams(appStore, "selectedWithoutUsers", userId);
}
