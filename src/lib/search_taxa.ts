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
import { renderTaxonNames } from "./render_utils";
import { defaultColorScheme, getColor } from "./map_colors_utils.ts";
import {
  updateCountForAllPlaces,
  updateCountForAllProjects,
  renderSelectedResources,
  updateCountForAllUsers,
} from "./search_utils.ts";

export function setupTaxaSearch(selector: string, appStore: MapStore) {
  const autoCompleteTaxaJS = new autoComplete({
    autocomplete: "off",
    selector: selector,
    placeHolder: "Enter species name",
    threshold: 2,
    searchEngine: (query: string, record: NormalizediNatTaxon) => {
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
  appStore: MapStore,
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
    let { title, subtitle } = formatTaxonName(data, appStore, query);
    // title is the value shown in the input
    data.title = title || subtitle;

    return data;
  });

  return taxa;
}

export function renderAutocompleteTaxon(
  item: NormalizediNatTaxon,
  inputValue: string,
  appStore: MapStore,
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
  selection: NormalizediNatTaxon,
  _searchTerm: string,
  appStore: MapStore,
) {
  // remove all taxa if allTaxaRecord is the current taxon
  if (appStore.observationsApiParams.taxon_id === "0") {
    removeTaxaFromStoreAndMap(appStore);
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
  appStore.color = color;

  // create params for the iNat map tiles API
  let paramsTemp = {
    ...appStore.observationsApiParams,
    taxon_id: taxon.id.toString(),
    colors: color,
  };
  await fetchiNatMapDataForTaxon(taxon, appStore, paramsTemp);
  await getObservationsCountForTaxon(taxon, appStore, paramsTemp);
  await updateCountForAllPlaces(appStore);
  await updateCountForAllProjects(appStore);
  await updateCountForAllUsers(appStore);

  renderSelectedResources(appStore);
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
  await updateCountForAllProjects(appStore);
  await updateCountForAllUsers(appStore);

  renderSelectedResources(appStore);
}
