import autoComplete from "@tarekraafat/autocomplete.js";

import type { AutoCompleteEvent, NormalizediNatUser } from "../types/app.d.ts";
import { autocomplete_users_api } from "../lib/inat_api.ts";
import type { iNatUsersAPI } from "../types/inat_api";
import { loggerUrl } from "../lib/logger.ts";
import type { MapStore } from "../types/app";
import {
  updateTilesForSelectedTaxa,
  renderSelectedResources,
} from "./search_utils.ts";
import {
  processAutocompleteUser,
  renderAutocompleteUser,
} from "./search_users.ts";
import {
  isObservationsCheck,
  removeOneUnobservedByUserFromStore,
} from "./data_utils.ts";
import { updateCountForAll } from "./count_utils.ts";
import { renderSelectedFiltersList } from "../components/ObservationsFilters/shared_utils.ts";
import { processFiltersForm } from "../components/ObservationsFilters/utils.ts";

export function setupUnobservedByUserSearch(
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
export async function unobservedByUserSelectedHandler(
  selection: NormalizediNatUser,
  _query: string,
  appStore: MapStore,
) {
  let isObservations = isObservationsCheck(appStore);
  if (!isObservations) return;

  // add project to store
  appStore.selectedUnobservedByUser = selection;
  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    unobserved_by_user_id: selection.id,
  };

  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("all", appStore);

  // add unobserved_by_user_id to filters list shown in filters modal
  const form = document.querySelector("#filters-form") as HTMLFormElement;
  if (form) {
    const data = new FormData(form);
    if (isObservationsCheck(appStore)) {
      let results = processFiltersForm(data);
      renderSelectedFiltersList(results.params);
    }
  }

  renderSelectedResources(appStore, true);
}

export async function removeUnobservedByUser(appStore: MapStore) {
  if (!appStore.selectedUsers) return;

  // remove user
  removeOneUnobservedByUserFromStore(appStore);

  // remove existing taxa tiles, and refetch taxa tiles
  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("all", appStore);

  renderSelectedResources(appStore, true);
}
