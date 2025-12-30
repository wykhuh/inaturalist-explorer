import type { NormalizediNatTaxonType, AppStoreType } from "../types/app.d.ts";
import {
  addValueToCommaSeparatedString,
  formatTaxonName,
  isObservationsCheck,
  removeOneWithoutTaxonFromStore,
  resetPageNumber,
} from "./data_utils.ts";
import { renderSelectedResources } from "./search_utils.ts";
import { setupTaxaSearch } from "./search_taxa.ts";
import { updateCountForAll } from "./count_utils.ts";

export function setupWithoutTaxaSearch(
  selector: string,
  appStore: AppStoreType,
) {
  const autoCompleteTaxaJS = setupTaxaSearch(selector, appStore);

  return autoCompleteTaxaJS;
}

// called by autocomplete search when an taxa option is selected
export async function withoutTaxonSelectedHandler(
  selection: NormalizediNatTaxonType,
  _searchTerm: string,
  appStore: AppStoreType,
) {
  let isObservations = isObservationsCheck(appStore);
  if (!isObservations) return;

  let { title, subtitle } = formatTaxonName(selection, appStore);

  // save taxa to store
  let taxon = {
    ...selection,
    title,
    subtitle,
  };

  appStore.selectedWithoutTaxa = [...appStore.selectedWithoutTaxa, taxon];
  resetPageNumber(appStore);
  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    without_taxon_id: addValueToCommaSeparatedString(
      taxon.id,
      appStore.observationsApiParams.without_taxon_id,
    ),
  };

  await updateCountForAll("selectedWithoutTaxa", appStore);
  renderSelectedResources(appStore, true);
}

export function renderWithoutTaxaList(appStore: AppStoreType) {
  let listEl = document.querySelector("#selected-without-taxa-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedWithoutTaxa.forEach((taxon) => {
    let templateEl = document.createElement("species-basic-list-item");
    templateEl.dataset.taxon = JSON.stringify(taxon);
    templateEl.dataset.taxon_type = "withoutTaxon";
    listEl.appendChild(templateEl);
  });
}

// called when user deletes a taxon
export async function removeWithoutTaxon(
  taxonId: number,
  appStore: AppStoreType,
) {
  removeOneWithoutTaxonFromStore(appStore, taxonId);

  await updateCountForAll("all", appStore);
  renderSelectedResources(appStore, true);
}
