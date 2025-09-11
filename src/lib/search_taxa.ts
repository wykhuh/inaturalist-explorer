import autoComplete from "@tarekraafat/autocomplete.js";

import type {
  NormalizediNatTaxon,
  AutoCompleteEvent,
  MapStore,
} from "../types/app.d.ts";
import { autocomplete_taxa_api } from "../lib/inat_api.ts";
import type { iNatTaxaAPI } from "../types/inat_api";
import { loggerUrl } from "../lib/logger.ts";
import {
  addAllTaxaRecordToMapAndStore,
  fetchiNatMapDataForTaxon,
  formatTaxonName,
  getObservationsCountForTaxon,
  removeOneTaxonFromStoreAndMap,
  removeTaxaFromStoreAndMap,
} from "./data_utils.ts";
import { speciesRanks } from "./inat_data.ts";
import { renderPlacesList } from "./search_places.ts";
import { updateUrl } from "./utils.ts";
import { defaultColorScheme, getColor } from "./map_colors_utils.ts";

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
          let data = (await res.json()) as iNatTaxaAPI;
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
  response: iNatTaxaAPI,
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
    let { title, subtitle } = formatTaxonName(data, query);
    data.title = title;
    data.subtitle = subtitle;

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
  taxonObj: NormalizediNatTaxon,
  searchTerm: string,
  appStore: MapStore,
) {
  let map = appStore.map.map;
  let layerControl = appStore.map.layerControl;
  if (map === null) return;
  if (layerControl === null) return;

  // get color for taxon
  let color = getColor(appStore, defaultColorScheme);
  taxonObj.color = color;

  // remove all taxa if allTaxaRecord is the current taxon
  if (appStore.inatApiParams.taxon_id === "0") {
    removeTaxaFromStoreAndMap(appStore);
  }

  // get display name for taxon
  let { title, subtitle } = formatTaxonName(taxonObj, searchTerm, false);
  taxonObj.display_name = title;
  taxonObj.title = title;
  taxonObj.subtitle = subtitle;

  // create params for the iNat map tiles API
  appStore.inatApiParams = {
    ...appStore.inatApiParams,
    taxon_id: taxonObj.id.toString(),
    colors: color,
  };

  await fetchiNatMapDataForTaxon(taxonObj, appStore);
  await getObservationsCountForTaxon(taxonObj, appStore);

  renderTaxaList(appStore);
  renderPlacesList(appStore);
  updateUrl(window.location, appStore);
}

export function renderTaxaList(appStore: MapStore) {
  let listEl = document.querySelector("#taxa-list-container");
  if (!listEl) return;

  listEl.innerHTML = "";

  appStore.selectedTaxa.forEach((taxon) => {
    let templateEl = document.createElement("x-taxa-list-item");
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

  renderTaxaList(appStore);
  renderPlacesList(appStore);
  updateUrl(window.location, appStore);
}
