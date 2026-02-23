import autoComplete from "@tarekraafat/autocomplete.js";

import type {
  AutoCompleteEventType,
  NormalizedObservatFieldType,
} from "../types/app.d.ts";
import { autocomplete_observation_fields_api } from "../lib/inat_api.ts";
import type { iNatObservatFieldsAPI } from "../types/inat_api";
import { loggerEvent, loggerUrl } from "../lib/logger.ts";
import type { AppStoreType } from "../types/app";
import { isObservationsCheck, resetPageNumber } from "./data_utils.ts";
import { updateCountForAll } from "./count_utils.ts";
import {
  updateTilesForSelectedTaxa,
  renderSelectedResources,
} from "./search_utils.ts";
import { pluralize } from "./utils.ts";
import { processFiltersForm } from "../components/ObservationsFilters/utils.ts";
import { renderSelectedFiltersList } from "../components/ObservationsFilters/shared_utils.ts";

export function setupObservationFieldsSearch(selector: string) {
  const autoCompleteObservationFieldsJS = new autoComplete({
    autocomplete: "off",
    selector: selector,
    placeHolder: "Enter observation field",
    threshold: 2,
    searchEngine: (_query: string, record: NormalizedObservatFieldType) => {
      return renderAutocompleteObservationField(record);
    },
    data: {
      src: async (query: string) => {
        try {
          let url = `${autocomplete_observation_fields_api}per_page=100&q=${query}`;
          loggerUrl(url);
          let res = await fetch(url);
          let data = (await res.json()) as iNatObservatFieldsAPI;
          return processAutocompleteObservationField(data);
        } catch (error) {
          console.error("setupObservationFieldsSearch ERROR:", error);
        }
      },
    },
    resultsList: {
      maxResults: 100,
    },
    events: {
      input: {
        selection: (event: AutoCompleteEventType) => {
          const selection = event.detail.selection
            .value as NormalizedObservatFieldType;
          autoCompleteObservationFieldsJS.input.value = selection.name;
        },
      },
    },
  });

  return autoCompleteObservationFieldsJS;
}

export function processAutocompleteObservationField(
  data: iNatObservatFieldsAPI,
): NormalizedObservatFieldType[] {
  return data.results.map((item) => {
    return {
      name: item.name,
      description: `${item.description} Allowed values: ${item.allowed_values}`,
      datatype: item.datatype,
      count: item.values_count,
    };
  });
}

export function renderAutocompleteObservationField(
  item: NormalizedObservatFieldType,
): string {
  let html = `
  <div class="observation-field-ac-option" data-testid="observation-field-ac-option">
    ${item.name} (${pluralize(item.count, "observation")} )
  </div>`;

  return html;
}

// called by autocomplete search when an option is selected
export async function observationFieldSelectedHandler(
  selection: NormalizedObservatFieldType,
  _query: string,
  appStore: AppStoreType,
) {
  let isObservations = isObservationsCheck(appStore);
  if (!isObservations) return;

  loggerEvent(
    "[ObservationFieldsSearch dispatchEvent] observationFieldSelected",
  );
  window.dispatchEvent(
    new CustomEvent("observationFieldSelected", {
      detail: {
        selection,
      },
    }),
  );

  let field = selection;

  // add field to store
  resetPageNumber(appStore);

  appStore.observationsApiParams = {
    ...appStore.observationsApiParams,
    [`field:${field.name}`]: "",
  };

  await updateTilesForSelectedTaxa(appStore);
  await updateCountForAll("all", appStore);

  // add observation field to filters list shown in filters modal
  const form = document.querySelector("#filters-form") as HTMLFormElement;
  if (form) {
    const data = new FormData(form);
    let results = processFiltersForm(data);
    renderSelectedFiltersList(results.params);
  }

  renderSelectedResources(appStore, true);
}
