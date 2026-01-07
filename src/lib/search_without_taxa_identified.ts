import type { NormalizediNatTaxonType, AppStoreType } from "../types/app.d.ts";
import {
  addValueToCommaSeparatedString,
  formatTaxonName,
  isIdentificationsCheck,
  removeOneWithoutTaxonIdentifiedFromStore,
  resetPageNumber,
} from "./data_utils.ts";
import { renderSelectedResources, showHideHeader } from "./search_utils.ts";
import { setupTaxaSearch } from "./search_taxa.ts";
import { updateCountForAll } from "./count_utils.ts";

export function setupWithoutTaxaIdentifiedSearch(
  selector: string,
  appStore: AppStoreType,
) {
  const autoCompleteTaxaJS = setupTaxaSearch(selector, appStore);

  return autoCompleteTaxaJS;
}

// called by autocomplete search when an taxa option is selected
export async function withoutTaxonIdentifiedSelectedHandler(
  selection: NormalizediNatTaxonType,
  _searchTerm: string,
  appStore: AppStoreType,
) {
  let isIdentifications = isIdentificationsCheck(appStore);
  if (!isIdentifications) return;

  let { title, subtitle } = formatTaxonName(selection, appStore);

  // save taxa to store
  let taxon = {
    ...selection,
    title,
    subtitle,
  };

  appStore.selectedWithoutTaxaIdentified = [
    ...appStore.selectedWithoutTaxaIdentified,
    taxon,
  ];

  resetPageNumber(appStore);

  appStore.identificationsApiParams = {
    ...appStore.identificationsApiParams,
    without_taxon_id: addValueToCommaSeparatedString(
      taxon.id,
      appStore.identificationsApiParams.without_taxon_id,
    ),
  };

  await updateCountForAll("selectedWithoutTaxaIdentified", appStore);
  renderSelectedResources(appStore, true);
}

export function showHideWithoutTaxaIdentifiedHeader() {
  showHideHeader(
    "#sidebar-menu .without-taxa-identified-heading",
    "selectedWithoutTaxaIdentified",
  );
}

export function renderWithoutTaxaIdentifiedList(appStore: AppStoreType) {
  let listEl = document.querySelector("#selected-without-taxa-identified-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedWithoutTaxaIdentified.forEach((taxon) => {
    let templateEl = document.createElement("species-basic-list-item");
    templateEl.dataset.taxon = JSON.stringify(taxon);
    templateEl.dataset.taxon_type = "withoutTaxonIdentified";
    listEl.appendChild(templateEl);
  });
}

// called when user deletes a taxon
export async function removeWithoutTaxonIdentified(
  taxonId: number,
  appStore: AppStoreType,
) {
  removeOneWithoutTaxonIdentifiedFromStore(appStore, taxonId);

  await updateCountForAll("all", appStore);
  renderSelectedResources(appStore, true);
}
