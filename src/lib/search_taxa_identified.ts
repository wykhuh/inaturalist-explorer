import type { NormalizediNatTaxon, MapStore } from "../types/app.d.ts";
import {
  addValueToCommaSeparatedString,
  formatTaxonName,
  removeOneTaxonIdentifiedFromStore,
} from "./data_utils.ts";
import { renderSelectedResources } from "./search_utils.ts";
import { setupTaxaSearch } from "./search_taxa.ts";
import { updateCountForAll } from "./count_utils.ts";

export function setupTaxaIdentifiedSearch(
  selector: string,
  appStore: MapStore,
) {
  const autoCompleteTaxaJS = setupTaxaSearch(selector, appStore);

  return autoCompleteTaxaJS;
}

// called by autocomplete search when an taxa option is selected
export async function taxonIdentifiedSelectedHandler(
  selection: NormalizediNatTaxon,
  _searchTerm: string,
  appStore: MapStore,
) {
  let { title, subtitle } = formatTaxonName(selection, appStore);

  // save taxa to store
  let taxon = {
    ...selection,
    title,
    subtitle,
  };

  appStore.selectedTaxaIdentified = [...appStore.selectedTaxaIdentified, taxon];
  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    taxon_id: addValueToCommaSeparatedString(
      taxon.id,
      appStore.observationsApiParams.taxon_id,
    ),
  };

  await updateCountForAll("selectedTaxaIdentified", appStore);

  renderSelectedResources(appStore);
}

export function renderTaxaIdentifiedList(appStore: MapStore) {
  let listEl = document.querySelector("#selected-species-identified-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedTaxaIdentified.forEach((taxon) => {
    let templateEl = document.createElement("species-list-item");
    templateEl.dataset.taxon = JSON.stringify(taxon);
    templateEl.dataset.taxon_type = "identified";
    listEl.appendChild(templateEl);
  });
}

// called when user deletes a taxon
export async function removeTaxonIdentified(
  taxonId: number,
  appStore: MapStore,
) {
  removeOneTaxonIdentifiedFromStore(appStore, taxonId);

  await updateCountForAll("selectedTaxaIdentified", appStore);

  renderSelectedResources(appStore);
}
