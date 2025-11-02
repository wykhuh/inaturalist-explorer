import autoComplete from "@tarekraafat/autocomplete.js";

import type { AutoCompleteEvent, NormalizediNatUser } from "../types/app.d.ts";

import { autocomplete_users_api } from "../lib/inat_api.ts";
import type { iNatUsersAPI } from "../types/inat_api";

import { loggerUrl } from "../lib/logger.ts";

import type { MapStore } from "../types/app";

import {
  getObservationsCountForUserIdentifier,
  removeOneUserIdentifierFromStore,
} from "./data_utils.ts";

import {
  updateTilesAndCountForAllTaxa,
  renderSelectedResources,
  updateCountForAllProjects,
  updateCountForAllPlaces,
  updateCountForAllUsers,
} from "./search_utils.ts";

export function setupUserIdentifierSearch(selector: string) {
  const autoCompleteUsersJS = new autoComplete({
    autocomplete: "off",
    selector: selector,
    placeHolder: "Enter username",
    threshold: 2,
    searchEngine: (_query: string, record: NormalizediNatUser) => {
      return renderAutocompleteUserIdentifier(record);
    },
    data: {
      src: async (query: string) => {
        try {
          let url = `${autocomplete_users_api}&per_page=25&q=${query}`;
          loggerUrl(url);
          let res = await fetch(url);
          let data = (await res.json()) as iNatUsersAPI;
          return processAutocompleteUserIdentifier(data);
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

export function processAutocompleteUserIdentifier(
  data: iNatUsersAPI,
): NormalizediNatUser[] {
  return data.results.map((item) => {
    return {
      id: item.id,
      login: item.login,
      name: item.name,
    };
  });
}

export function renderAutocompleteUserIdentifier(
  item: NormalizediNatUser,
): string {
  let html = `
  <div class="users-ac-option" data-testid="users-ac-option">
    <div class="user-name">
    ${item.login}`;

  if (item.name) {
    html += ` (${item.name})`;
  }

  html += `
    </div>
  </div>`;

  return html;
}

// called by autocomplete search when an user option is selected
export async function userIdentifierSelectedHandler(
  selection: NormalizediNatUser,
  _query: string,
  appStore: MapStore,
) {
  let user = selection;
  // add project to store
  appStore.selectedUsersIdentifiers = selection;
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    ident_user_id: selection.id,
  };

  let paramsTemp = {
    ...appStore.inatApiParams,
    ident_user_id: user.id,
  };
  await getObservationsCountForUserIdentifier(user, appStore, paramsTemp);
  await updateTilesAndCountForAllTaxa(appStore);
  await updateCountForAllPlaces(appStore);
  await updateCountForAllProjects(appStore);
  await updateCountForAllUsers(appStore);

  renderSelectedResources(appStore);
}

export function renderUsersIdentifiersList(appStore: MapStore) {
  let listEl = document.querySelector("#selected-users-identifiers-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  if (appStore.selectedUsersIdentifiers.id) {
    let templateEl = document.createElement("x-users-identifiers-list-item");
    if (!templateEl) return;
    templateEl.dataset.user = JSON.stringify(appStore.selectedUsersIdentifiers);
    listEl.appendChild(templateEl);
  }
}

export async function removeUserIdentifier(appStore: MapStore) {
  if (!appStore.selectedUsers) return;

  // remove user
  removeOneUserIdentifierFromStore(appStore);

  // remove existing taxa tiles, and refetch taxa tiles
  await updateTilesAndCountForAllTaxa(appStore);
  await updateCountForAllPlaces(appStore);
  await updateCountForAllProjects(appStore);
  await updateCountForAllUsers(appStore);

  renderSelectedResources(appStore);
}
