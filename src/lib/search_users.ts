import autoComplete from "@tarekraafat/autocomplete.js";

import type { AutoCompleteEvent, NormalizediNatUser } from "../types/app.d.ts";
import { autocomplete_users_api } from "../lib/inat_api.ts";
import type { iNatUsersAPI } from "../types/inat_api";
import { loggerUrl } from "../lib/logger.ts";
import type { MapStore } from "../types/app";
import {
  addValueToCommaSeparatedString,
  isObservationsCheck,
  removeOneUserFromStore,
} from "./data_utils.ts";
import { updateCountForOne, updateCountForAll } from "./count_utils.ts";
import {
  updateTilesForSelectedTaxa,
  renderSelectedResources,
} from "./search_utils.ts";

export function setupUserSearch(selector: string, appStore: MapStore) {
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
  let isObservations = isObservationsCheck(appStore);
  if (!isObservations) return;

  let user = selection;

  // add user to store
  appStore.selectedUsers = [...appStore.selectedUsers, selection];

  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    user_id: addValueToCommaSeparatedString(
      selection.id,
      appStore.observationsApiParams.user_id,
    ),
  };

  let paramsTemp = {
    ...appStore.observationsApiParams,
    user_id: user.id.toString(),
  };
  await updateCountForOne(user, "selectedUsers", appStore, paramsTemp);
  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedUsers", appStore);

  renderSelectedResources(appStore, true);
}

export function renderUsersList(appStore: MapStore) {
  let listEl = document.querySelector("#selected-users-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedUsers.forEach((user) => {
    let templateEl = document.createElement("users-list-item");
    templateEl.dataset.user = JSON.stringify(user);
    templateEl.dataset.user_type = "observer";
    listEl.appendChild(templateEl);
  });
}

export async function removeUser(userId: number, appStore: MapStore) {
  if (!appStore.selectedUsers) return;

  // remove user
  removeOneUserFromStore(appStore, userId);

  // remove existing taxa tiles, and refetch taxa tiles
  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedUsers", appStore);

  renderSelectedResources(appStore, true);
}
