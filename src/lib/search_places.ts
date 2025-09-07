import autoComplete from "@tarekraafat/autocomplete.js";

import "../assets/autocomplete.css";
import "../components/TaxaListItem/component.ts";
import "../components/PlacesListItem/component.ts";
import "../components/ProjectsListItem/component.ts";
import "../components/UsersListItem/component.ts";
import "../components/ObservationsFilters/component.ts";
import type { AutoCompleteEvent, NormalizediNatPlace } from "../types/app.d.ts";
import {
  processAutocompletePlaces,
  renderAutocompletePlace,
  placeSelectedHandler,
} from "../lib/autocomplete_utils.ts";
import { autocomplete_places_api } from "../lib/inat_api.ts";
import type { iNatSearchAPI } from "../types/inat_api";

import { loggerUrl } from "../lib/logger.ts";

export function renderPlacesSearch() {
  const autoCompletePlacesJS = new autoComplete({
    autocomplete: "off",
    selector: "#inatPlacesSearch",
    placeHolder: "Enter place name",
    threshold: 2,
    searchEngine: (_query: string, record: NormalizediNatPlace) => {
      return renderAutocompletePlace(record);
    },
    data: {
      src: async (query: string) => {
        try {
          let url = `${autocomplete_places_api}&per_page=50&q=${query}`;
          loggerUrl(url);
          let res = await fetch(url);
          let data = (await res.json()) as iNatSearchAPI;
          return processAutocompletePlaces(data);
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
          const selection = event.detail.selection.value as NormalizediNatPlace;
          autoCompletePlacesJS.input.value = selection.display_name;
        },
      },
    },
  });
}

let placesSearchEl = document.querySelector("#inatPlacesSearch");
if (placesSearchEl) {
  placesSearchEl.addEventListener("selection", async function (event: any) {
    let selection = event.detail.selection.value;
    await placeSelectedHandler(selection, event.detail.query, window.app.store);
  });
}
