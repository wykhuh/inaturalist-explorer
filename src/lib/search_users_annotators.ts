import type { NormalizediNatUserType } from "../types/app.d.ts";
import type { AppStoreType } from "../types/app";
import {
  addValueToCommaSeparatedString,
  isObservationsCheck,
  removeOneUserFromStore,
  resetPageNumber,
} from "./data_utils.ts";
import { updateCountForOne, updateCountForAll } from "./count_utils.ts";
import {
  updateTilesForSelectedTaxa,
  renderSelectedResources,
} from "./search_utils.ts";
import { setupUserSearch } from "./search_users.ts";

export function setupUserAnnotatorsSearch(
  selector: string,
  appStore: AppStoreType,
) {
  const autoCompleteUsersJS = setupUserSearch(selector, appStore);

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
  await updateCountForOne(
    user,
    "selectedUsersAnnotators",
    appStore,
    paramsTemp,
  );
  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedUsersAnnotators", appStore);

  renderSelectedResources(appStore, true);
}

export function renderUsersAnnotatorsList(appStore: AppStoreType) {
  let listEl = document.querySelector("#selected-users-annotators-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedUsersAnnotators.forEach((user) => {
    let templateEl = document.createElement("users-list-item");
    templateEl.dataset.user = JSON.stringify(user);
    templateEl.dataset.user_type = "annotator";
    listEl.appendChild(templateEl);
  });
}

export async function removeUser(userId: number, appStore: AppStoreType) {
  if (!appStore.selectedUsers) return;

  // remove user
  removeOneUserFromStore(appStore, userId);

  // remove existing taxa tiles, and refetch taxa tiles
  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedUsers", appStore);

  renderSelectedResources(appStore, true);
}
