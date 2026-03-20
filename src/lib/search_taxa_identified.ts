import type {
  NormalizediNatTaxonType,
  AppStoreType,
  DataComponentType,
} from "../types/app.d.ts";
import {
  addDefaultTaxonToStoreAndMap,
  addValueToCommaSeparatedString,
  formatTaxonName,
  isIdentificationsCheck,
  isObservationsCheck,
  removeDefaultTaxonFromStoreAndMap,
  removeIdfromInatApiParams,
  resetPageNumber,
} from "./data_utils.ts";
import {
  renderSelectedResources,
  showHideHeader,
  updateTilesForSelectedTaxaIdentified,
} from "./search_utils.ts";
import { setupTaxaSearch } from "./search_taxa.ts";
import { updateCountForAll, updateCountForOneRecord } from "./count_utils.ts";
import { defaultColorScheme, getColor } from "./map_colors_utils.ts";

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
  let isIdentifications = isIdentificationsCheck(appStore);

  // remove default taxon
  if (isIdentifications) {
    if (appStore.identificationsApiParams.taxon_id === "0") {
      removeDefaultTaxonFromStoreAndMap(appStore);
    }
  }

  let { title, subtitle } = formatTaxonName(selection, appStore);
  let color = getColor(appStore, defaultColorScheme);

  // save taxa to store
  let taxon = {
    ...selection,
    title,
    subtitle,
    color,
  };

  appStore.selectedTaxaIdentified = [...appStore.selectedTaxaIdentified, taxon];
  resetPageNumber(appStore);

  let recordParams;
  if (isObservations) {
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      ident_taxon_id: addValueToCommaSeparatedString(
        taxon.id,
        appStore.observationsApiParams.ident_taxon_id,
      ),
    };

    recordParams = {
      ...appStore.observationsApiParams,
      ident_taxon_id: taxon.id.toString(),
    };
  } else {
    appStore.identificationsApiParams = {
      ...appStore.identificationsApiParams,
      taxon_id: addValueToCommaSeparatedString(
        taxon.id,
        appStore.identificationsApiParams.taxon_id,
      ),
      colors: addValueToCommaSeparatedString(
        taxon.color,
        appStore.identificationsApiParams.colors,
      ),
    };

    recordParams = {
      ...appStore.identificationsApiParams,
      taxon_id: taxon.id.toString(),
    };
  }
  appStore.color = color;

  await updateCountForOneRecord(
    taxon,
    "selectedTaxaIdentified",
    appStore,
    recordParams,
  );
  await updateTilesForSelectedTaxaIdentified(appStore);
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
    let element = isObservationsCheck(appStore)
      ? "species-basic-list-item"
      : "species-list-item";

    let templateEl = document.createElement(element) as DataComponentType;
    templateEl.data = taxon;
    templateEl.type = "taxonIdentified";
    listEl.appendChild(templateEl);
  });
}

// called when user deletes a taxon
export async function removeTaxonIdentified(
  taxonId: number,
  appStore: AppStoreType,
) {
  removeOneTaxonIdentifiedFromMap(appStore, taxonId);
  removeOneTaxonIdentifiedFromStore(appStore, taxonId);

  // if no selected taxa, load allTaxaRecord
  if (
    isIdentificationsCheck(appStore) &&
    appStore.selectedTaxaIdentified.length === 0
  ) {
    await addDefaultTaxonToStoreAndMap(appStore);
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

export function removeOneTaxonIdentifiedFromMap(
  appStore: AppStoreType,
  taxonId: number,
) {
  if (!appStore.taxaIdentifiedMapLayers) return;
  let mapLayers = appStore.taxaIdentifiedMapLayers[taxonId];
  if (!mapLayers) return;
  let layerControl = appStore.map.layerControl;
  if (!layerControl) return;

  mapLayers.forEach((layer) => {
    // remove layer from layer control
    layerControl.removeLayer(layer);
    // remove layer from map
    layer.remove();
  });

  delete appStore.taxaIdentifiedMapLayers[taxonId];
  // HACK: trigger change in proxy store
  appStore.taxaIdentifiedMapLayers = appStore.taxaIdentifiedMapLayers;
}
