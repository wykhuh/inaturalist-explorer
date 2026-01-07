import autoComplete from "@tarekraafat/autocomplete.js";

import type {
  NormalizediNatTaxonType,
  AutoCompleteEventType,
  AppStoreType,
} from "../types/app.d.ts";
import { autocomplete_taxa_api } from "../lib/inat_api.ts";
import type { iNatAutocompleteTaxaAPI } from "../types/inat_api";
import { loggerUrl } from "../lib/logger.ts";
import {
  addDefaultTaxaRecordToMap,
  addDefaultTaxaRecordToStore,
  addValueToCommaSeparatedString,
  fetchiNatMapDataForTaxon,
  formatTaxonName,
  getResourceApiParams,
  isIdentificationsCheck,
  isObservationsCheck,
  removeOneTaxonFromStoreAndMap,
  removeTaxaFromStoreAndMap,
  resetPageNumber,
} from "./data_utils.ts";
import { updateCountForOne, updateCountForAll } from "./count_utils.ts";
import { renderTaxonNames } from "./render_utils";
import { defaultColorScheme, getColor } from "./map_colors_utils.ts";
import { renderSelectedResources, showHideHeader } from "./search_utils.ts";

export function setupTaxaSearch(selector: string, appStore: AppStoreType) {
  const autoCompleteTaxaJS = new autoComplete({
    autocomplete: "off",
    selector: selector,
    placeHolder: "Enter species name",
    threshold: 2,
    searchEngine: (query: string, record: NormalizediNatTaxonType) => {
      return renderAutocompleteTaxon(record, query, appStore);
    },
    data: {
      src: async (query: string) => {
        try {
          let url = `${autocomplete_taxa_api}&per_page=50&q=${query}`;
          if (appStore.observationsApiParams.locale) {
            url += `&locale=${appStore.observationsApiParams.locale}`;
          }
          loggerUrl(url);
          let res = await fetch(url);
          let data = (await res.json()) as iNatAutocompleteTaxaAPI;
          return processAutocompleteTaxa(data, query, appStore);
        } catch (error) {
          console.error("setupTaxaSearch ERROR:", error);
        }
      },
    },
    resultsList: {
      maxResults: 50,
    },
    events: {
      input: {
        selection: (event: AutoCompleteEventType) => {
          const selection = event.detail.selection
            .value as NormalizediNatTaxonType;
          autoCompleteTaxaJS.input.value = selection.title;
        },
      },
    },
  });

  return autoCompleteTaxaJS;
}

export function processAutocompleteTaxa(
  response: iNatAutocompleteTaxaAPI,
  query: string,
  appStore: AppStoreType,
): NormalizediNatTaxonType[] {
  let taxa = response.results.map((result) => {
    let data: NormalizediNatTaxonType = {
      name: result.name,
      default_photo: result.default_photo?.square_url,
      preferred_common_name: result.preferred_common_name,
      matched_term: result.matched_term,
      rank: result.rank,
      id: result.id,
    };
    let { title, subtitle } = formatTaxonName(data, appStore, query);
    // title is the value shown in the input
    data.title = title || subtitle;

    return data;
  });

  return taxa;
}

export function renderAutocompleteTaxon(
  item: NormalizediNatTaxonType,
  inputValue: string,
  appStore: AppStoreType,
): string {
  let html = `
  <div class="taxa-ac-option" data-testid="taxa-ac-option">
    <div class="thumbnail">`;

  if (item.default_photo) {
    html += `
      <img class="thumbnail" src="${item.default_photo}" alt="">`;
  } else {
  }

  let url = undefined;
  html += `
    </div>
    <div class="taxon-name">
      ${renderTaxonNames(item, appStore, url, inputValue, false)}
    </div>
  </div>`;

  return html;
}

// called by autocomplete search when an taxa option is selected
export async function taxonSelectedHandler(
  selection: NormalizediNatTaxonType,
  _searchTerm: string,
  appStore: AppStoreType,
) {
  let isObservations = isObservationsCheck(appStore);
  let isIdentifications = isIdentificationsCheck(appStore);

  let resourceApiParams = getResourceApiParams(isObservations);

  // remove all taxa if allTaxaRecord is the current taxon
  if (isObservations) {
    if (appStore.observationsApiParams.taxon_id === "0") {
      removeTaxaFromStoreAndMap(appStore);
    }
  } else if (isIdentifications) {
    if (appStore.identificationsApiParams.observation_taxon_id === "0") {
      removeTaxaFromStoreAndMap(appStore);
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

  appStore.selectedTaxa = [...appStore.selectedTaxa, taxon];

  if (isObservations) {
    resetPageNumber(appStore);
    appStore.observationsApiParams = {
      ...appStore.observationsApiParams,
      taxon_id: addValueToCommaSeparatedString(
        taxon.id,
        appStore.observationsApiParams.taxon_id,
      ),
      colors: addValueToCommaSeparatedString(
        taxon.color,
        appStore.observationsApiParams.colors,
      ),
    };
  } else if (isIdentifications) {
    resetPageNumber(appStore);
    appStore.identificationsApiParams = {
      ...appStore.identificationsApiParams,
      observation_taxon_id: addValueToCommaSeparatedString(
        taxon.id,
        appStore.identificationsApiParams.observation_taxon_id,
      ),
    };
  }
  appStore.color = color;

  await fetchiNatMapDataForTaxon(taxon, appStore);

  let recordParams = {};
  if (isObservations) {
    recordParams = {
      ...appStore[resourceApiParams],
      taxon_id: taxon.id.toString(),
    };
  } else if (isIdentifications) {
    recordParams = {
      ...appStore[resourceApiParams],
      observation_taxon_id: taxon.id.toString(),
    };
  }

  await updateCountForOne(taxon, "selectedTaxa", appStore, recordParams);
  await updateCountForAll("selectedTaxa", appStore);
  renderSelectedResources(appStore, true);
}

export function showHideTaxaHeader() {
  showHideHeader("#sidebar-menu .taxa-heading", "selectedTaxa");
}

export function renderTaxaList(appStore: AppStoreType) {
  let listEl = document.querySelector("#selected-species-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedTaxa.forEach((taxon) => {
    let templateEl = document.createElement("species-list-item");
    templateEl.dataset.taxon = JSON.stringify(taxon);
    listEl.appendChild(templateEl);
  });
}

// called when user deletes a taxon
export async function removeTaxon(taxonId: number, appStore: AppStoreType) {
  removeOneTaxonFromStoreAndMap(appStore, taxonId);

  // if no selected taxa, load allTaxaRecord
  if (isObservationsCheck(appStore)) {
    if (appStore.selectedTaxa.length === 0) {
      await addDefaultTaxaRecordToStore(appStore);
      await addDefaultTaxaRecordToMap(appStore);
    }
  } else if (isIdentificationsCheck(appStore)) {
    if (
      appStore.selectedTaxa.length === 0 &&
      appStore.selectedTaxaIdentified.length === 0
    ) {
      await addDefaultTaxaRecordToStore(appStore);
      await addDefaultTaxaRecordToMap(appStore);
    }
  }

  await updateCountForAll("all", appStore);
  renderSelectedResources(appStore, true);
}
