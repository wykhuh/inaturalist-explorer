import type {
  NormalizediNatTaxonType,
  AppStoreType,
  DataComponentType,
} from "../types/app.d.ts";
import {
  addValueToCommaSeparatedString,
  formatTaxonName,
  isIdentificationsCheck,
  isObservationsCheck,
  removeIdfromInatApiParams,
  resetPageNumber,
} from "./data_utils.ts";
import {
  renderSelectedResources,
  showHideHeader,
  updateTilesForSelectedTaxa,
} from "./search_utils.ts";
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
  let isIdentifications = isIdentificationsCheck(appStore);

  let { title, subtitle } = formatTaxonName(selection, appStore);

  // save taxa to store
  let taxon = {
    ...selection,
    title,
    subtitle,
  };

  appStore.selectedWithoutTaxa = [...appStore.selectedWithoutTaxa, taxon];
  resetPageNumber(appStore);

  if (isObservations) {
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      without_taxon_id: addValueToCommaSeparatedString(
        taxon.id,
        appStore.observationsApiParams.without_taxon_id,
      ),
    };
  } else if (isIdentifications) {
    appStore.identificationsApiParams = {
      ...appStore.identificationsApiParams,
      without_observation_taxon_id: addValueToCommaSeparatedString(
        taxon.id,
        appStore.identificationsApiParams.without_observation_taxon_id,
      ),
    };
  }

  updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("selectedWithoutTaxa", appStore);
  renderSelectedResources(appStore, true);
}

export function showHideWithoutTaxaHeader() {
  showHideHeader("#sidebar-menu .without-taxa-heading", "selectedWithoutTaxa");
}

export function renderWithoutTaxaList(appStore: AppStoreType) {
  let listEl = document.querySelector("#selected-without-taxa-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedWithoutTaxa.forEach((taxon) => {
    let templateEl = document.createElement(
      "species-basic-list-item",
    ) as DataComponentType;
    templateEl.data = taxon;
    templateEl.type = "withoutTaxon";
    listEl.appendChild(templateEl);
  });
}

// called when user deletes a taxon
export async function removeWithoutTaxon(
  taxonId: number,
  appStore: AppStoreType,
) {
  removeOneWithoutTaxonFromStore(appStore, taxonId);

  updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("all", appStore);
  renderSelectedResources(appStore, true);
}

export function removeOneWithoutTaxonFromStore(
  appStore: AppStoreType,
  taxonId: number,
) {
  appStore.selectedWithoutTaxa = appStore.selectedWithoutTaxa.filter(
    (taxon) => taxon.id !== taxonId,
  );
  resetPageNumber(appStore);
  removeIdfromInatApiParams(appStore, "selectedWithoutTaxa", taxonId);
}
