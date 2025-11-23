import autoComplete from "@tarekraafat/autocomplete.js";

import type { AutoCompleteEvent, NormalizediNatUser } from "../types/app.d.ts";
import { autocomplete_users_api } from "../lib/inat_api.ts";
import type { iNatUsersAPI } from "../types/inat_api";
import { loggerUrl } from "../lib/logger.ts";
import type { MapStore } from "../types/app";
import {
  addValueToCommaSeparatedString,
  getObservationsCountForUserIdentifier,
  removeOneUserIdentifierFromStore,
} from "./data_utils.ts";
import {
  renderSelectedResources,
  updateObservationsCountFor,
  updateTilesForAllTaxa,
} from "./search_utils.ts";
import {
  processAutocompleteUser,
  renderAutocompleteUser,
} from "./search_users.ts";
import { renderSelectedFiltersList } from "../components/ObservationsFilters/utils.ts";

export function setupUserIdentifierSearch(
  selector: string,
  appStore: MapStore,
) {
  const autoCompleteUsersJS = new autoComplete({
    autocomplete: "off",
    selector: selector,
    placeHolder: "Enter username",
    threshold: 2,
    searchEngine: (_query: string, record: NormalizediNatUser) => {
      return renderAutocompleteUser(record);
    },
    data: {
      src: async (query: string) => {
        try {
          let url = `${autocomplete_users_api}&per_page=25&q=${query}`;
          let projectId = appStore.observationsApiParams.project_id;
          if (projectId) {
            // NOTE: iNaturlist API only allows one id for project_id
            let firstProjectId = projectId.split(",")[0];
            url += `&project_id=${firstProjectId}`;
          }
          loggerUrl(url);
          let res = await fetch(url);
          let data = (await res.json()) as iNatUsersAPI;
          return processAutocompleteUser(data);
        } catch (error) {
          console.error("setupUserSearch ERROR:", error);
        }
      },
    },
    resultsList: {
      maxResults: 25,
    },
    events: {
      input: {
        selection: (event: AutoCompleteEvent) => {
          const selection = event.detail.selection.value as NormalizediNatUser;
          autoCompleteUsersJS.input.value = selection.login;
        },
      },
    },
  });

  return autoCompleteUsersJS;
}

// called by autocomplete search when an user option is selected
export async function userIdentifierSelectedHandler(
  selection: NormalizediNatUser,
  _query: string,
  appStore: MapStore,
) {
  // add user to store
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

  let paramsTemp = {
    ...appStore.observationsApiParams,
    ident_user_id: selection.id.toString(),
  };
  await getObservationsCountForUserIdentifier(selection, appStore, paramsTemp);
  await updateTilesForAllTaxa(appStore);
  await updateObservationsCountFor("selectedUsersIdentifiers", appStore);

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
  appStore.selectedUsersIdentifiers.forEach((user) => {
    let templateEl = document.createElement("users-list-item");
    templateEl.dataset.user = JSON.stringify(user);
    templateEl.dataset.user_type = "identifier";
    listEl.appendChild(templateEl);
  });
}

export async function removeUserIdentifier(userId: number, appStore: MapStore) {
  if (!appStore.selectedUsersIdentifiers) return;

  // remove user
  removeOneUserIdentifierFromStore(appStore, userId);

  // remove existing taxa tiles, and refetch taxa tiles
  await updateTilesForAllTaxa(appStore);
  await updateObservationsCountFor("selectedUsersIdentifiers", appStore);

  renderSelectedResources(appStore);
}
