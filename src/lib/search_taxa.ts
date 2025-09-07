import autoComplete from "@tarekraafat/autocomplete.js";

import "../assets/autocomplete.css";
import "../components/TaxaListItem/component.ts";
import "../components/PlacesListItem/component.ts";
import "../components/ProjectsListItem/component.ts";
import "../components/UsersListItem/component.ts";
import "../components/ObservationsFilters/component.ts";
import type { NormalizediNatTaxon, AutoCompleteEvent } from "../types/app.d.ts";
import {
  processAutocompleteTaxa,
  renderAutocompleteTaxon,
  taxonSelectedHandler,
} from "../lib/autocomplete_utils.ts";
import { autocomplete_taxa_api } from "../lib/inat_api.ts";
import type { iNatTaxaAPI } from "../types/inat_api";

import { loggerUrl } from "../lib/logger.ts";

export function renderTaxaSearch() {
  const autoCompleteTaxaJS = new autoComplete({
    autocomplete: "off",
    selector: "#inatTaxaAutoComplete",
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
          console.error(error);
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
}

let taxaSearchEl = document.querySelector("#inatTaxaAutoComplete");
if (taxaSearchEl) {
  taxaSearchEl.addEventListener("selection", async function (event: any) {
    let selection = event.detail.selection.value;
    await taxonSelectedHandler(selection, event.detail.query, window.app.store);
  });
}
