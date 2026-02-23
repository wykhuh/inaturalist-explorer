import type { NormalizediNatTaxonType, AppStoreType } from "../types/app.d.ts";
import { isIdentificationsCheck, resetPageNumber } from "./data_utils.ts";
import {
  renderSelectedResources,
  updateTilesForSelectedTaxa,
} from "./search_utils.ts";
import { setupTaxaSearch } from "./search_taxa.ts";
import { updateCountForAll } from "./count_utils.ts";
import { processFiltersForm } from "../components/ObservationsFilters/utils.ts";
import { renderSelectedFiltersList } from "../components/ObservationsFilters/shared_utils.ts";
import { loggerEvent } from "./logger.ts";

let searchId = "";

export function setupObservationFieldsTaxonSearch(
  selector: string,
  appStore: AppStoreType,
) {
  const autoCompleteTaxaJS = setupTaxaSearch(selector, appStore);
  searchId = selector;
  return autoCompleteTaxaJS;
}

// called by autocomplete search when an taxa option is selected
export async function observationFieldsTaxonSelectedHandler(
  selection: NormalizediNatTaxonType,
  _searchTerm: string,
  appStore: AppStoreType,
) {
  if (isIdentificationsCheck(appStore)) return;
  let searchEl = document.querySelector<HTMLInputElement>(searchId);
  if (!searchEl) return;
  let currentObsField = searchEl.dataset.current_obs_field;
  if (!currentObsField) return;

  loggerEvent(
    "[ObservationFieldsTaxonSearch dispatchEvent] observationFieldTaxonSelected",
  );
  window.dispatchEvent(
    new CustomEvent("observationFieldTaxonSelected", {
      detail: {
        selection,
        currentObsField,
      },
    }),
  );

  // add field to store
  resetPageNumber(appStore);

  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    [currentObsField]: selection.id,
  };

  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("all", appStore);

  // add observation field to filters list shown in filters modal
  const form = document.querySelector("#filters-form") as HTMLFormElement;
  if (form) {
    const data = new FormData(form);
    data.set(currentObsField, selection.id.toString());
    let results = processFiltersForm(data);
    renderSelectedFiltersList(results.params);
  }

  renderSelectedResources(appStore, true);
}
