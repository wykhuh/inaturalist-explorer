import autoComplete from "@tarekraafat/autocomplete.js";

import type { AutoCompleteEvent, NormalizediNatUser } from "../types/app.d.ts";

import { autocomplete_users_api } from "../lib/inat_api.ts";
import type { iNatUsersAPI } from "../types/inat_api";

import { loggerUrl } from "../lib/logger.ts";

import type { MapStore } from "../types/app";

import {
  addIdToCommaSeparatedString,
  removeOneUserFromStore,
} from "./data_utils.ts";

import { updateAppUrl } from "./utils.ts";
import { renderTaxaList } from "./search_taxa.ts";
import { updateTilesAndCountForAllTaxa } from "./search_utils.ts";

export function setupUserSearch(selector: string) {
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

export function processAutocompleteUser(
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

export function renderAutocompleteUser(item: NormalizediNatUser): string {
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
export async function userSelectedHandler(
  selection: NormalizediNatUser,
  _query: string,
  appStore: MapStore,
) {
  // add project to store
  appStore.selectedUsers = [...appStore.selectedUsers, selection];
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    user_id: addIdToCommaSeparatedString(
      selection.id,
      appStore.inatApiParams.user_id,
    ),
  };

  // get iNat map tiles for selected user
  updateTilesAndCountForAllTaxa(appStore);

  renderTaxaList(appStore);
  renderUsersList(appStore);
  updateAppUrl(window.location, appStore);
  window.dispatchEvent(new Event("observationsChange"));
}

export function renderUsersList(appStore: MapStore) {
  let listEl = document.querySelector("#selected-users-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedUsers.forEach((user) => {
    let templateEl = document.createElement("x-users-list-item");
    if (!templateEl) return;
    templateEl.dataset.user = JSON.stringify(user);
    listEl.appendChild(templateEl);
  });
}

export async function removeUser(userId: number, appStore: MapStore) {
  if (!appStore.selectedUsers) return;

  // remove user
  removeOneUserFromStore(appStore, userId);

  // remove existing taxa tiles, and refetch taxa tiles
  updateTilesAndCountForAllTaxa(appStore);

  renderTaxaList(appStore);
  renderUsersList(appStore);
  updateAppUrl(window.location, appStore);
  window.dispatchEvent(new Event("observationsChange"));
}
