import type { NormalizediNatUser } from "../types/app.d.ts";
import type { MapStore } from "../types/app";
import {
  addValueToCommaSeparatedString,
  removeOneUserIdentifierFromStore,
} from "./data_utils.ts";
import {
  updateObservationsCountForOne,
  updateObservationsCountForAll,
} from "./count_utils.ts";
import {
  renderSelectedResources,
  updateTilesForAllTaxa,
} from "./search_utils.ts";
import { setupUserSearch } from "./search_users.ts";
import { renderSelectedFiltersList } from "../components/ObservationsFilters/utils.ts";

export function setupUserIdentifierSearch(
  selector: string,
  appStore: MapStore,
) {
  const autoCompleteUsersJS = setupUserSearch(selector, appStore);

  return autoCompleteUsersJS;
}

// called by autocomplete search when an user option is selected
export async function userIdentifierSelectedHandler(
  selection: NormalizediNatUser,
  _query: string,
  appStore: MapStore,
) {
  // add user to store

  if (appStore.record_type === "identifications") {
    appStore.selectedUsersIdentifiers = [
      ...appStore.selectedUsersIdentifiers,
      selection,
    ];
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      ident_user_id: addValueToCommaSeparatedString(
        selection.id,
        appStore.observationsApiParams.ident_user_id,
      ),
    };
  } else {
    appStore.selectedUsersIdentifiers = [selection];
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      ident_user_id: selection.id.toString(),
    };
  }

  let paramsTemp = {
    ...appStore.observationsApiParams,
    ident_user_id: selection.id.toString(),
  };
  await updateObservationsCountForOne(
    selection,
    "selectedUsersIdentifiers",
    appStore,
    paramsTemp,
  );
  await updateTilesForAllTaxa(appStore);
  await updateObservationsCountForAll("selectedUsersIdentifiers", appStore);

  // add ident_user_id to filters list shown in filters modal
  const form = document.querySelector("#filters-form") as HTMLFormElement;
  if (form) {
    const formData = new FormData(form);
    renderSelectedFiltersList(formData);
  }

  renderSelectedResources(appStore);
}

export function renderUsersIdentifiersList(appStore: MapStore) {
  let listEl = document.querySelector("#selected-users-identifiers-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  if (appStore.record_type === "identifications") {
    appStore.selectedUsersIdentifiers.forEach((user) => {
      let templateEl = document.createElement("users-list-item");
      templateEl.dataset.user = JSON.stringify(user);
      templateEl.dataset.user_type = "identifier";
      listEl.appendChild(templateEl);
    });
  } else if (
    appStore.record_type === "observations" &&
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

export async function removeUserIdentifier(userId: number, appStore: MapStore) {
  if (!appStore.selectedUsersIdentifiers) return;

  // remove user
  removeOneUserIdentifierFromStore(appStore, userId);

  // remove existing taxa tiles, and refetch taxa tiles
  await updateTilesForAllTaxa(appStore);
  await updateObservationsCountForAll("selectedUsersIdentifiers", appStore);

  renderSelectedResources(appStore);
}
