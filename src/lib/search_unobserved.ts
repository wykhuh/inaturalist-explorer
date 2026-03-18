import type { NormalizediNatUserType, AppStoreType } from "../types/app.d.ts";
import {
  updateTilesForSelectedTaxa,
  renderSelectedResources,
} from "./search_utils.ts";
import { setupUserSearch } from "./search_users.ts";
import { isObservationsCheck, resetPageNumber } from "./data_utils.ts";
import { updateCountForAll } from "./count_utils.ts";
import {
  renderSelectedFiltersList,
  setAutocompleteValuesToId,
} from "../components/ObservationsFilters/shared_utils.ts";
import { processFiltersForm } from "../components/ObservationsFilters/utils.ts";

export function setupUnobservedByUserSearch(selector: string) {
  const autoCompleteUsersJS = setupUserSearch(selector);

  return autoCompleteUsersJS;
}

// called by autocomplete search when an user option is selected
export async function unobservedByUserSelectedHandler(
  selection: NormalizediNatUserType,
  _query: string,
  appStore: AppStoreType,
) {
  let isObservations = isObservationsCheck(appStore);
  if (!isObservations) return;

  // add to store
  appStore.selectedUnobservedByUser = selection;
  resetPageNumber(appStore);

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
      setAutocompleteValuesToId(data);
      let results = processFiltersForm(data);
      renderSelectedFiltersList(results.params);
    }
  }

  renderSelectedResources(appStore, true);
}
