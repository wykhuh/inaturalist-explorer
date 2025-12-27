import type { NormalizediNatTaxonType, AppStoreType } from "../types/app.d.ts";
import {
  addDefaultTaxaRecordToMap,
  addDefaultTaxaRecordToStore,
  addValueToCommaSeparatedString,
  formatTaxonName,
  isObservationsCheck,
  removeOneTaxonIdentifiedFromStore,
  removeTaxaFromStoreAndMap,
  resetPageNumber,
} from "./data_utils.ts";
import { renderSelectedResources } from "./search_utils.ts";
import { setupTaxaSearch } from "./search_taxa.ts";
import { updateCountForAll, updateCountForOne } from "./count_utils.ts";

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
  await updateCountForOne(
    taxon,
    "selectedTaxaIdentified",
    appStore,
    recordParams,
  );

  await updateCountForAll("selectedTaxaIdentified", appStore);
  renderSelectedResources(appStore, true);
}

export function renderTaxaIdentifiedList(appStore: AppStoreType) {
  let listEl = document.querySelector("#selected-species-identified-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedTaxaIdentified.forEach((taxon) => {
    let templateEl = document.createElement("species-identified-list-item");
    templateEl.dataset.taxon = JSON.stringify(taxon);
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
