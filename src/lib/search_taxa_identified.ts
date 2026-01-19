import type { NormalizediNatTaxonType, AppStoreType } from "../types/app.d.ts";
import {
  addDefaultTaxaRecordToMap,
  addDefaultTaxaRecordToStore,
  addValueToCommaSeparatedString,
  formatTaxonName,
  isObservationsCheck,
  removeIdfromInatApiParams,
  resetPageNumber,
} from "./data_utils.ts";
import { renderSelectedResources, showHideHeader } from "./search_utils.ts";
import { removeTaxaFromStoreAndMap, setupTaxaSearch } from "./search_taxa.ts";
import { updateCountForAll, updateCountForOneRecord } from "./count_utils.ts";

export function setupTaxaIdentifiedSearch(
  selector: string,
  appStore: AppStoreType,
) {
  const autoCompleteTaxaJS = setupTaxaSearch(selector, appStore);

  return autoCompleteTaxaJS;
}

// called by autocomplete search when an taxa option is selected
export async function taxonIdentifiedSelectedHandler(
  selection: NormalizediNatTaxonType,
  _searchTerm: string,
  appStore: AppStoreType,
) {
  let isObservations = isObservationsCheck(appStore);
  if (isObservations) return;

  let { title, subtitle } = formatTaxonName(selection, appStore);

  // save taxa to store
  let taxon = {
    ...selection,
    title,
    subtitle,
  };

  // remove default taxa
  if (appStore.identificationsApiParams.observation_taxon_id === "0") {
    removeTaxaFromStoreAndMap(appStore);
  }

  appStore.selectedTaxaIdentified = [...appStore.selectedTaxaIdentified, taxon];
  resetPageNumber(appStore);
  appStore.identificationsApiParams = {
    ...appStore.identificationsApiParams,
    taxon_id: addValueToCommaSeparatedString(
      taxon.id,
      appStore.identificationsApiParams.taxon_id,
    ),
  };

  let recordParams = {
    ...appStore.identificationsApiParams,
    taxon_id: taxon.id.toString(),
  };
  await updateCountForOneRecord(
    taxon,
    "selectedTaxaIdentified",
    appStore,
    recordParams,
  );

  await updateCountForAll("selectedTaxaIdentified", appStore);
  renderSelectedResources(appStore, true);
}

export function showHideTaxaIdentifiedHeader() {
  showHideHeader(
    "#sidebar-menu .taxa-identified-heading",
    "selectedTaxaIdentified",
  );
}

export function renderTaxaIdentifiedList(appStore: AppStoreType) {
  let listEl = document.querySelector("#selected-species-identified-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedTaxaIdentified.forEach((taxon) => {
    let templateEl = document.createElement("species-basic-list-item");
    templateEl.dataset.taxon = JSON.stringify(taxon);
    templateEl.dataset.type = "taxonIdentified";
    listEl.appendChild(templateEl);
  });
}

// called when user deletes a taxon
export async function removeTaxonIdentified(
  taxonId: number,
  appStore: AppStoreType,
) {
  removeOneTaxonIdentifiedFromStore(appStore, taxonId);

  // if no selected taxa, load allTaxaRecord
  if (appStore.selectedTaxa.length === 0) {
    await addDefaultTaxaRecordToStore(appStore);
    await addDefaultTaxaRecordToMap(appStore);
  }

  await updateCountForAll("all", appStore);
  renderSelectedResources(appStore, true);
}

export function removeOneTaxonIdentifiedFromStore(
  appStore: AppStoreType,
  taxonId: number,
) {
  appStore.selectedTaxaIdentified = appStore.selectedTaxaIdentified.filter(
    (taxon) => taxon.id !== taxonId,
  );
  resetPageNumber(appStore);
  removeIdfromInatApiParams(appStore, "selectedTaxaIdentified", taxonId);
}
