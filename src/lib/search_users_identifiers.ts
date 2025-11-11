import autoComplete from "@tarekraafat/autocomplete.js";

import type { AutoCompleteEvent, NormalizediNatUser } from "../types/app.d.ts";
import { autocomplete_users_api } from "../lib/inat_api.ts";
import type { iNatUsersAPI } from "../types/inat_api";
import { loggerUrl } from "../lib/logger.ts";
import type { MapStore } from "../types/app";
import { removeOneUserIdentifierFromStore } from "./data_utils.ts";
import {
  updateTilesAndCountForAllTaxa,
  renderSelectedResources,
  updateCountForAllProjects,
  updateCountForAllPlaces,
  updateCountForAllUsers,
} from "./search_utils.ts";
import {
  processAutocompleteUser,
  renderAutocompleteUser,
} from "./search_users.ts";

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
          let projectId = appStore.inatApiParams.project_id;
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
  // add project to store
  appStore.selectedUsersIdentifiers = selection;
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    ident_user_id: selection.id,
  };

  await updateTilesAndCountForAllTaxa(appStore);
  await updateCountForAllPlaces(appStore);
  await updateCountForAllProjects(appStore);
  await updateCountForAllUsers(appStore);

  renderSelectedResources(appStore);
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
