import type { NormalizediNatUserType } from "../types/app.d.ts";
import type { AppStoreType } from "../types/app";
import {
  addValueToCommaSeparatedString,
  isObservationsCheck,
  removeIdfromInatApiParams,
  resetPageNumber,
} from "./data_utils.ts";
import { updateCountForOneRecord, updateCountForAll } from "./count_utils.ts";
import {
  updateTilesForSelectedTaxa,
  renderSelectedResources,
  showHideHeader,
} from "./search_utils.ts";
import { setupUserSearch } from "./search_users.ts";

export function setupUserAnnotatorsSearch(selector: string) {
  const autoCompleteUsersJS = setupUserSearch(selector);

  return autoCompleteUsersJS;
}

// called by autocomplete search when an user option is selected
export async function userAnnotatorsSelectedHandler(
  selection: NormalizediNatUserType,
  _query: string,
  appStore: AppStoreType,
) {
  let isObservations = isObservationsCheck(appStore);
  if (!isObservations) return;

  let user = selection;

  // add user to store
  appStore.selectedUsersAnnotators = [
    ...appStore.selectedUsersAnnotators,
    selection,
  ];
  resetPageNumber(appStore);
  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    annotation_user_id: addValueToCommaSeparatedString(
      selection.id,
      appStore.observationsApiParams.annotation_user_id,
    ),
  };

  let paramsTemp = {
    ...appStore.observationsApiParams,
    annotation_user_id: user.id.toString(),
  };
  await updateCountForOneRecord(
    user,
    "selectedUsersAnnotators",
    appStore,
    paramsTemp,
  );
  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedUsersAnnotators", appStore);

  renderSelectedResources(appStore, true);
}

export function showHideUsersAnnotatorsHeader() {
  showHideHeader(
    "#sidebar-menu .users-annotators-heading",
    "selectedUsersAnnotators",
  );
}

export function renderUsersAnnotatorsList(appStore: AppStoreType) {
  let listEl = document.querySelector("#selected-users-annotators-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedUsersAnnotators.forEach((user) => {
    let templateEl = document.createElement("users-list-item");
    templateEl.dataset.user = JSON.stringify(user);
    templateEl.dataset.type = "annotator";
    listEl.appendChild(templateEl);
  });
}

export async function removeUserAnnotator(
  userId: number,
  appStore: AppStoreType,
) {
  if (!appStore.selectedUsersAnnotators) return;

  // remove user
  removeOneUserAnnotatorFromStore(appStore, userId);

  // remove existing taxa tiles, and refetch taxa tiles
  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedUsersAnnotators", appStore);

  renderSelectedResources(appStore, true);
}

export function removeOneUserAnnotatorFromStore(
  appStore: AppStoreType,
  userId: number,
) {
  appStore.selectedUsersAnnotators = appStore.selectedUsersAnnotators.filter(
    (item) => item.id !== userId,
  );
  resetPageNumber(appStore);
  removeIdfromInatApiParams(appStore, "selectedUsersAnnotators", userId);
}
