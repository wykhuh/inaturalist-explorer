import type { NormalizediNatUserType, AppStoreType } from "../types/app.d.ts";
import {
  updateTilesForSelectedTaxa,
  renderSelectedResources,
} from "./search_utils.ts";
import { setupUserSearch } from "./search_users.ts";
import { isObservationsCheck, resetPageNumber } from "./data_utils.ts";
import { updateCountForAll } from "./count_utils.ts";
import { renderSelectedFiltersList } from "../components/ObservationsFilters/shared_utils.ts";
import { processFiltersForm } from "../components/ObservationsFilters/utils.ts";

export function setupReviewerSearch(selector: string) {
  const autoCompleteUsersJS = setupUserSearch(selector);

  return autoCompleteUsersJS;
}

// called by autocomplete search when an user option is selected
export async function reviewerSelectedHandler(
  selection: NormalizediNatUserType,
  _query: string,
  appStore: AppStoreType,
) {
  let isObservations = isObservationsCheck(appStore);
  if (!isObservations) return;

  // add to store
  appStore.selectedReviewer = selection;
  resetPageNumber(appStore);
  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    viewer_id: selection.id,
  };

  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("all", appStore);

  // add reviewer_id to filters list shown in filters modal
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
