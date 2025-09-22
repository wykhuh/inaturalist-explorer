import autoComplete from "@tarekraafat/autocomplete.js";

import type {
  NormalizediNatTaxon,
  AutoCompleteEvent,
  MapStore,
} from "../types/app.d.ts";
import { autocomplete_taxa_api } from "../lib/inat_api.ts";
import type { iNatAutocompleteTaxaAPI } from "../types/inat_api";
import { loggerUrl } from "../lib/logger.ts";
import {
  addAllTaxaRecordToMapAndStore,
  addValueToCommaSeparatedString,
  fetchiNatMapDataForTaxon,
  formatTaxonName,
  getObservationsCountForTaxon,
  removeOneTaxonFromStoreAndMap,
  removeTaxaFromStoreAndMap,
} from "./data_utils.ts";
import { speciesRanks } from "../data/inat_data.ts";
import { updateAppUrl } from "./utils.ts";
import { defaultColorScheme, getColor } from "./map_colors_utils.ts";
import { updateCountForAllPlaces } from "./search_utils.ts";
import { renderPlacesList } from "./search_places.ts";

export function setupTaxaSearch(selector: string) {
  const autoCompleteTaxaJS = new autoComplete({
    autocomplete: "off",
    selector: selector,
    placeHolder: "Enter species name",
    threshold: 2,
    searchEngine: (query: string, record: NormalizediNatTaxon) => {
      return renderAutocompleteTaxon(record, query);
    },
    data: {
      src: async (query: string) => {
        try {
          let url = `${autocomplete_taxa_api}&per_page=50&q=${query}`;
          loggerUrl(url);
          let res = await fetch(url);
          let data = (await res.json()) as iNatAutocompleteTaxaAPI;
          return processAutocompleteTaxa(data, query);
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
        selection: (event: AutoCompleteEvent) => {
          const selection = event.detail.selection.value as NormalizediNatTaxon;
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
): NormalizediNatTaxon[] {
  let taxa = response.results.map((result) => {
    let data: NormalizediNatTaxon = {
      name: result.name,
      default_photo: result.default_photo?.square_url,
      preferred_common_name: result.preferred_common_name,
      matched_term: result.matched_term,
      rank: result.rank,
      id: result.id,
    };
    let { title } = formatTaxonName(data, query);
    // title is the value shown in the input
    data.title = title;

    return data;
  });

  return taxa;
}

export function renderAutocompleteTaxon(
  item: NormalizediNatTaxon,
  inputValue: string,
): string {
  let { title, titleAriaLabel, subtitle, subtitleAriaLabel, hasCommonName } =
    formatTaxonName(item, inputValue);

  let html = `
  <div class="taxa-ac-option" data-testid="taxa-ac-option">
    <div class="thumbnail">`;

  if (item.default_photo) {
    html += `
      <img class="thumbnail" src="${item.default_photo}" alt="">`;
  }

  html += `
    </div>
    <div class="taxon-name">
      <span class="title" aria-label="${titleAriaLabel}">${title}</span>
      <span>`;
  if ((item.rank && !speciesRanks.includes(item.rank)) || !hasCommonName) {
    html += `
        <span class="rank" aria-label="taxon rank">${item.rank}</span>`;
  }
  if (hasCommonName) {
    html += `
        <span class="subtitle" aria-label="${subtitleAriaLabel}">${subtitle}</span>`;
  }
  html += `
      </span>
    </div>
  </div>`;

  return html;
}

// called by autocomplete search when an taxa option is selected
export async function taxonSelectedHandler(
  selection: NormalizediNatTaxon,
  searchTerm: string,
  appStore: MapStore,
) {
  // remove all taxa if allTaxaRecord is the current taxon
  if (appStore.inatApiParams.taxon_id === "0") {
    removeTaxaFromStoreAndMap(appStore);
  }

  // get display name for taxon without match term
  delete selection.matched_term;
  let { title, subtitle } = formatTaxonName(selection, searchTerm, false);
  let color = getColor(appStore, defaultColorScheme);

  // save taxa to store
  let taxon = {
    ...selection,
    title,
    subtitle,
    color,
    display_name: title,
  };

  appStore.selectedTaxa = [...appStore.selectedTaxa, taxon];
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    taxon_id: addValueToCommaSeparatedString(
      taxon.id,
      appStore.inatApiParams.taxon_id,
    ),
    colors: addValueToCommaSeparatedString(
      taxon.color,
      appStore.inatApiParams.colors,
    ),
  };
  appStore.color = color;

  // create params for the iNat map tiles API
  let paramsTemp = {
    ...appStore.inatApiParams,
    taxon_id: taxon.id.toString(),
    colors: color,
  };

  await fetchiNatMapDataForTaxon(taxon, appStore, paramsTemp);
  await getObservationsCountForTaxon(taxon, appStore, paramsTemp);
  await updateCountForAllPlaces(appStore);

  renderTaxaList(appStore);
  renderPlacesList(appStore);
  updateAppUrl(window.location, appStore);
  window.dispatchEvent(new Event("observationsChange"));
}

export function renderTaxaList(appStore: MapStore) {
  let listEl = document.querySelector("#selected-species-list");
  if (!listEl) return;

  listEl.innerHTML = "";
  appStore.selectedTaxa.forEach((taxon) => {
    let templateEl = document.createElement("x-species-list-item");
    templateEl.dataset.taxon = JSON.stringify(taxon);
    listEl.appendChild(templateEl);
  });
}

// called when user deletes a taxon
export async function removeTaxon(taxonId: number, appStore: MapStore) {
  removeOneTaxonFromStoreAndMap(appStore, taxonId);

  // if no selected taxa, load allTaxaRecord
  if (appStore.selectedTaxa.length === 0) {
    await addAllTaxaRecordToMapAndStore(appStore);
  }
  await updateCountForAllPlaces(appStore);

  renderTaxaList(appStore);
  renderPlacesList(appStore);
  updateAppUrl(window.location, appStore);
  window.dispatchEvent(new Event("observationsChange"));
}
