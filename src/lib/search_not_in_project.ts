import type {
  NormalizediNatProjectType,
  AppStoreType,
} from "../types/app.d.ts";
import { isObservationsCheck, resetPageNumber } from "./data_utils.ts";
import { updateCountForAll } from "./count_utils.ts";
import {
  updateTilesForSelectedTaxa,
  renderSelectedResources,
} from "./search_utils.ts";
import { setupProjectSearch } from "./search_projects.ts";
import { processFiltersForm } from "../components/ObservationsFilters/utils.ts";
import { renderSelectedFiltersList } from "../components/ObservationsFilters/shared_utils.ts";

export function setupNotInProjectSearch(selector: string) {
  const autoCompleteProjectJS = setupProjectSearch(selector);

  return autoCompleteProjectJS;
}

// called by autocomplete search when an project option is selected
export async function notInProjectSelectedHandler(
  selection: NormalizediNatProjectType,
  _query: string,
  appStore: AppStoreType,
) {
  let isObservations = isObservationsCheck(appStore);
  if (!isObservations) return;

  let project = selection;

  // add project to store
  appStore.selectedNotInProject = project;
  resetPageNumber(appStore);
  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    not_in_project: project.id.toString(),
  };

  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("all", appStore);

  // add not_in_project to filters list shown in filters modal
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
